import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const isAdmin = await authService.checkAdmin();
  if (isAdmin) {
    return true;
  }

  // Redirect non-admins to login page
  return router.createUrlTree(['/login']);
};

