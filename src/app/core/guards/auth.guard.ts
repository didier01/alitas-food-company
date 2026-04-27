import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = authService.currentUser()?.role;
      if (userRole && requiredRoles.includes(userRole)) {
        return true;
      }
      // Si tiene sesión pero no el rol redirige a dashboard
      router.navigate(['/admin/dashboard']);
      return false;
    }
    return true;
  }

  // Si no está autenticado redirige a login
  router.navigate(['/admin/login']);
  return false;
};
