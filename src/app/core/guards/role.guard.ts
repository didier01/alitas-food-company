import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (currentUser && currentUser.role === 'superadmin') {
    return true;
  }

  // Redirigimos al dashboard si no es superadmin
  router.navigate(['/admin/dashboard']);
  return false;
};
