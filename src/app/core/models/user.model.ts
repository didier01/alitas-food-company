export type UserRole = 'superadmin' | 'admin' | 'mesero' | 'cajero' | 'cocinero';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  venue_ids?: string[]; // Compatible con multi-sede
  active: boolean;
}
