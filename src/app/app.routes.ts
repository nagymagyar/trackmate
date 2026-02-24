import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome';
import { LoginComponent } from './login/login';
import { CalendarCalculatorComponent } from './calendar-calculator/calendar-calculator';

export const routes: Routes = [
    { path: '', component: WelcomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'main', component: CalendarCalculatorComponent },
    { path: '**', component: WelcomeComponent }
];
