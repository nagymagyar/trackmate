import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, Theme, THEMES } from '../services/theme.service';

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

    themes: Theme[] = THEMES;
    showThemeSelector: boolean = false;

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
}
