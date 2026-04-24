import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, lastValueFrom, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorService } from './error.service';
import type {
  FixedDeduction,
  Notification,
  Expense,
  UserData,
  LoginResponse
} from '../models/user.model';

// Re-export for backward compatibility with existing imports
export type { FixedDeduction, Notification, Expense, UserData, LoginResponse };

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly errorService = inject(ErrorService);

  private readonly API_BASE = environment.apiBaseUrl;
  private readonly storageKey = 'budget_app_user';
  private readonly tokenKey = 'auth_token';

  userData = signal<UserData>({
    salary: 0,
    fixedDeductions: [],
    notifications: [],
    expenses: []
  });

  private currentUserId: string | null = null;
  private authToken: string | null = null;
  private isAdmin: boolean = false;

  constructor() {
    this.loadFromStorage();
  }

  // --- Session Management ---

  private async loadFromStorage(): Promise<void> {
    this.currentUserId = localStorage.getItem(this.storageKey);
    this.authToken = localStorage.getItem(this.tokenKey);
    const adminFlag = localStorage.getItem('is_admin');
    this.isAdmin = adminFlag === 'true';
    if (this.currentUserId && this.authToken) {
      await this.loadUserData();
    }
  }

  private saveUserId(userId: string): void {
    localStorage.setItem(this.storageKey, userId);
    this.currentUserId = userId;
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.authToken = token;
  }

  private saveAdminFlag(isAdmin: boolean): void {
    localStorage.setItem('is_admin', isAdmin ? 'true' : 'false');
    this.isAdmin = isAdmin;
  }

  private clearUserId(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('is_admin');
    this.currentUserId = null;
    this.authToken = null;
    this.isAdmin = false;
  }

  isLoggedIn(): boolean {
    return this.currentUserId !== null && this.authToken !== null;
  }

  isAdminUser(): boolean {
    return this.isAdmin;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  logout(): void {
    // Call backend logout if token exists
    if (this.authToken) {
      this.http.post(`${this.API_BASE}/logout`, {}).subscribe({
        error: () => { /* ignore */ }
      });
    }

    this.userData.set({
      salary: 0,
      fixedDeductions: [],
      notifications: [],
      expenses: []
    });
    this.clearUserId();
  }

  clearAllData(): void {
    this.userData.set({
      salary: 0,
      fixedDeductions: [],
      notifications: [],
      expenses: []
    });
  }

  // --- Auth ---

  private apiLogin(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/login`, { username, password });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.apiLogin(username, password).pipe(
      tap(response => {
        if (response.success) {
          this.saveUserId(response.userId!);
          this.saveToken(response.token!);
          this.saveAdminFlag(response.is_admin || false);
          this.loadUserData();
        }
      }),
      catchError(err => {
        this.errorService.handleError(err, 'Bejelentkezési hiba');
        return throwError(() => err);
      })
    );
  }

  private apiRegister(username: string, password: string, email?: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/register`, { username, password, email });
  }

  register(username: string, password: string, email?: string): Observable<LoginResponse> {
    return this.apiRegister(username, password, email).pipe(
      tap(response => {
        if (response.success) {
          this.saveUserId(response.userId!);
          this.saveToken(response.token!);
          this.saveAdminFlag(response.is_admin || false);
        }
      }),
      catchError(err => {
        this.errorService.handleError(err, 'Regisztrációs hiba');
        return throwError(() => err);
      })
    );
  }

  // --- Data Persistence ---

  async loadUserData(): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      const data = await lastValueFrom(
        this.http.get<any>(`${this.API_BASE}/user`).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Adatok betöltési hiba');
            return throwError(() => err);
          })
        )
      );

      if (data && data.success) {
        this.userData.set({
          salary: data.salary || 0,
          fixedDeductions: data.fixedDeductions || [],
          notifications: data.notifications || [],
          expenses: data.expenses || []
        });
        this.checkAndResetMonthlyExpenses();
      }
    } catch {
      // Error already handled by interceptor + error service
    }
  }

  async saveUserData(): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      await lastValueFrom(
        this.http.post(`${this.API_BASE}/user`, this.userData()).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Adatok mentési hiba');
            return throwError(() => err);
          })
        )
      );
    } catch {
      // Error already handled
    }
  }

  async updateExpense(expenseId: number, updatedExpense: Expense): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      await lastValueFrom(
        this.http.put(`${this.API_BASE}/expenses/${expenseId}`, updatedExpense).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Költés frissítési hiba');
            return throwError(() => err);
          })
        )
      );
    } catch {
      // Error already handled
    }
  }

  // --- CRUD Operations ---

  async addExpense(expense: Expense): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      const response = await lastValueFrom(
        this.http.post<any>(`${this.API_BASE}/expenses`, expense).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Költés rögzítési hiba');
            return throwError(() => err);
          })
        )
      );
      if (response.success && response.expense) {
        const current = this.userData();
        this.userData.set({
          ...current,
          expenses: [...current.expenses, response.expense]
        });
      }
      this.errorService.handleSuccess('Költés rögzítve');
    } catch {
      // Error already handled
    }
  }

  async updateSalary(salary: number): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      await lastValueFrom(
        this.http.post(`${this.API_BASE}/user/salary`, { salary }).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Fizetés frissítési hiba');
            return throwError(() => err);
          })
        )
      );
      const current = this.userData();
      this.userData.set({ ...current, salary });
    } catch {
      // Error already handled
    }
  }

  async addFixedDeduction(deduction: FixedDeduction): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      const response = await lastValueFrom(
        this.http.post<any>(`${this.API_BASE}/deductions`, deduction).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Fix kiadás rögzítési hiba');
            return throwError(() => err);
          })
        )
      );
      if (response.success && response.deduction) {
        const current = this.userData();
        this.userData.set({
          ...current,
          fixedDeductions: [...current.fixedDeductions, response.deduction]
        });
      }
    } catch {
      // Error already handled
    }
  }

  async updateFixedDeduction(id: number, updated: FixedDeduction): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      await lastValueFrom(
        this.http.put(`${this.API_BASE}/deductions/${id}`, updated).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Fix kiadás frissítési hiba');
            return throwError(() => err);
          })
        )
      );
      const current = this.userData();
      const deductions = [...current.fixedDeductions];
      const index = deductions.findIndex(d => d.id === id);
      if (index >= 0) {
        deductions[index] = updated;
        this.userData.set({ ...current, fixedDeductions: deductions });
      }
      this.errorService.handleSuccess('Fix kiadás frissítve');
    } catch {
      // Error already handled
    }
  }

  async addNotification(notification: Notification): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      const response = await lastValueFrom(
        this.http.post<any>(`${this.API_BASE}/notifications`, notification).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Értesítés rögzítési hiba');
            return throwError(() => err);
          })
        )
      );
      if (response.success && response.notification) {
        const current = this.userData();
        this.userData.set({
          ...current,
          notifications: [...current.notifications, response.notification]
        });
      }
    } catch {
      // Error already handled
    }
  }

  async removeFixedDeduction(id: number): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      await lastValueFrom(
        this.http.delete(`${this.API_BASE}/deductions/${id}`).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Fix kiadás törlési hiba');
            return throwError(() => err);
          })
        )
      );
      const current = this.userData();
      this.userData.set({
        ...current,
        fixedDeductions: current.fixedDeductions.filter(d => d.id !== id)
      });
    } catch {
      // Error already handled
    }
  }

  async removeNotification(id: number): Promise<void> {
    if (!this.currentUserId || !this.authToken) return;

    try {
      await lastValueFrom(
        this.http.delete(`${this.API_BASE}/notifications/${id}`).pipe(
          catchError(err => {
            this.errorService.handleError(err, 'Értesítés törlési hiba');
            return throwError(() => err);
          })
        )
      );
      const current = this.userData();
      this.userData.set({
        ...current,
        notifications: current.notifications.filter(n => n.id !== id)
      });
    } catch {
      // Error already handled
    }
  }

  // --- Monthly Reset ---

  public async checkAndResetMonthlyExpenses(): Promise<void> {
    if (!this.currentUserId) return;

    const currentMonthKey = this.getMonthKey();
    const lastMonthKey = localStorage.getItem(`budget_app_last_month_${this.currentUserId}`);

    if (lastMonthKey !== currentMonthKey) {
      const current = this.userData();
      // Only reset expenses locally, backend keeps history
      this.userData.set({
        ...current,
        expenses: []
      });
      localStorage.setItem(`budget_app_last_month_${this.currentUserId}`, currentMonthKey);
      await this.saveUserData();
      this.errorService.handleSuccess('Új hónap! Költések nullázva.');
    }
  }

  private getMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // --- Business Logic / Calculations ---

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
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
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
}

