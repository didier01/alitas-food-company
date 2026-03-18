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
import { Usuario } from '../../../core/models/usuario.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

// Simulamos un UsuarioService básico directamente aquí para no crear más services si no es vital,
// pero siguiendo la arquitectura podríamos moverlo a core/services. Por rapidez, lo integramos.
class MockUsuarioService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule, NzButtonModule, 
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, 
    NzSelectModule, NzPopconfirmModule, NzTagModule,
    NzSwitchModule, LoadingSpinnerComponent
  ],
  providers: [MockUsuarioService],
    templateUrl: './usuarios.component.html',
    styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  userService = inject(MockUsuarioService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  usuarios: Usuario[] = [];
  loadingData = true;
  loadingAction = false;
  modalVisible = false;
  editingId: string | null = null;
  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // requerido al crear, manejado dinamicamente
      rol: ['admin', Validators.required],
      activo: [true]
    });
  }

  ngOnInit() {
    this.loadingData = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loadingData = false;
      },
      error: () => {
        this.message.error('Error cargando usuarios');
        this.loadingData = false;
      }
    });
  }

  openModal() {
    this.editingId = null;
    this.userForm.reset({ activo: true, rol: 'admin' });
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  editUser(user: Usuario) {
    this.editingId = user.id;
    this.userForm.patchValue({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: user.activo
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
    const saveObj: Usuario = {
      id: this.editingId || `user-${Date.now()}`,
      nombre: formVal.nombre,
      email: formVal.email,
      rol: formVal.rol,
      activo: formVal.activo
    };

    // Simulamos guardado local, el MockInterceptor podría manejar POST si lo tuvieramos registrado para usuarios.
    // Lo manejamos en mock array:
    setTimeout(() => {
        this.message.success(`Usuario guardado con éxito. (Simulación)`);
        if (this.editingId) {
          const idx = this.usuarios.findIndex(p => p.id === this.editingId);
          if (idx !== -1) this.usuarios[idx] = saveObj;
        } else {
          this.usuarios.push(saveObj);
        }
        this.closeModal();
        this.loadingAction = false;
    }, 500);
  }

  deleteUser(user: Usuario) {
    user.activo = false;
    this.message.success('Usuario suspendido. (Simulación)');
  }
}
