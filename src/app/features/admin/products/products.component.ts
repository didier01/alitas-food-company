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
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzDrawerModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzSelectModule, NzSwitchModule, NzPopconfirmModule, NzTagModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);
  cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  catFilter: string | null = null;
  loadingData = signal(true);
  loadingAction = signal(false);
  drawerVisible = signal(false);
  editingId: string | null = null;
  prodForm: FormGroup;

  constructor() {
    this.prodForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      categoryId: [null, Validators.required],
      available: [true],
      featured: [false],
      allergens: [[]],
      customizations: [[]]
    });
  }

  ngOnInit() {
    this.loadAllData()
  }

  loadAllData() {
    this.loadingData.set(true);
    forkJoin({
      prods: this.productService.getAll(),
      cats: this.categoryService.getAll()
    }).subscribe({
      next: (data) => {
        this.products = data.prods;
        this.categories = data.cats;
        this.loadProducts();
        // Allow a small delay for the UI to settle before hiding spinner
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
      this.filteredProducts = this.products.filter(p => p.categoryId === this.catFilter);
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  getCategoryName(catId: string): string {
    const cat = this.categories.find(c => c.id === catId);
    return cat ? cat.name : 'Sin Category';
  }

  quickToggle(prod: Product) {
    prod.available = !prod.available;
    this.productService.update(prod).subscribe(() => {
      this.message.success(`Product ${prod.available ? 'habilitado' : 'deshabilitado'}`);
    });
  }

  openDrawer() {
    this.editingId = null;
    this.prodForm.reset({ available: true, featured: false, price: 0, allergens: [], customizations: [] });
    this.drawerVisible.set(true);
  }

  editProduct(prod: Product) {
    this.editingId = prod.id;
    this.prodForm.patchValue({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      imageUrl: prod.imageUrl,
      categoryId: prod.categoryId,
      available: prod.available,
      featured: prod.featured,
      allergens: prod.allergens || [],
      customizations: prod.customizations || []
    });
    this.drawerVisible.set(true);
  }

  closeDrawer() {
    this.drawerVisible.set(false);
    this.prodForm.reset();
  }

  saveProduct() {
    if (this.prodForm.invalid) return;
    this.loadingAction.set(true);

    const formVal = this.prodForm.value;
    const saveObj: Product = {
      id: this.editingId || `prod-${Date.now()}`,
      name: formVal.name,
      description: formVal.description,
      price: formVal.price,
      imageUrl: formVal.imageUrl,
      categoryId: formVal.categoryId,
      available: formVal.available,
      featured: formVal.featured,
      allergens: formVal.allergens,
      customizations: formVal.customizations
    };

    const targetSub = this.editingId
      ? this.productService.update(saveObj)
      : this.productService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success(`Product ${this.editingId ? 'actualizado' : 'creado'} con éxito`);
        // Actualizamos mock localmente
        if (this.editingId) {
          const idx = this.products.findIndex(p => p.id === this.editingId);
          if (idx !== -1) this.products[idx] = saveObj;
        } else {
          this.products.unshift(saveObj);
        }
        this.loadProducts();
        this.closeDrawer();
        this.loadingAction.set(false);
      },
      error: () => {
        this.message.error('Error al guardar el producto');
        this.loadingAction.set(false);
      }
    });
  }

  deleteProduct(prod: Product) {
    this.productService.delete(prod.id).subscribe(() => {
      this.message.success('Product eliminado');
      this.products = this.products.filter(p => p.id !== prod.id);
      this.loadProducts();
    });
  }
}
