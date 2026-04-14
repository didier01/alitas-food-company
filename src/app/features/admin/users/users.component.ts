import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule,
    NzSelectModule, NzPopconfirmModule, NzTagModule,
    NzSwitchModule, LoadingSpinnerComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  userService = inject(UserService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  users: User[] = [];
  loadingData = true;
  loadingAction = false;
  modalVisible = false;
  editingId: string | null = null;
  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // requerido al crear, manejado dinamicamente
      role: ['admin', Validators.required],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loadingData = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loadingData = false;
      },
      error: () => {
        this.message.error('Error cargando users');
        this.loadingData = false;
      }
    });
  }

  openModal() {
    this.editingId = null;
    this.userForm.reset({ active: true, role: 'admin' });
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  editUser(user: User) {
    this.editingId = user.id;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  saveUser() {
    if (this.userForm.invalid) return;
    this.loadingAction = true;

    const formVal = this.userForm.value;
    const saveObj: User = {
      id: this.editingId || `user-${Date.now()}`,
      name: formVal.name,
      email: formVal.email,
      role: formVal.role,
      active: formVal.active
    };

    const action = this.editingId
      ? this.userService.update(saveObj)
      : this.userService.create(saveObj);

    action.subscribe({
      next: () => {
        this.message.success(`Usuario guardado con éxito.`);
        this.loadUsers();
        this.closeModal();
        this.loadingAction = false;
      },
      error: () => {
        this.message.error('Error al guardar usuario');
        this.loadingAction = false;
      }
    });
  }

  deleteUser(user: User) {
    user.active = false;
    this.userService.update(user).subscribe(() => {
      this.message.success('Usuario suspendido.');
      this.loadUsers();
    });
  }
}
