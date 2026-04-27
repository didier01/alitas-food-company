import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

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
        path: 'pos',
        canActivate: [authGuard],
        data: { roles: ['admin', 'superadmin', 'mesero'] },
        loadComponent: () => import('./features/admin/pos/pos.component').then(c => c.PosComponent)
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        data: { roles: ['admin', 'superadmin', 'cajero'] },
        loadComponent: () => import('./features/admin/orders/orders.component').then(c => c.OrdersComponent)
      },
      {
        path: 'venues',
        loadComponent: () => import('./features/admin/venues/venues.component').then(c => c.VenuesComponent)
      },
      {
        path: 'menus',
        loadComponent: () => import('./features/admin/venue-menus/venue-menus.component').then(c => c.VenueMenusComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/categories.component').then(c => c.CategoriesComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/products.component').then(c => c.ProductsComponent)
      },
      {
        path: 'promotions',
        loadComponent: () => import('./features/admin/promotions/promotions.component').then(c => c.PromotionsComponent)
      },
      {
        path: 'combos',
        loadComponent: () => import('./features/admin/combos/combos.component').then(c => c.CombosComponent)
      },
      {
        path: 'complements/allergens',
        loadComponent: () => import('./features/admin/complements/allergens/allergens.component').then(c => c.AllergensComponent)
      },
      {
        path: 'complements/modifiers',
        loadComponent: () => import('./features/admin/modifiers/modifiers.component').then(c => c.ModifiersComponent)
      },
      {
        path: 'inventory',
        canActivate: [authGuard],
        data: { roles: ['admin', 'superadmin'] },
        loadComponent: () => import('./features/admin/ingredients/ingredients.component').then(c => c.IngredientsComponent)
      },
      {
        path: 'users',
        canActivate: [authGuard],
        data: { roles: ['superadmin'] },
        loadComponent: () => import('./features/admin/users/users.component').then(c => c.UsersComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];
