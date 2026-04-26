import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { BudgetService, Expense } from '../services/budget.service';
import { ErrorService } from '../services/error.service';
import { ThemeService, Theme, THEMES } from '../services/theme.service';
import { environment } from '../../environments/environment';

export interface ExpenseCategory {
    name: string;
    icon: string;
    color: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    { name: 'Étel', icon: '🍔', color: '#f97316' },
    { name: 'Bolt', icon: '🛒', color: '#22c55e' },
    { name: 'Cigi', icon: '🚬', color: '#ef4444' },
    { name: 'Szórakozás', icon: '🎮', color: '#8b5cf6' },
    { name: 'Kávé', icon: '☕', color: '#d97706' },
    { name: 'Utazás', icon: '🚌', color: '#06b6d4' },
    { name: 'Ruházat', icon: '👕', color: '#ec4899' },
    { name: 'Egészség', icon: '💊', color: '#14b8a6' },
    { name: 'Számlák', icon: '📄', color: '#64748b' },
    { name: 'Egyéb', icon: '📦', color: '#94a3b8' }
];

@Component({
    selector: 'app-calendar-calculator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './calendar-calculator.html',
    styleUrl: './calendar-calculator.css'
})
export class TrackyComponent implements OnInit {
    private budgetService = inject(BudgetService);
    private errorService = inject(ErrorService);
    private themeService = inject(ThemeService);
    private router = inject(Router);

    // Theme
    themes: Theme[] = THEMES;
    showThemeSelector: boolean = false;
    categories: ExpenseCategory[] = EXPENSE_CATEGORIES;

    // Expense input
    expenseAmount: number | null = null;
    expenseDescription: string = '';
    selectedCategory: string = '';
    selectedDate: string = '';

    // Day editor
    showDayEditor: boolean = false;
    selectedDay: number = 0;

    // Edit state
    editingExpenseIndex: number = -1;
    tempExpenseAmount: number | null = null;
    tempExpenseDescription: string = '';

    // Calendar - hétfővel kezdődik (0 = hétfő)
    currentDate = new Date();
    daysInMonth: number[] = [];
    weekDays = ['Hé', 'Ke', 'Sz', 'Cs', 'Pé', 'Szo', 'Va'];

    // Server status
    serverStatus: 'online' | 'offline' | 'checking' = 'checking';
    showNotificationDropdown: boolean = false;

    // Get data from service
    get userData() { return this.budgetService.userData(); }
    get dailyBudget(): number { return this.budgetService.getDailyBudget(); }
    get spentThisMonth(): number { return this.budgetService.getSpentThisMonth(); }
    get weeklyStatus() { return this.budgetService.getWeeklyLimitStatus(); }
    get todaysNotifications() { return this.budgetService.getTodaysNotifications(); }
    get allNotifications() { return this.budgetService.userData().notifications; }

