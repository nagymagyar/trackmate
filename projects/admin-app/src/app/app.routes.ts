import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];

