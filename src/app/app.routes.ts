import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'menu', pathMatch: 'full' },
      {
        path: 'inicio',
        title: 'Alitas Food Company - Inicio',
        loadComponent: () => import('./features/public/home/home.component').then(c => c.HomeComponent)
      },
      {
        path: 'menu',
        title: 'Alitas Food Company - Menú Completo',
        loadComponent: () => import('./features/public/menu/menu.component').then(c => c.MenuComponent)
      },
      {
        path: 'sobre-nosotros',
        title: 'Alitas Food Company - Sobre Nosotros',
        loadComponent: () => import('./features/public/about/about.component').then(c => c.AboutComponent)
      },
      {
        path: 'contacto',
        title: 'Alitas Food Company - Contacto',
        loadComponent: () => import('./features/public/contact/contact.component').then(c => c.ContactComponent)
      }
    ]
  },
  {
    path: 'admin/login',
    title: 'Alitas Food Company - Iniciar Sesión',
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
        title: 'Admin - Dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'pos',
        title: 'Admin - POS',
        canActivate: [authGuard],
        data: { roles: ['admin', 'superadmin', 'mesero'] },
        loadComponent: () => import('./features/admin/pos/pos.component').then(c => c.PosComponent)
      },
      {
        path: 'orders',
        title: 'Admin - Pedidos',
        canActivate: [authGuard],
        data: { roles: ['admin', 'superadmin', 'cajero'] },
        loadComponent: () => import('./features/admin/orders/orders.component').then(c => c.OrdersComponent)
      },
      {
        path: 'venues',
        title: 'Admin - Sedes',
        loadComponent: () => import('./features/admin/venues/venues.component').then(c => c.VenuesComponent)
      },
      {
        path: 'menus',
        title: 'Admin - Menús',
        loadComponent: () => import('./features/admin/venue-menus/venue-menus.component').then(c => c.VenueMenusComponent)
      },
      {
        path: 'categories',
        title: 'Admin - Categorías',
        loadComponent: () => import('./features/admin/categories/categories.component').then(c => c.CategoriesComponent)
      },
      {
        path: 'products',
        title: 'Admin - Productos',
        loadComponent: () => import('./features/admin/products/products.component').then(c => c.ProductsComponent)
      },
      {
        path: 'promotions',
        title: 'Admin - Promociones',
        loadComponent: () => import('./features/admin/promotions/promotions.component').then(c => c.PromotionsComponent)
      },
      {
        path: 'combos',
        title: 'Admin - Combos',
        loadComponent: () => import('./features/admin/combos/combos.component').then(c => c.CombosComponent)
      },
      {
        path: 'complements/allergens',
        title: 'Admin - Alérgenos',
        loadComponent: () => import('./features/admin/complements/allergens/allergens.component').then(c => c.AllergensComponent)
      },
      {
        path: 'complements/modifiers',
        title: 'Admin - Modificadores',
        loadComponent: () => import('./features/admin/modifiers/modifiers.component').then(c => c.ModifiersComponent)
      },
      {
        path: 'inventory',
        title: 'Admin - Inventario',
        canActivate: [authGuard],
        data: { roles: ['admin', 'superadmin'] },
        loadComponent: () => import('./features/admin/ingredients/ingredients.component').then(c => c.IngredientsComponent)
      },
      {
        path: 'users',
        title: 'Admin - Usuarios',
        canActivate: [authGuard],
        data: { roles: ['superadmin'] },
        loadComponent: () => import('./features/admin/users/users.component').then(c => c.UsersComponent)
      },
      {
        path: 'help',
        title: 'Admin - Guía de Ayuda',
        loadComponent: () => import('./features/admin/help/admin-help.component').then(c => c.AdminHelpComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];