    ngOnInit(): void {
        if (!this.budgetService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

        // Load fresh data from backend
        this.loadInitialData();

        // Monthly reset via API load/save handled in service

        this.selectedDate = this.formatDate(new Date());
        this.generateCalendar();

        // Check server status
        this.checkServerStatus();
    }

    private async loadInitialData(): Promise<void> {
        try {
            await this.budgetService.loadUserData();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.errorService?.handleError(error, 'Adatok betöltési hiba');
        }
    }

    // Check if backend server is running
    async checkServerStatus(): Promise<void> {
        this.serverStatus = 'checking';
        try {
            const response = await fetch(`${environment.apiBaseUrl}/ping`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                this.serverStatus = 'online';
            } else {
                this.serverStatus = 'offline';
            }
        } catch (error) {
            this.serverStatus = 'offline';
        }
    }

    // Toggle notification dropdown
    toggleNotificationDropdown(): void {
        this.showNotificationDropdown = !this.showNotificationDropdown;
    }

    // Close notification dropdown
    closeNotificationDropdown(): void {
        this.showNotificationDropdown = false;
    }

    toggleThemeSelector(): void {
        this.showThemeSelector = !this.showThemeSelector;
    }

    selectTheme(index: number): void {
        this.themeService.setTheme(index);
        this.showThemeSelector = false;
    }

    generateCalendar(): void {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        // JavaScript: 0=vasárnap, 1=hétfő -> átalakítjuk: 0=hétfő, 6=vasárnap
        let firstDay = new Date(year, month, 1).getDay();
        if (firstDay === 0) firstDay = 7; // vasárnap -> 7
        firstDay = firstDay - 1; // 0=hétfő

        const daysCount = new Date(year, month + 1, 0).getDate();

        this.daysInMonth = [];
        // Üres cellák a hónap első napja előtt
        for (let i = 0; i < firstDay; i++) {
            this.daysInMonth.push(0);
        }
        // A hónap napjai
        for (let i = 1; i <= daysCount; i++) {
            this.daysInMonth.push(i);
        }
    }

    async previousMonth(): Promise<void> {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        this.generateCalendar();
    }

    async nextMonth(): Promise<void> {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        this.generateCalendar();
    }

    getMonthName(): string {
        const months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    isToday(day: number): boolean {
        const today = new Date();
        return day === today.getDate() &&
            this.currentDate.getMonth() === today.getMonth() &&
            this.currentDate.getFullYear() === today.getFullYear();
    }

    getExpensesForDay(day: number): Expense[] {
        const dateStr = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return this.userData.expenses.filter((e: Expense) => e.date === dateStr);
    }

    getDayTotal(day: number): number {
        return this.getExpensesForDay(day).reduce((sum: number, e: Expense) => sum + e.amount, 0);
    }

    getCategoryForExpense(description: string): ExpenseCategory {
        return this.categories.find(c => description.includes(c.name)) || this.categories[this.categories.length - 1];
    }

    selectCategory(category: string): void {
        this.selectedCategory = category;
    }

    addExpense(): void {
        const amount = this.expenseAmount;
        if (amount && amount > 0 && this.selectedDate) {
            let description = this.expenseDescription;
            if (this.selectedCategory && !description.includes(this.selectedCategory)) {
                description = this.selectedCategory + (description ? ': ' + description : '');
            }

            const expense: Expense = {
                date: this.selectedDate,
                amount: amount,
                description: description || 'Költés'
            };
            console.log('[Calendar] Adding expense:', expense);
            console.log('[Calendar] Token present:', localStorage.getItem('auth_token') ? '✓ Yes' : '✗ No');
            this.budgetService.addExpense(expense).then(() => {
                console.log('[Calendar] Expense added successfully');
                this.expenseAmount = null;
                this.expenseDescription = '';
                this.selectedCategory = '';
                this.generateCalendar();
            }).catch(err => {
                console.error('[Calendar] Error adding expense:', err);
                this.errorService.handleError(err, 'Hiba a költés hozzáadásakor');
            });
        }
    }

    formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    goToSettings(): void {
        this.router.navigate(['/login']);
    }

    logout(): void {
        this.budgetService.logout();
        this.router.navigate(['/login']);
    }

    getRemainingBudget(): number {
        return this.budgetService.userData().salary - this.budgetService.getTotalFixedDeductions() - this.spentThisMonth;
    }

    // Chart data
    getCategoryTotals(): { category: ExpenseCategory; total: number; percentage: number }[] {
        const totals: { [key: string]: number } = {};
        let grandTotal = 0;

        this.userData.expenses.forEach((expense: Expense) => {
            const category = this.getCategoryForExpense(expense.description);
            const key = category.name;
            if (!totals[key]) totals[key] = 0;
            totals[key] += expense.amount;
            grandTotal += expense.amount;
        });

        return this.categories
            .map(cat => ({
                category: cat,
                total: totals[cat.name] || 0,
                percentage: grandTotal > 0 ? ((totals[cat.name] || 0) / grandTotal) * 100 : 0
            }))
            .filter(item => item.total > 0)
            .sort((a, b) => b.total - a.total);
    }

    getTopExpenses(): { description: string; amount: number; category: ExpenseCategory }[] {
        return this.userData.expenses
            .map((expense: Expense) => ({
                description: expense.description,
                amount: expense.amount,
                category: this.getCategoryForExpense(expense.description)
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }

    // Pie chart offset számítás
    getPieOffset(index: number): number {
        let offset = 0;
        const totals = this.getCategoryTotals();
        for (let i = 0; i < index; i++) {
            offset += totals[i].percentage * 2.51;
        }
        return -offset;
    }

    getTotalFixedDeductions(): number {
        return this.budgetService.getTotalFixedDeductions();
    }

    // Day editor methods
    openDayEditor(day: number): void {
        this.selectedDay = day;
        this.showDayEditor = true;
    }

    closeDayEditor(): void {
        this.showDayEditor = false;
        this.selectedDay = 0;
    }

    getSelectedDayDate(): string {
        const months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
        return `${this.selectedDay}. ${months[this.currentDate.getMonth()]}`;
    }

    addExpenseToSelectedDay(): void {
        const amount = this.expenseAmount;
        if (amount && amount > 0) {
            const dateStr = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDay).padStart(2, '0')}`;
            let description = this.expenseDescription;
            if (this.selectedCategory && !description.includes(this.selectedCategory)) {
                description = this.selectedCategory + (description ? ': ' + description : '');
            }

            const expense: Expense = {
                date: dateStr,
                amount: amount,
                description: description || 'Költés'
            };
            this.budgetService.addExpense(expense).then(() => {
                this.expenseAmount = null;
                this.expenseDescription = '';
                this.selectedCategory = '';
                this.generateCalendar();
            }).catch(err => {
                this.errorService.handleError(err, 'Hiba a költés hozzáadásakor');
            });
        }
    }

    deleteExpense(index: number): void {
        if (this.editingExpenseIndex === index) {
            this.cancelEdit();
            return;
        }

        const expenses = this.getExpensesForDay(this.selectedDay);
        if (expenses[index]) {
            const currentExpenses = [...this.userData.expenses];
            const expToDelete = expenses[index];
            const actualIndex = currentExpenses.findIndex(e => 
                e.date === expToDelete.date && 
                e.amount === expToDelete.amount && 
                e.description === expToDelete.description
            );
            if (actualIndex > -1) {
                currentExpenses.splice(actualIndex, 1);
                const currentUserData = this.userData;
                this.budgetService.userData.set({
                    ...currentUserData,
                    expenses: currentExpenses
                });
                this.budgetService.saveUserData();
            }
        }
    }

    startEdit(index: number): void {
        this.editingExpenseIndex = index;
        const expenses = this.getExpensesForDay(this.selectedDay);
        const expense = expenses[index];
        if (expense) {
            this.tempExpenseAmount = expense.amount;
            this.tempExpenseDescription = expense.description;
        }
    }

    async saveEdit(): Promise<void> {
        if (this.editingExpenseIndex >= 0 && this.tempExpenseAmount && this.tempExpenseAmount > 0) {
            const dayExpenses = this.getExpensesForDay(this.selectedDay);
            const expense = dayExpenses[this.editingExpenseIndex];
            if (expense) {
                const globalIndex = this.userData.expenses.findIndex(e => 
                    e.date === expense.date && 
                    e.amount === expense.amount && 
                    e.description === expense.description
                );
                if (globalIndex > -1) {
                    const currentExpenses = [...this.userData.expenses];
                    currentExpenses[globalIndex] = {
                        ...expense,
                        amount: this.tempExpenseAmount,
                        description: this.tempExpenseDescription || expense.description
                    };
                    const currentUserData = this.userData;
                    this.budgetService.userData.set({
                        ...currentUserData,
                        expenses: currentExpenses
                    });
                    await this.budgetService.saveUserData();
                }
            }
        }
        this.cancelEdit();
    }

    cancelEdit(): void {
        this.editingExpenseIndex = -1;
        this.tempExpenseAmount = null;
        this.tempExpenseDescription = '';
    }
}
