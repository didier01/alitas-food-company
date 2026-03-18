import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzDrawerModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzSelectModule, NzSwitchModule, NzPopconfirmModule, NzTagModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit {
  productoService = inject(ProductoService);
  categoriaService = inject(CategoriaService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);
  cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  catFilter: string | null = null;
  loadingData = signal(true);
  loadingAction = signal(false);
  drawerVisible = signal(false);
  editingId: string | null = null;
  prodForm: FormGroup;

  constructor() {
    this.prodForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      imagenUrl: ['', Validators.required],
      categoriaId: [null, Validators.required],
      disponible: [true],
      destacado: [false],
      alergenos: [[]],
      personalizaciones: [[]]
    });
  }

  ngOnInit() {
    this.loadAllData()
  }

  loadAllData() {
    this.loadingData.set(true);
    forkJoin({
      prods: this.productoService.getAll(),
      cats: this.categoriaService.getAll()
    }).subscribe({
      next: (data) => {
        this.productos = data.prods;
        this.categorias = data.cats;
        this.loadProductos();
        // Allow a small delay for the UI to settle before hiding spinner
        this.loadingData.set(false);

      },
      error: () => {
        this.message.error('Error cargando catálogo');
        this.loadingData.set(false);

      }
    });
  }

  loadProductos() {
    if (this.catFilter) {
      this.productosFiltrados = this.productos.filter(p => p.categoriaId === this.catFilter);
    } else {
      this.productosFiltrados = [...this.productos];
    }
  }

  getCategoriaName(catId: string): string {
    const cat = this.categorias.find(c => c.id === catId);
    return cat ? cat.nombre : 'Sin Categoria';
  }

  quickToggle(prod: Producto) {
    prod.disponible = !prod.disponible;
    this.productoService.update(prod).subscribe(() => {
      this.message.success(`Producto ${prod.disponible ? 'habilitado' : 'deshabilitado'}`);
    });
  }

  openDrawer() {
    this.editingId = null;
    this.prodForm.reset({ disponible: true, destacado: false, precio: 0, alergenos: [], personalizaciones: [] });
    this.drawerVisible.set(true);
  }

  editProducto(prod: Producto) {
    this.editingId = prod.id;
    this.prodForm.patchValue({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio,
      imagenUrl: prod.imagenUrl,
      categoriaId: prod.categoriaId,
      disponible: prod.disponible,
      destacado: prod.destacado,
      alergenos: prod.alergenos || [],
      personalizaciones: prod.personalizaciones || []
    });
    this.drawerVisible.set(true);
  }

  closeDrawer() {
    this.drawerVisible.set(false);
    this.prodForm.reset();
  }

  saveProducto() {
    if (this.prodForm.invalid) return;
    this.loadingAction.set(true);

    const formVal = this.prodForm.value;
    const saveObj: Producto = {
      id: this.editingId || `prod-${Date.now()}`,
      nombre: formVal.nombre,
      descripcion: formVal.descripcion,
      precio: formVal.precio,
      imagenUrl: formVal.imagenUrl,
      categoriaId: formVal.categoriaId,
      disponible: formVal.disponible,
      destacado: formVal.destacado,
      alergenos: formVal.alergenos,
      personalizaciones: formVal.personalizaciones
    };

    const targetSub = this.editingId
      ? this.productoService.update(saveObj)
      : this.productoService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success(`Producto ${this.editingId ? 'actualizado' : 'creado'} con éxito`);
        // Actualizamos mock localmente
        if (this.editingId) {
          const idx = this.productos.findIndex(p => p.id === this.editingId);
          if (idx !== -1) this.productos[idx] = saveObj;
        } else {
          this.productos.unshift(saveObj);
        }
        this.loadProductos();
        this.closeDrawer();
        this.loadingAction.set(false);
      },
      error: () => {
        this.message.error('Error al guardar el producto');
        this.loadingAction.set(false);
      }
    });
  }

  deleteProducto(prod: Producto) {
    this.productoService.delete(prod.id).subscribe(() => {
      this.message.success('Producto eliminado');
      this.productos = this.productos.filter(p => p.id !== prod.id);
      this.loadProductos();
    });
  }
}
