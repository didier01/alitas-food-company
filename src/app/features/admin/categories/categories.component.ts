import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DragDropModule, NzTableModule,
    NzButtonModule, NzIconModule, NzModalModule, NzFormModule,
    NzInputModule, NzSwitchModule, NzTagModule,
    NzPopconfirmModule, LoadingSpinnerComponent, NzTooltipModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categoryService = inject(CategoryService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  categories: Category[] = [];
  loadingData = signal(true);
  loadingAction = false;
  modalVisible = false;
  editingId: string | null = null;
  catForm: FormGroup;

  constructor() {
    this.catForm = this.fb.group({
      name: ['', Validators.required],
      icon: ['appstore'],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadCats();
  }

  loadCats() {
    this.loadingData.set(true);
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data.sort((a, b) => a.order - b.order);
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error al cargar categorías');
        this.loadingData.set(false);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    // En un escenario real aquí actualizaríamos masivamente el reordenamiento
    // Mock simulación: no realizamos llamada a backend, el visual basta para la demo.
    this.categories.forEach((cat, idx) => cat.order = idx + 1);
    this.message.success('Orden actualizado');
  }

  openModal() {
    this.editingId = null;
    this.catForm.reset({ active: true, icon: 'appstore' });
    this.modalVisible = true;
  }

  editCat(cat: Category) {
    this.editingId = cat.id;
    this.catForm.patchValue({
      name: cat.name,
      icon: cat.icon,
      active: cat.active
    });
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  saveCat() {
    if (this.catForm.invalid) return;
    this.loadingAction = true;

    const formVal = this.catForm.value;
    const saveObj: Category = {
      id: this.editingId || `cat-${Date.now()}`,
      name: formVal.name,
      icon: formVal.icon,
      order: this.editingId ? this.categories.find(c => c.id === this.editingId)!.order : this.categories.length + 1,
      active: formVal.active
    };

    const targetSub = this.editingId
      ? this.categoryService.update(saveObj)
      : this.categoryService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success(`Categoría guardada`);
        this.loadCats();
        this.closeModal();
        this.loadingAction = false;
      },
      error: () => {
        this.message.error('Error al guardar la categoría');
        this.loadingAction = false;
      }
    });
  }

  deleteCat(cat: Category) {
    cat.active = false;
    this.categoryService.update(cat).subscribe(() => {
      this.message.success('Categoría desactivada');
      this.loadCats();
    });
  }
}
