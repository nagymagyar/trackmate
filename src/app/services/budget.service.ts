import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

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

export interface User {
    username: string;
    password: string;
    email?: string;
    salary: number;
    fixedDeductions: FixedDeduction[];
    notifications: Notification[];
    expenses: Expense[];
}

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    private storageKey = 'budget_app_user';
    private storageKeyData = 'budget_app_data';
    private usersKey = 'budget_app_users';
    
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
    private loadFromStorage(): void {
        this.currentUserId = localStorage.getItem(this.storageKey);
        if (this.currentUserId) {
            this.loadUserData();
        }
    }

    // Get all users from localStorage
    private getUsers(): { [key: string]: User } {
        const usersJson = localStorage.getItem(this.usersKey);
        if (usersJson) {
            return JSON.parse(usersJson);
        }
        return {};
    }

    // Save all users to localStorage
    private saveUsers(users: { [key: string]: User }): void {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    // Save user ID to localStorage
    private saveUserId(userId: string): void {
        localStorage.setItem(this.storageKey, userId);
        this.currentUserId = userId;
    }

    // Clear user ID
    private clearUserId(): void {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.storageKeyData);
        this.currentUserId = null;
    }

    // Login - check credentials against stored users
    login(username: string, password: string): Observable<LoginResponse> {
        const users = this.getUsers();
        const user = users[username];
        
        if (user && user.password === password) {
            this.saveUserId(username);
            this.loadUserData();
            return of({ success: true, userId: username });
        }
        
        return of({ success: false, message: 'Hibás felhasználónév vagy jelszó!' });
    }

    // Register - create new user
    register(username: string, password: string, email?: string): Observable<LoginResponse> {
        const users = this.getUsers();
        
        if (users[username]) {
            return of({ success: false, message: 'Felhasználó már létezik!' });
        }
        
        // Create new user
        users[username] = {
            username,
            password,
            email,
            salary: 0,
            fixedDeductions: [],
            notifications: [],
            expenses: []
        };
        
        this.saveUsers(users);
        this.saveUserId(username);
        
        return of({ success: true, userId: username });
    }

    // Load user data from localStorage
    loadUserData(): void {
        if (!this.currentUserId) return;
        
        const users = this.getUsers();
        const user = users[this.currentUserId];
        
        if (user) {
            this.userData.set({
                salary: user.salary || 0,
                fixedDeductions: user.fixedDeductions || [],
                notifications: user.notifications || [],
                expenses: user.expenses || []
            });
        }
    }

    // Save user data to localStorage
    saveUserData(): void {
        if (!this.currentUserId) return;
        
        const users = this.getUsers();
        const currentData = this.userData();
        
        if (users[this.currentUserId]) {
            users[this.currentUserId].salary = currentData.salary;
            users[this.currentUserId].fixedDeductions = currentData.fixedDeductions;
            users[this.currentUserId].notifications = currentData.notifications;
            users[this.currentUserId].expenses = currentData.expenses;
            this.saveUsers(users);
        }
        
        this.saveToStorage();
    }

    // Save data to localStorage (backup)
    private saveToStorage(): void {
        localStorage.setItem(this.storageKeyData, JSON.stringify(this.userData()));
    }

    // Check if logged in
    isLoggedIn(): boolean {
        return this.currentUserId !== null;
    }

    // Get current user ID
    getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    // Logout - clear data
    logout(): void {
        this.userData.set({
            salary: 0,
            fixedDeductions: [],
            notifications: [],
            expenses: []
        });
        this.clearUserId();
    }

    // Get total fixed deductions
    getTotalFixedDeductions(): number {
        return this.userData().fixedDeductions.reduce((sum, d) => sum + d.amount, 0);
    }

    // Get available daily budget
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

    // Get spent amount this month
    getSpentThisMonth(): number {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return this.userData().expenses
            .filter(e => {
                const expDate = new Date(e.date);
                return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);
    }

    // Get weekly limit status
    getWeeklyLimitStatus(): { warning: boolean; exceeded: boolean; message: string } {
        const now = new Date();
        const dayOfWeek = now.getDay();
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

    // Get spent this week
    getSpentThisWeek(): number {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        return this.userData().expenses
            .filter(e => new Date(e.date) >= startOfWeek)
            .reduce((sum, e) => sum + e.amount, 0);
    }

    // Get today's notifications
    getTodaysNotifications(): Notification[] {
        const today = new Date().getDate();
        return this.userData().notifications.filter(n => n.day === today);
    }

    // Add expense
    addExpense(expense: Expense): void {
        const current = this.userData();
        const newData = {
            ...current,
            expenses: [...current.expenses, expense]
        };
        this.userData.set(newData);
        this.saveToStorage();
        this.saveUserData();
    }

    // Update salary
    updateSalary(salary: number): void {
        const current = this.userData();
        const newData = { ...current, salary };
        this.userData.set(newData);
        this.saveToStorage();
        this.saveUserData();
    }

    // Add fixed deduction
    addFixedDeduction(deduction: FixedDeduction): void {
        const current = this.userData();
        const newData = {
            ...current,
            fixedDeductions: [...current.fixedDeductions, deduction]
        };
        this.userData.set(newData);
        this.saveToStorage();
        this.saveUserData();
    }

    // Add notification
    addNotification(notification: Notification): void {
        const current = this.userData();
        const newData = {
            ...current,
            notifications: [...current.notifications, notification]
        };
        this.userData.set(newData);
        this.saveToStorage();
        this.saveUserData();
    }

    // Remove fixed deduction
    removeFixedDeduction(index: number): void {
        const current = this.userData();
        const deductions = [...current.fixedDeductions];
        deductions.splice(index, 1);
        const newData = { ...current, fixedDeductions: deductions };
        this.userData.set(newData);
        this.saveToStorage();
        this.saveUserData();
    }

    // Remove notification
    removeNotification(index: number): void {
        const current = this.userData();
        const notifications = [...current.notifications];
        notifications.splice(index, 1);
        const newData = { ...current, notifications };
        this.userData.set(newData);
        this.saveToStorage();
        this.saveUserData();
    }

    // Clear all data
    clearAllData(): void {
        this.userData.set({
            salary: 0,
            fixedDeductions: [],
            notifications: [],
            expenses: []
        });
        this.saveToStorage();
    }
}
