export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'superadmin';
  activo: boolean;
}
