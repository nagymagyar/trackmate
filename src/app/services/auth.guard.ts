import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BudgetService } from './budget.service';

export const autoLoginGuard: CanActivateFn = (route, state) => {
  const budgetService = inject(BudgetService);
  const router = inject(Router);

  if (budgetService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = (route, state) => {
  const budgetService = inject(BudgetService);
  const router = inject(Router);

  if (budgetService.isLoggedIn() && budgetService.isAdminUser()) {
    return true;
  }

  return router.createUrlTree(['/main']);
};

