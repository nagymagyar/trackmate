import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome';
import { LoginComponent } from './login/login';
import { TrackyComponent } from './calendar-calculator/calendar-calculator';
import { DashboardComponent } from './dashboard/dashboard';
import { autoLoginGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', component: WelcomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'main', component: TrackyComponent, canActivate: [autoLoginGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [autoLoginGuard] },
    { path: '**', component: WelcomeComponent }
];
