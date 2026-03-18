import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { 
        path: 'inicio', 
        loadComponent: () => import('./features/public/home/home.component').then(c => c.HomeComponent) 
      },
      { 
        path: 'menu', 
        loadComponent: () => import('./features/public/menu/menu.component').then(c => c.MenuComponent) 
      },
      { 
        path: 'sobre-nosotros', 
        loadComponent: () => import('./features/public/about/about.component').then(c => c.AboutComponent) 
      },
      { 
        path: 'contacto', 
        loadComponent: () => import('./features/public/contact/contact.component').then(c => c.ContactComponent) 
      }
    ]
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(c => c.DashboardComponent) 
      },
      { 
        path: 'sedes', 
        loadComponent: () => import('./features/admin/sedes/sedes.component').then(c => c.SedesComponent) 
      },
      { 
        path: 'menus', 
        loadComponent: () => import('./features/admin/menus/menus.component').then(c => c.MenusComponent) 
      },
      { 
        path: 'categorias', 
        loadComponent: () => import('./features/admin/categorias/categorias.component').then(c => c.CategoriasComponent) 
      },
      { 
        path: 'productos', 
        loadComponent: () => import('./features/admin/productos/productos.component').then(c => c.ProductosComponent) 
      },
      { 
        path: 'promociones', 
        loadComponent: () => import('./features/admin/promociones/promociones.component').then(c => c.PromocionesComponent) 
      },
      { 
        path: 'combos', 
        loadComponent: () => import('./features/admin/combos/combos.component').then(c => c.CombosComponent) 
      },
      { 
        path: 'usuarios', 
        canActivate: [roleGuard],
        loadComponent: () => import('./features/admin/usuarios/usuarios.component').then(c => c.UsuariosComponent) 
      }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];
