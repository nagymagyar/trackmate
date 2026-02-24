import { Injectable, signal, effect } from '@angular/core';

export interface Theme {
    name: string;
    icon: string;
    primaryColor: string;
    secondaryColor: string;
    background: string;
    backgroundGradient: string;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
    success: string;
    warning: string;
    danger: string;
    inputBg: string;
    isDark: boolean;
}

export const THEMES: Theme[] = [
    // Dark Theme - Kékes-lila (alapértelmezett)
    {
        name: 'Sötét',
        icon: '🌙',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        background: '#0f0f23',
        backgroundGradient: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 50%, #16213e 100%)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textColor: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.65)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        inputBg: 'rgba(255, 255, 255, 0.05)',
        isDark: true
    },
    // Light Theme - Világos, kellemes a szemnek
    {
        name: 'Világos',
        icon: '☀️',
        primaryColor: '#4f46e5',
        secondaryColor: '#7c3aed',
        background: '#f8fafc',
        backgroundGradient: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
        cardBg: 'rgba(255, 255, 255, 0.85)',
        textColor: '#1e293b',
        textSecondary: '#64748b',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        success: '#16a34a',
        warning: '#ca8a04',
        danger: '#dc2626',
        inputBg: 'rgba(255, 255, 255, 0.9)',
        isDark: false
    },
    // Naplemente - Warm tones
    {
        name: 'Naplemente',
        icon: '🌅',
        primaryColor: '#f97316',
        secondaryColor: '#dc2626',
        background: '#1a0f0f',
        backgroundGradient: 'linear-gradient(180deg, #1a0f0f 0%, #2d1810 50%, #3d2015 100%)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textColor: '#fef3c7',
        textSecondary: 'rgba(254, 243, 199, 0.65)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        inputBg: 'rgba(255, 255, 255, 0.05)',
        isDark: true
    },
    // Őserdő - Természet
    {
        name: 'Őserdő',
        icon: '🌲',
        primaryColor: '#22c55e',
        secondaryColor: '#15803d',
        background: '#0a1a0f',
        backgroundGradient: 'linear-gradient(180deg, #0a1a0f 0%, #0f2d1a 50%, #143d22 100%)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textColor: '#dcfce7',
        textSecondary: 'rgba(220, 252, 231, 0.65)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        inputBg: 'rgba(255, 255, 255, 0.05)',
        isDark: true
    },
    // Tiszta Ég - Ocean
    {
        name: 'Tenger',
        icon: '🌊',
        primaryColor: '#06b6d4',
        secondaryColor: '#0891b2',
        background: '#0a1a1f',
        backgroundGradient: 'linear-gradient(180deg, #0a1a1f 0%, #0f2d35 50%, #143a42 100%)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textColor: '#e0f2fe',
        textSecondary: 'rgba(224, 242, 254, 0.65)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        inputBg: 'rgba(255, 255, 255, 0.05)',
        isDark: true
    },
    // Rózsa - Pink
    {
        name: 'Rózsa',
        icon: '🌸',
        primaryColor: '#ec4899',
        secondaryColor: '#be185d',
        background: '#1a0f1a',
        backgroundGradient: 'linear-gradient(180deg, #1a0f1a 0%, #2d1525 50%, #3d1a2f 100%)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textColor: '#fce7f3',
        textSecondary: 'rgba(252, 231, 243, 0.65)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        inputBg: 'rgba(255, 255, 255, 0.05)',
        isDark: true
    },
    // Arany - Luxury
    {
        name: 'Arany',
        icon: '✨',
        primaryColor: '#eab308',
        secondaryColor: '#a16207',
        background: '#1a1a0f',
        backgroundGradient: 'linear-gradient(180deg, #1a1a0f 0%, #2d2d15 50%, #3d3d1a 100%)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textColor: '#fef9c3',
        textSecondary: 'rgba(254, 249, 195, 0.65)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        inputBg: 'rgba(255, 255, 255, 0.05)',
        isDark: true
    },
    // Minimal Light - Egyszerű világos
    {
        name: 'Minimal',
        icon: '💎',
        primaryColor: '#2563eb',
        secondaryColor: '#3b82f6',
        background: '#ffffff',
        backgroundGradient: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        textColor: '#111827',
        textSecondary: '#6b7280',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        inputBg: '#ffffff',
        isDark: false
    }
];

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private storageKey = 'app_theme';
    currentTheme = signal<Theme>(THEMES[0]);

    constructor() {
        this.loadTheme();
        
        effect(() => {
            this.applyTheme(this.currentTheme());
        });
    }

    private loadTheme(): void {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            const themeIndex = parseInt(saved, 10);
            if (themeIndex >= 0 && themeIndex < THEMES.length) {
                this.currentTheme.set(THEMES[themeIndex]);
            }
        }
    }

    setTheme(index: number): void {
        if (index >= 0 && index < THEMES.length) {
            this.currentTheme.set(THEMES[index]);
            localStorage.setItem(this.storageKey, index.toString());
        }
    }

    getThemes(): Theme[] {
        return THEMES;
    }

    private applyTheme(theme: Theme): void {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--secondary-color', theme.secondaryColor);
        root.style.setProperty('--background', theme.background);
        root.style.setProperty('--background-gradient', theme.backgroundGradient);
        root.style.setProperty('--card-bg', theme.cardBg);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        root.style.setProperty('--border-color', theme.borderColor);
        root.style.setProperty('--success', theme.success);
        root.style.setProperty('--warning', theme.warning);
        root.style.setProperty('--danger', theme.danger);
        root.style.setProperty('--input-bg', theme.inputBg);
        root.style.setProperty('--is-dark', theme.isDark ? '1' : '0');
    }
}
