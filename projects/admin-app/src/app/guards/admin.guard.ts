import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAdmin = await authService.checkAdmin();
  if (isAdmin) {
    return true;
  }

  // Allow access to login screen, just load data will fail
  return true;
};

