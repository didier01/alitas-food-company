import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule, AbstractControl } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ModifierGroup } from '../../../core/models/modifier-group.model';
import { ModifierGroupService } from '../../../core/services/modifier-group.service';
import { Allergen } from '../../../core/models/allergen.model';
import { AllergenService } from '../../../core/services/allergen.service';
import { IngredientService } from '../../../core/services/ingredient.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { forkJoin } from 'rxjs';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzTooltipModule, NzSelectModule, NzSwitchModule, NzPopconfirmModule, NzTagModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  supabaseService = inject(SupabaseService);
  allergenService = inject(AllergenService);
  ingredientService = inject(IngredientService);
  modifierGroupService = inject(ModifierGroupService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);
  cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  allergensList: Allergen[] = [];
  ingredientsList: any[] = [];
  globalModifiersList: ModifierGroup[] = [];
  catFilter: string | null = null;
  loadingData = signal(true);
  loadingAction = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  modalVisible = signal(false);
  editingId: string | null = null;
  prodForm: FormGroup;

  newGroupToAddId: string | null = null;

  constructor() {
    this.prodForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      image_url: [''],
      category_id: [null, Validators.required],
      available: [true],
      featured: [false],
      allergen_ids: [[]],
      ingredient_ids: [[]],
      modifier_groups: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadAllData();
  }

  get modifier_groups_array(): FormArray {
    return this.prodForm.get('modifier_groups') as FormArray;
  }

  getOptionsArray(groupForm: AbstractControl): FormArray {
    return groupForm.get('options') as FormArray;
  }

  addModifierGroup() {
    if (!this.newGroupToAddId) {
      this.message.warning('Por favor selecciona un grupo de la lista.');
      return;
    }

    // Evitar duplicados
    const existing = this.modifier_groups_array.controls.find(c => c.value.group_id === this.newGroupToAddId);
    if (existing) {
      this.message.warning('Este grupo ya ha sido asignado al producto.');
      return;
    }

    const group = this.globalModifiersList.find(g => g.id === this.newGroupToAddId);
    if (!group) return;

    const groupForm = this.fb.group({
      group_id: [group.id],
      name: [group.name, Validators.required],
      min_selection: [0, Validators.required],
      max_selection: [1, Validators.required],
      free_selections: [0], // Modificadores de poductos también pueden tener selecciones gratis
      options: [group.options] // Read-only array of options for preview
    });

    this.modifier_groups_array.push(groupForm);
    this.newGroupToAddId = null;
  }

  removeModifierGroup(index: number) {
    this.modifier_groups_array.removeAt(index);
  }

  loadAllData() {
    this.loadingData.set(true);
    forkJoin({
      prods: this.productService.getAll(),
      cats: this.categoryService.getAll(),
      algs: this.allergenService.getAll(),
      ings: this.ingredientService.getAll(),
      modifiers: this.modifierGroupService.getAll()
    }).subscribe({
      next: (data) => {
        this.products = data.prods;
        this.categories = data.cats;
        this.allergensList = data.algs;
        this.ingredientsList = data.ings;
        this.globalModifiersList = data.modifiers;
        this.loadProducts();
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error cargando catálogo');
        this.loadingData.set(false);
      }
    });
  }

  loadProducts() {
    if (this.catFilter === 'all') {
      this.catFilter = null;
    }
    if (this.catFilter) {
      this.filteredProducts = this.products.filter(p => p.category_id === this.catFilter);
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  getCategoryName(catId: string): string {
    const cat = this.categories.find(c => c.id === catId);
    return cat ? cat.name : 'Sin Category';
  }

  closeModal() {
    this.modalVisible.set(false);
    this.selectedFile = null;
    this.imagePreview = null;
    this.prodForm.reset();
  }

  async saveProduct() {
    if (this.prodForm.invalid) return;
    this.loadingAction.set(true);

    try {
      let finalImageUrl = this.prodForm.get('image_url')?.value;

      if (this.selectedFile) {
        const catId = this.prodForm.get('category_id')?.value;
        const catName = catId ? this.getCategoryName(catId).toLowerCase() : 'extras';
        let folderName = 'extras';
        if (catName.includes('alita')) folderName = 'alitas';
        else if (catName.includes('bebida')) folderName = 'bebidas';

        finalImageUrl = await this.supabaseService.uploadImage(this.selectedFile, folderName);
      }

      if (!finalImageUrl || finalImageUrl.trim() === '') {
        finalImageUrl = 'https://ldxmibnpfapyeqizgyao.supabase.co/storage/v1/object/public/alitas-food-company/info/default-image.webp';
      }

      const formVal = this.prodForm.value;
      const saveObj: any = {
        name: formVal.name,
        description: formVal.description,
        price: formVal.price,
        image_url: finalImageUrl,
        category_id: formVal.category_id,
        available: formVal.available,
        featured: formVal.featured,
        allergen_ids: formVal.allergen_ids,
        ingredient_ids: formVal.ingredient_ids,
        modifier_groups: formVal.modifier_groups
      };

      if (this.editingId) {
        saveObj.id = this.editingId;
      }

      const targetSub = this.editingId
        ? this.productService.update(saveObj)
        : this.productService.create(saveObj);

      targetSub.subscribe({
        next: (savedProd) => {
          this.message.success(`Producto ${this.editingId ? 'actualizado' : 'creado'} con éxito`);
          if (this.editingId) {
            const idx = this.products.findIndex(p => p.id === this.editingId);
            if (idx !== -1) {
              this.products[idx] = savedProd;
              this.products = [...this.products];
            }
          } else {
            this.products = [savedProd, ...this.products];
          }
          this.loadProducts();
          this.closeModal();
          this.loadingAction.set(false);
        },
        error: () => {
          this.message.error('Error al guardar el producto');
          this.loadingAction.set(false);
        }
      });
    } catch (error) {
      console.error(error);
      this.message.error('Error al subir la imagen.');
      this.loadingAction.set(false);
    }
  }

  deleteProduct(prod: Product) {
    this.productService.delete(prod.id).subscribe(() => {
      this.message.success('Product eliminado');
      this.products = this.products.filter(p => p.id !== prod.id);
      this.loadProducts();
    });
  }

  duplicateProduct(prod: Product) {
    this.loadingAction.set(true);

    const duplicateObj: any = {
      name: `${prod.name} (Copia)`,
      description: prod.description,
      price: prod.price,
      image_url: prod.image_url,
      category_id: prod.category_id,
      available: false,
      featured: false,
      allergen_ids: prod.allergen_ids || [],
      ingredient_ids: prod.ingredient_ids || [],
      modifier_groups: prod.modifier_groups ? prod.modifier_groups.map(g => ({ ...g })) : []
    };

    this.productService.create(duplicateObj).subscribe({
      next: (newProd) => {
        this.message.success('Producto duplicado exitosamente');
        this.products = [newProd, ...this.products];
        this.loadProducts();
        this.loadingAction.set(false);
      },
      error: (err) => {
        console.error(err);
        this.message.error('Error al duplicar el producto');
        this.loadingAction.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.prodForm.patchValue({ image_url: 'pending-upload' });
    };
    reader.readAsDataURL(file);
  }


  quickToggle(prod: Product) {
    prod.available = !prod.available;
    this.productService.update(prod).subscribe(() => {
      this.message.success(`Product ${prod.available ? 'habilitado' : 'deshabilitado'}`);
    });
  }

  openModal() {
    this.editingId = null;
    this.prodForm.reset({ available: true, featured: false, price: 0, allergens: [], customizations: [] });
    this.modalVisible.set(true);
  }


  editProduct(prod: Product) {
    this.editingId = prod.id;
    this.prodForm.patchValue({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      image_url: prod.image_url,
      category_id: prod.category_id,
      available: prod.available,
      featured: prod.featured,
      allergen_ids: prod.allergen_ids || [],
      ingredient_ids: prod.ingredient_ids || [],
      modifier_groups: prod.modifier_groups || []
    });
    this.modalVisible.set(true);
  }


}
