import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BudgetService, FixedDeduction, Notification, LoginResponse } from '../services/budget.service';
import { ThemeService, Theme, THEMES } from '../services/theme.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class LoginComponent {
    private budgetService = inject(BudgetService);
    private themeService = inject(ThemeService);
    private router = inject(Router);

    // Theme
    themes: Theme[] = THEMES;
    showThemeSelector: boolean = false;

    // Login/Register mode
    isLoginMode: boolean = true;
    showAuthForm: boolean = true;

    // Form fields
    username: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    errorMessage: string = '';
    successMessage: string = '';
    isLoading: boolean = false;

    // Settings (shown after login)
    showSettings: boolean = false;
    
    // Salary
    salary: number = 0;

    // Fixed deductions
    deductionName: string = '';
    deductionAmount: number = 0;
    fixedDeductions: FixedDeduction[] = [];

    // Notifications
    notificationName: string = '';
    notificationAmount: number | null = null;
    notificationDay: number | null = null;
    notifications: Notification[] = [];

    constructor() {
        if (this.budgetService.isLoggedIn()) {
            this.showAuthForm = false;
            this.showSettings = true;
            this.loadUserData();
        }
    }

    loadUserData(): void {
        const data = this.budgetService.userData();
        this.salary = data.salary;
        this.fixedDeductions = [...data.fixedDeductions];
        this.notifications = [...data.notifications];
    }

    toggleThemeSelector(): void {
        this.showThemeSelector = !this.showThemeSelector;
    }

    selectTheme(index: number): void {
        this.themeService.setTheme(index);
        this.showThemeSelector = false;
    }

    toggleMode(): void {
        this.isLoginMode = !this.isLoginMode;
        this.errorMessage = '';
        this.successMessage = '';
    }

    onSubmit(): void {
        this.errorMessage = '';
        this.successMessage = '';
        
        if (!this.username.trim() || !this.password.trim()) {
            this.errorMessage = 'Kérlek töltsd ki az összes mezőt!';
            return;
        }

        if (!this.isLoginMode && this.password !== this.confirmPassword) {
            this.errorMessage = 'A jelszavak nem egyeznek!';
            return;
        }

        if (this.password.length < 4) {
            this.errorMessage = 'A jelszónak legalább 4 karakter hosszúnak kell lennie!';
            return;
        }

        this.isLoading = true;

        if (this.isLoginMode) {
            this.budgetService.login(this.username, this.password).subscribe({
                next: (response: LoginResponse) => {
                    this.isLoading = false;
                    if (response.success) {
                        this.showAuthForm = false;
                        this.showSettings = true;
                        this.loadUserData();
                    } else {
                        this.errorMessage = response.message || 'Bejelentkezés sikertelen!';
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Hiba a szerverrel való kommunikációban!';
                    console.error(err);
                }
            });
        } else {
            this.budgetService.register(this.username, this.password, this.email).subscribe({
                next: (response: LoginResponse) => {
                    this.isLoading = false;
                    if (response.success) {
                        this.showAuthForm = false;
                        this.showSettings = true;
                        this.successMessage = 'Sikeres regisztráció!';
                    } else {
                        this.errorMessage = response.message || 'Regisztráció sikertelen!';
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Hiba a szerverrel való kommunikációban!';
                    console.error(err);
                }
            });
        }
    }

    addDeduction(): void {
        if (this.deductionName && this.deductionAmount > 0) {
            const deduction: FixedDeduction = {
                name: this.deductionName,
                amount: this.deductionAmount
            };
            this.fixedDeductions.push(deduction);
            this.deductionName = '';
            this.deductionAmount = 0;
        }
    }

    removeDeduction(index: number): void {
        this.fixedDeductions.splice(index, 1);
    }

    quickAddDeduction(name: string, amount: number): void {
        this.fixedDeductions.push({ name, amount });
    }

    addNotification(): void {
        if (this.notificationName && this.notificationAmount && this.notificationAmount > 0 && this.notificationDay) {
            const notification: Notification = {
                name: this.notificationName,
                amount: this.notificationAmount,
                day: this.notificationDay,
                recurring: true
            };
            this.notifications.push(notification);
            this.notificationName = '';
            this.notificationAmount = null;
            this.notificationDay = null;
        }
    }

    removeNotification(index: number): void {
        this.notifications.splice(index, 1);
    }

    saveAndContinue(): void {
        this.budgetService.clearAllData();
        this.budgetService.updateSalary(this.salary);
        this.fixedDeductions.forEach(d => this.budgetService.addFixedDeduction(d));
        this.notifications.forEach(n => this.budgetService.addNotification(n));
        this.router.navigate(['/main']);
    }

    logout(): void {
        this.budgetService.logout();
        this.showSettings = false;
        this.showAuthForm = true;
        this.username = '';
        this.password = '';
        this.confirmPassword = '';
        this.salary = 0;
        this.fixedDeductions = [];
        this.notifications = [];
    }

    goToWelcome(): void {
        this.router.navigate(['/']);
    }

    getTotalDeductions(): number {
        return this.fixedDeductions.reduce((sum, d) => sum + d.amount, 0);
    }

    getMonthlyBudget(): number {
        return this.salary - this.getTotalDeductions();
    }

    getNotificationDayText(day: number): string {
        return `${day}. napján`;
    }
}
