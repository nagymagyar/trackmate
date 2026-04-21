import { Injectable, signal } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface FixedDeduction {
    name: string;
    amount: number;
}

export interface Notification {
    name: string;
    amount: number;
    day: number;
    recurring: boolean;
}

export interface Expense {
    date: string;
    amount: number;
    description: string;
}

export interface UserData {
    email?: string;
    salary: number;
    fixedDeductions: FixedDeduction[];
    notifications: Notification[];
    expenses: Expense[];
}

export interface LoginResponse {
    success: boolean;
    userId?: string;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    private API_BASE = 'http://localhost:3000/api';
    private storageKey = 'budget_app_user';
    
    userData = signal<UserData>({
        salary: 0,
        fixedDeductions: [],
        notifications: [],
        expenses: []
    });

    private currentUserId: string | null = null;

    constructor() {
        this.loadFromStorage();
    }

    // Load user ID from localStorage
    private async loadFromStorage(): Promise<void> {
        this.currentUserId = localStorage.getItem(this.storageKey);
        if (this.currentUserId) {
            await this.loadUserData();
        }
    }

    // Save user ID to localStorage
    private saveUserId(userId: string): void {
        localStorage.setItem(this.storageKey, userId);
        this.currentUserId = userId;
    }

    // Clear user ID
    private clearUserId(): void {
        localStorage.removeItem(this.storageKey);
        this.currentUserId = null;
    }

    async apiLogin(username: string, password: string): Promise<LoginResponse> {
        try {
            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: 'Server error' };
        }
    }

    login(username: string, password: string): Observable<LoginResponse> {
        return from(this.apiLogin(username, password)).pipe(
            tap(response => {
                if (response.success) {
                    this.saveUserId(response.userId!);
                    this.loadUserData();
                }
            })
        );
    }

    async apiRegister(username: string, password: string, email?: string): Promise<LoginResponse> {
        try {
            const response = await fetch(`${this.API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });
            const result = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: 'Server error' };
        }
    }

    register(username: string, password: string, email?: string): Observable<LoginResponse> {
        return from(this.apiRegister(username, password, email)).pipe(
            tap(response => {
                if (response.success) {
                    this.saveUserId(response.userId!);
                }
            })
        );
    }

    async loadUserData(): Promise<void> {
        if (!this.currentUserId) return;
        
        try {
            const response = await fetch(`${this.API_BASE}/user/${this.currentUserId}`);
            const user = await response.json();
            if (user) {
                this.userData.set(user);
                // Reset expenses for new month if needed
                this.checkAndResetMonthlyExpenses();
            }
        } catch (error) {
            console.error('Load user data error:', error);
        }
    }

    public async checkAndResetMonthlyExpenses(): Promise<void> {
        if (!this.currentUserId) return;
        
        const currentMonthKey = this.getMonthKey();
        const lastMonthKey = localStorage.getItem(`budget_app_last_month_${this.currentUserId}`);
        
        if (lastMonthKey !== currentMonthKey) {
            const current = this.userData();
            this.userData.set({
                ...current,
                expenses: []
            });
            localStorage.setItem(`budget_app_last_month_${this.currentUserId}`, currentMonthKey);
            await this.saveUserData();
        }
    }

    private getMonthKey(): string {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    async saveUserData(): Promise<void> {
        if (!this.currentUserId) return;
        
        try {
            await fetch(`${this.API_BASE}/user/${this.currentUserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.userData())
            });
        } catch (error) {
            console.error('Save user data error:', error);
        }
    }

    async updateExpense(expenseIndex: number, updatedExpense: Expense): Promise<void> {
        if (!this.currentUserId) return;
        
        try {
            await fetch(`${this.API_BASE}/user/${this.currentUserId}/expense/${expenseIndex}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedExpense)
            });
        } catch (error) {
            console.error('Update expense error:', error);
        }
    }

    async addExpense(expense: Expense): Promise<void> {
        const current = this.userData();
        const newData = {
            ...current,
            expenses: [...current.expenses, expense]
        };
        this.userData.set(newData);
        await this.saveUserData();
    }

    async updateSalary(salary: number): Promise<void> {
        const current = this.userData();
        const newData = { ...current, salary };
        this.userData.set(newData);
        await this.saveUserData();
    }

    async addFixedDeduction(deduction: FixedDeduction): Promise<void> {
        const current = this.userData();
        const newData = {
            ...current,
            fixedDeductions: [...current.fixedDeductions, deduction]
        };
        this.userData.set(newData);
        await this.saveUserData();
    }

    async addNotification(notification: Notification): Promise<void> {
        const current = this.userData();
        const newData = {
            ...current,
            notifications: [...current.notifications, notification]
        };
        this.userData.set(newData);
        await this.saveUserData();
    }

    async removeFixedDeduction(index: number): Promise<void> {
        const current = this.userData();
        const deductions = [...current.fixedDeductions];
        deductions.splice(index, 1);
        const newData = { ...current, fixedDeductions: deductions };
        this.userData.set(newData);
        await this.saveUserData();
    }

    async removeNotification(index: number): Promise<void> {
        const current = this.userData();
        const notifications = [...current.notifications];
        notifications.splice(index, 1);
        const newData = { ...current, notifications };
        this.userData.set(newData);
        await this.saveUserData();
    }

    // Check if logged in
    isLoggedIn(): boolean {
        return this.currentUserId !== null;
    }

    // Get current user ID
    getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    logout(): void {
        this.userData.set({
            salary: 0,
            fixedDeductions: [],
            notifications: [],
            expenses: []
        });
        this.clearUserId();
    }

    getTotalFixedDeductions(): number {
        return this.userData().fixedDeductions.reduce((sum, d) => sum + d.amount, 0);
    }

    getDailyBudget(): number {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - now.getDate() + 1;
        
        const salary = this.userData().salary;
        const fixedDeductions = this.getTotalFixedDeductions();
        const spent = this.getSpentThisMonth();
        
        const available = salary - fixedDeductions - spent;
        return Math.max(0, available / daysRemaining);
    }

    private parseDate(dateStr: string): Date {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const day = parseInt(parts[2]);
            return new Date(year, month, day);
        }
        return new Date(dateStr);
    }

    getSpentThisMonth(): number {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.userData().expenses
            .filter(e => {
                const expDate = this.parseDate(e.date);
                return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);
    }

    getWeeklyLimitStatus(): { warning: boolean; exceeded: boolean; message: string } {
        const weekLimit = this.getDailyBudget() * 7;
        const spentThisWeek = this.getSpentThisWeek();
        const percentage = weekLimit > 0 ? (spentThisWeek / weekLimit) * 100 : 0;
        
        if (percentage >= 100) {
            return { warning: true, exceeded: true, message: '⚠️ Heti limit túllépve!' };
        } else if (percentage >= 70) {
            return { warning: true, exceeded: false, message: '⚠️ Heti limit közelében!' };
        }
        return { warning: false, exceeded: false, message: '' };
    }

    getSpentThisWeek(): number {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        return this.userData().expenses
            .filter(e => {
                const expDate = this.parseDate(e.date);
                return expDate >= startOfWeek;
            })
            .reduce((sum, e) => sum + e.amount, 0);
    }

    getTodaysNotifications(): Notification[] {
        const today = new Date().getDate();
        return this.userData().notifications.filter(n => n.day === today);
    }

    clearAllData(): void {
        this.userData.set({
            salary: 0,
            fixedDeductions: [],
            notifications: [],
            expenses: []
        });
    }
}

