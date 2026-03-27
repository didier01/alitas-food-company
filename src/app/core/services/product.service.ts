import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { Combo } from '../models/combo.model';
import { environment } from '../../../environments/environment';
import { ComboService } from './combo.service';
import { Observable, map, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private comboService = inject(ComboService);
  private apiUrl = environment.apiUrl;

  // Signals for the public site
  categoryFilter = signal<string>('all');
  searchFilter = signal<string>('');

  // Raw lists
  allProducts = signal<Product[]>([]);
  allCombos = signal<Combo[]>([]);

  // Computed signal that returns filtered products + combos
  filteredMenu = computed(() => {
    const products = this.allProducts().filter(p => p.available);
    const combosAsProducts = this.allCombos()
      .filter(c => c.active)
      .map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        price: c.price,
        imageUrl: c.imageUrl,
        categoryId: 'cat-5', // ID Hardcoded for Combos
        available: true,
        featured: false,
        // Extend with optional properties to pass them to component
        realPrice: this.allProducts().reduce((acc, p) => {
          const match = c.includedProducts?.find(ip => ip.id === p.id);
          return acc + (match ? p.price * match.quantity : 0);
        }, 0),
        showSavings: c.showSavings
      } as Product));

    let combined: Product[] = [];
    const filter = this.categoryFilter();

    if (filter === 'all') {
      combined = [...products, ...combosAsProducts];
    } else if (filter === 'cat-5') {
      combined = combosAsProducts;
    } else {
      combined = products.filter(p => p.categoryId === filter);
    }

    // Filter by text
    if (this.searchFilter().trim() !== '') {
      const term = this.searchFilter().toLowerCase();
      combined = combined.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }

    return combined;
  });

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getByCategory(categoryId: string): Observable<Product[]> {
    return this.getAll().pipe(
      map(prods => prods.filter(p => p.categoryId === categoryId))
    );
  }

  // Load data into local signals
  loadProductsInSignal(): void {
    forkJoin({
      products: this.getAll(),
      combos: this.comboService.getAll()
    }).subscribe(data => {
      this.allProducts.set(data.products);
      this.allCombos.set(data.combos);
    });
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  update(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${product.id}`, product);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }
}
