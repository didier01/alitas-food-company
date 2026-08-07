import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { Combo } from '../models/combo.model';
import { ComboService } from './combo.service';
import { IngredientService } from './ingredient.service';
import { CategoryService } from './category.service';
import { Ingredient } from '../models/ingredient.model';
import { Category } from '../models/category.model';
import { VenueMenu } from '../models/venue-menu.model';
import { VenueService } from './venue.service';
import { VenueMenuService } from './venue-menu.service';
import { Observable, forkJoin, from, map } from 'rxjs';
import { BaseSupabaseService } from './base-supabase.service';
import { environment } from '../../../environments/environment';
import { effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseSupabaseService<Product> {
  protected override table = 'products';

  private comboService = inject(ComboService);
  private ingredientService = inject(IngredientService);
  private categoryService = inject(CategoryService);
  private venueService = inject(VenueService);
  private venueMenuService = inject(VenueMenuService);

  // Signals for the public site
  categoryFilter = signal<string>('all');
  searchFilter = signal<string>('');
  selectedTags = signal<string[]>([]);
  activeVenueMenu = signal<VenueMenu | null>(null);

  constructor() {
    super();
    // Reactive update of the venue menu when the venue changes
    effect(() => {
      const venue = this.venueService.selectedVenue();
      if (venue) {
        this.venueMenuService.getMenuByVenue(venue.id).subscribe(menu => {
          this.activeVenueMenu.set(menu || null);
        });
      } else {
        this.activeVenueMenu.set(null);
      }
    });
  }

  // Raw lists
  allProducts = signal<Product[]>([]);
  allCombos = signal<Combo[]>([]);
  allIngredients = signal<Ingredient[]>([]);
  allCategories = signal<Category[]>([]);

  // Computed signal that returns filtered products + combos
  filteredMenu = computed(() => {
    const ingredients = this.allIngredients();
    const categories = this.allCategories();

    // Identificar ID de combos dinámicamente (por nombre o propiedad)
    const comboCategory = categories.find(c => c.name.toLowerCase().includes('combo'));
    const comboCatId = comboCategory ? comboCategory.id : '';

    const venueMenu = this.activeVenueMenu();

    const products = this.allProducts()
      .filter(p => {
        // First filter by availability
        if (!p.available) return false;
        // Then filter by venue association if a menu exists
        if (venueMenu && !venueMenu.product_ids?.includes(p.id)) return false;
        return true;
      })
      .map(p => ({
        ...p,
        modifier_groups: p.modifier_groups?.map(group => ({
          ...group,
          options: group.options 
        })).filter(group => group.options && group.options.length > 0),
        isCombo: false
      }));

    // Mapping combos to a product-like interface for the menu display
    const combosAsProducts = this.allCombos()
      .filter(c => {
        if (!c.active) return false;
        if (venueMenu && !venueMenu.combo_ids?.includes(c.id)) return false;
        return true;
      })
      .map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        price: c.price,
        image_url: c.image_url,
        category_id: comboCatId, // ID Dynamic for Combos
        available: true,
        featured: false,
        allergen_ids: c.allergen_ids || [],
        modifier_groups: c.modifier_groups || [],
        realPrice: this.allProducts().reduce((acc, p) => {
          const match = c.included_products?.find(ip => ip.id === p.id);
          return acc + (match ? p.price * match.quantity : 0);
        }, 0),
        show_savings: c.show_savings,
        isCombo: true
      } as any)); 

    let combined: any[] = [];
    const filter = this.categoryFilter();

    if (filter === 'all') {
      combined = [...products, ...combosAsProducts];
    } else if (filter === comboCatId) {
      combined = combosAsProducts;
    } else {
      combined = products.filter(p => p.category_id === filter);
    }

    // Filter by text
    if (this.searchFilter().trim() !== '') {
      const term = this.searchFilter().toLowerCase();
      combined = combined.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    // Filter by tags (AND logic)
    const activeTags = this.selectedTags();
    if (activeTags.length > 0) {
      combined = combined.filter(p => {
        // En los combos no hay tags por ahora, por lo que a menos que implementemos
        // un campo tags en el combo.model, devolverán falso al intentar filtrar.
        const pTags = p.tags || [];
        return activeTags.every(tag => pTags.includes(tag));
      });
    }

    return combined;
  });

  override getAll(): Observable<Product[]> {
    if (environment.useMocks && !this.useRealData) {
      return this.http.get<Product[]>(`/assets/mock/${this.table}.json`);
    }

    const promise = this.supabase.getClient()
      .from(this.table)
      .select(`
        *,
        product_allergens(allergen_id),
        product_ingredients(ingredient_id),
        product_tags(tag),
        product_modifier_groups(
          group_id, min_selection, max_selection, free_selections,
          modifier_groups(
            id, name,
            modifier_group_options(
              option_id,
              modifier_options(*)
            )
          )
        )
      `);

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((p: any) => ({
          ...p,
          allergen_ids: p.product_allergens?.map((pa: any) => pa.allergen_id) || [],
          ingredient_ids: p.product_ingredients?.map((pi: any) => pi.ingredient_id) || [],
          tags: p.product_tags?.map((pt: any) => pt.tag) || [],
          modifier_groups: p.product_modifier_groups?.map((pmg: any) => ({
            group_id: pmg.group_id,
            name: pmg.modifier_groups?.name,
            min_selection: pmg.min_selection,
            max_selection: pmg.max_selection,
            free_selections: pmg.free_selections,
            options: pmg.modifier_groups?.modifier_group_options?.map((mgo: any) => ({
              id: mgo.modifier_options?.id,
              name: mgo.modifier_options?.name,
              price: mgo.modifier_options?.price || 0,
              active: mgo.modifier_options?.active
            })) || []
          })) || []
        })) as Product[];
      })
    );
  }

  override create(item: Product): Observable<Product> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve({ ...item, id: `prod-mock-${Date.now()}` } as Product));
    }

    const { id, allergen_ids, ingredient_ids, allergens, product_allergens, product_ingredients, modifier_groups, product_modifier_groups, tags, product_tags, ...dataToSave } = item as any;

    const promise = this.supabase.getClient()
      .from(this.table)
      .insert(dataToSave)
      .select()
      .single()
      .then(async ({ data: newProduct, error }) => {
        if (error) throw error;

        if (allergen_ids && allergen_ids.length > 0) {
          const paData = allergen_ids.map((aId: string) => ({
            product_id: newProduct.id,
            allergen_id: aId
          }));
          const { error: paError } = await this.supabase.getClient().from('product_allergens').insert(paData);
          if (paError) console.error('Error inserting allergens', paError);
        }

        if (ingredient_ids && ingredient_ids.length > 0) {
          const piData = ingredient_ids.map((iId: string) => ({
            product_id: newProduct.id,
            ingredient_id: iId
          }));
          const { error: piError } = await this.supabase.getClient().from('product_ingredients').insert(piData);
          if (piError) console.error('Error inserting ingredients', piError);
        }

        if (modifier_groups && modifier_groups.length > 0) {
          const mgData = modifier_groups.map((mg: any) => ({
            product_id: newProduct.id,
            group_id: mg.group_id,
            min_selection: mg.min_selection,
            max_selection: mg.max_selection,
            free_selections: mg.free_selections || 0
          }));
          const { error: mgError } = await this.supabase.getClient().from('product_modifier_groups').insert(mgData);
          if (mgError) console.error('Error inserting modifier groups', mgError);
        }

        if (tags && tags.length > 0) {
          const ptData = tags.map((t: string) => ({
            product_id: newProduct.id,
            tag: t
          }));
          const { error: ptError } = await this.supabase.getClient().from('product_tags').insert(ptData);
          if (ptError) console.error('Error inserting tags', ptError);
        }

        return { ...newProduct, allergen_ids, ingredient_ids, modifier_groups, tags } as Product;
      });

    return from(promise);
  }

  override update(item: Product): Observable<Product> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve(item));
    }

    const id = item.id;
    const { allergen_ids, ingredient_ids, allergens, product_allergens, product_ingredients, modifier_groups, product_modifier_groups, tags, product_tags, ...dataToSave } = item as any;

    const promise = this.supabase.getClient()
      .from(this.table)
      .update(dataToSave)
      .eq('id', id)
      .select()
      .single()
      .then(async ({ data: updatedProduct, error }) => {
        if (error) throw error;

        if (allergen_ids !== undefined) {
          await this.supabase.getClient().from('product_allergens').delete().eq('product_id', id);
          if (allergen_ids && allergen_ids.length > 0) {
            const paData = allergen_ids.map((aId: string) => ({
              product_id: id,
              allergen_id: aId
            }));
            const { error: paError } = await this.supabase.getClient().from('product_allergens').insert(paData);
            if (paError) console.error('Error inserting allergens', paError);
          }
        }

        if (ingredient_ids !== undefined) {
          await this.supabase.getClient().from('product_ingredients').delete().eq('product_id', id);
          if (ingredient_ids && ingredient_ids.length > 0) {
            const piData = ingredient_ids.map((iId: string) => ({
              product_id: id,
              ingredient_id: iId
            }));
            const { error: piError } = await this.supabase.getClient().from('product_ingredients').insert(piData);
            if (piError) console.error('Error inserting ingredients', piError);
          }
        }

        if (modifier_groups !== undefined) {
          await this.supabase.getClient().from('product_modifier_groups').delete().eq('product_id', id);
          if (modifier_groups && modifier_groups.length > 0) {
            const mgData = modifier_groups.map((mg: any) => ({
              product_id: id,
              group_id: mg.group_id,
              min_selection: mg.min_selection,
              max_selection: mg.max_selection,
              free_selections: mg.free_selections || 0
            }));
            const { error: mgError } = await this.supabase.getClient().from('product_modifier_groups').insert(mgData);
            if (mgError) console.error('Error inserting modifier groups', mgError);
          }
        }

        if (tags !== undefined) {
          await this.supabase.getClient().from('product_tags').delete().eq('product_id', id);
          if (tags && tags.length > 0) {
            const ptData = tags.map((t: string) => ({
              product_id: id,
              tag: t
            }));
            const { error: ptError } = await this.supabase.getClient().from('product_tags').insert(ptData);
            if (ptError) console.error('Error inserting tags', ptError);
          }
        }

        return { ...updatedProduct, allergen_ids, ingredient_ids, modifier_groups, tags } as Product;
      });

    return from(promise);
  }

  // Load data into local signals
  loadProductsInSignal(): void {
    forkJoin({
      products: this.getAll(),
      combos: this.comboService.getAll(),
      categories: this.categoryService.getAll()
    }).subscribe({
      next: (data) => {
        this.allProducts.set(data.products);
        this.allCombos.set(data.combos);
        this.allCategories.set(data.categories);
        if (this.categoryFilter() === 'all' || !this.categoryFilter()) {
          const comboCategory = data.categories.find(c => c.name.toLowerCase().includes('combo'));
          if (comboCategory) {
            this.categoryFilter.set(comboCategory.id);
          } else if (data.categories.length > 0) {
            this.categoryFilter.set(data.categories[0].id);
          }
        }
      },
      error: (err) => {
        console.error('Error loading public menu data', err);
      }
    });
  }
}
