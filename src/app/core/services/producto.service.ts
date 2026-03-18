import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../models/producto.model';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, switchMap, map } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Signals para el sitio público
  filtroCategoria = signal<string>('todas');
  filtroBusqueda = signal<string>('');
  
  // Lista raw de productos
  allProductos = signal<Producto[]>([]);

  // Computed signal que devuelve productos filtrados
  menuFiltrado = computed(() => {
    let productos = this.allProductos();
    
    // Filtrar por texto
    if (this.filtroBusqueda().trim() !== '') {
      const term = this.filtroBusqueda().toLowerCase();
      productos = productos.filter(p => p.nombre.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term));
    }

    // Filtrar por categoría
    if (this.filtroCategoria() !== 'todas') {
      productos = productos.filter(p => p.categoriaId === this.filtroCategoria());
    }

    // Filtrar ignorando no disponibles en público
    return productos.filter(p => p.disponible);
  });

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  getById(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  getByCategoria(categoriaId: string): Observable<Producto[]> {
    return this.getAll().pipe(
      map(prods => prods.filter(p => p.categoriaId === categoriaId))
    );
  }

  // Carga productos en local signal
  loadProductosEnSignal(): void {
    this.getAll().subscribe(p => this.allProductos.set(p));
  }

  create(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, producto);
  }

  update(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${producto.id}`, producto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`);
  }
}
