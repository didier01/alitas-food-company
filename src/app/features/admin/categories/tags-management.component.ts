import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { TagService, TagGroup } from '../../../core/services/tag.service';

@Component({
  selector: 'app-tags-management',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule,
    NzButtonModule, NzIconModule, NzModalModule, NzFormModule,
    NzInputModule, NzSwitchModule, NzTagModule, NzInputNumberModule,
    NzPopconfirmModule, NzTooltipModule
  ],
  templateUrl: './tags-management.component.html',
  styleUrl: './tags-management.component.scss'
})
export class TagsManagementComponent implements OnInit {
  tagService = inject(TagService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  tags: TagGroup[] = [];
  loadingData = signal(true);
  loadingAction = false;
  tagModalVisible = signal(false);
  editingOriginalTag: string | null = null;
  tagForm: FormGroup;

  constructor() {
    this.tagForm = this.fb.group({
      tag: ['', Validators.required],
      group_name: ['', Validators.required],
      display_order: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.loadingData.set(true);
    this.tagService.getAll().subscribe({
      next: (data) => {
        this.tags = data;
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error al cargar etiquetas');
        this.loadingData.set(false);
      }
    });
  }

  openTagModal() {
    this.editingOriginalTag = null;
    let nextOrder = this.tags.length > 0 ? Math.max(...this.tags.map(t => t.display_order || 0)) + 1 : 1;
    this.tagForm.reset({ display_order: nextOrder });
    this.tagForm.get('tag')?.enable();
    this.tagModalVisible.set(true);
  }

  editTag(tag: TagGroup) {
    this.editingOriginalTag = tag.tag;
    this.tagForm.patchValue({
      tag: tag.tag,
      group_name: tag.group_name,
      display_order: tag.display_order
    });
    this.tagForm.get('tag')?.disable(); // Tag ID is PK usually, disable edit or handle rename
    this.tagModalVisible.set(true);
  }

  closeTagModal() {
    this.tagModalVisible.set(false);
  }

  saveTag() {
    if (this.tagForm.invalid) return;
    this.loadingAction = true;
    
    // Si se deshabilitó, hay que re-habilitarlo o agarrar rawValue
    const formVal = this.tagForm.getRawValue();
    const saveObj: TagGroup = {
      tag: formVal.tag,
      group_name: formVal.group_name,
      display_order: formVal.display_order
    };

    const targetSub = this.editingOriginalTag
      ? this.tagService.update(this.editingOriginalTag, saveObj)
      : this.tagService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success('Etiqueta guardada con éxito');
        this.loadTags();
        this.closeTagModal();
        this.loadingAction = false;
      },
      error: (err) => {
        console.error(err);
        this.message.error('Error al guardar etiqueta');
        this.loadingAction = false;
      }
    });
  }

  deleteTag(tagItem: TagGroup) {
    this.tagService.delete(tagItem.tag).subscribe({
        next: () => {
            this.message.success('Etiqueta eliminada permanentemente');
            this.loadTags();
        },
        error: (err) => {
            console.error(err);
            this.message.error('Error al eliminar etiqueta');
        }
    });
  }
}
