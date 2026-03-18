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
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria } from '../../../core/models/categoria.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DragDropModule, NzTableModule,
    NzButtonModule, NzIconModule, NzModalModule, NzFormModule,
    NzInputModule, NzSwitchModule, NzTagModule,
    NzPopconfirmModule, LoadingSpinnerComponent
  ],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit {
  catService = inject(CategoriaService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  categorias: Categoria[] = [];
  loadingData = signal(true);
  loadingAction = false;
  modalVisible = false;
  editingId: string | null = null;
  catForm: FormGroup;

  constructor() {
    this.catForm = this.fb.group({
      nombre: ['', Validators.required],
      icono: ['appstore'],
      activa: [true]
    });
  }

  ngOnInit() {
    this.loadCats();
  }

  loadCats() {
    this.loadingData.set(true);
    this.catService.getAll().subscribe({
      next: (data) => {
        this.categorias = data.sort((a, b) => a.orden - b.orden);
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error al cargar categorías');
        this.loadingData.set(false);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.categorias, event.previousIndex, event.currentIndex);
    // En un escenario real aquí actualizaríamos masivamente el reordenamiento
    // Mock simulación: no realizamos llamada a backend, el visual basta para la demo.
    this.categorias.forEach((cat, idx) => cat.orden = idx + 1);
    this.message.success('Orden actualizado');
  }

  openModal() {
    this.editingId = null;
    this.catForm.reset({ activa: true, icono: 'appstore' });
    this.modalVisible = true;
  }

  editCat(cat: Categoria) {
    this.editingId = cat.id;
    this.catForm.patchValue({
      nombre: cat.nombre,
      icono: cat.icono,
      activa: cat.activa
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
    const saveObj: Categoria = {
      id: this.editingId || `cat-${Date.now()}`,
      nombre: formVal.nombre,
      icono: formVal.icono,
      orden: this.editingId ? this.categorias.find(c => c.id === this.editingId)!.orden : this.categorias.length + 1,
      activa: formVal.activa
    };

    const targetSub = this.editingId
      ? this.catService.update(saveObj)
      : this.catService.create(saveObj);

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

  deleteCat(cat: Categoria) {
    cat.activa = false;
    this.catService.update(cat).subscribe(() => {
      this.message.success('Categoría desactivada');
      this.loadCats();
    });
  }
}
