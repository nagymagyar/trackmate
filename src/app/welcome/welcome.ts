import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, Theme, THEMES } from '../services/theme.service';
import { BudgetService } from '../services/budget.service';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './welcome.html',
    styleUrl: './welcome.css'
})
export class WelcomeComponent {
    private router = inject(Router);
    private themeService = inject(ThemeService);
    private budgetService = inject(BudgetService);

    themes: Theme[] = THEMES;
    showThemeSelector: boolean = false;

    get isLoggedIn(): boolean {
        return this.budgetService.isLoggedIn();
    }

    get isAdmin(): boolean {
        return this.budgetService.isAdminUser();
    }

    toggleThemeSelector(): void {
        this.showThemeSelector = !this.showThemeSelector;
    }

    selectTheme(index: number): void {
        this.themeService.setTheme(index);
        this.showThemeSelector = false;
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }

    goToMain(): void {
        this.router.navigate(['/main']);
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    goToAdmin(): void {
        window.open('http://localhost:4201', '_blank');
    }
}

