import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorService } from './error.service';

// =======================
// MODELS (fix export hiba)
// =======================
export interface FixedDeduction {
  id?: number;
  name: string;
  amount: number;
}

export interface Notification {
  id?: number;
  name: string;
  amount: number;
  day?: number;
  recurring?: boolean;
  message?: string;
}

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  date: string;
}

export interface UserData {
  salary: number;
  fixedDeductions: FixedDeduction[];
  notifications: Notification[];
  expenses: Expense[];
}

export interface LoginResponse {
  success: boolean;
  userId?: string;
  token?: string;
  is_admin?: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private http = inject(HttpClient);
  private errorService = inject(ErrorService);

  private API = environment.apiBaseUrl;

  private tokenKey = 'auth_token';
  private userKey = 'budget_user';
  private adminKey = 'is_admin';

  // =======================
  // STATE
  // =======================
  userData = signal<UserData>({
    salary: 0,
    fixedDeductions: [],
    notifications: [],
    expenses: []
  });

  private userId: string | null = null;
  private token: string | null = null;
  private isAdmin = false;

  constructor() {
    this.loadStorage();
  }

  // =======================
  // STORAGE
  // =======================
  private loadStorage() {
    this.userId = localStorage.getItem(this.userKey);
    this.token = localStorage.getItem(this.tokenKey);
    this.isAdmin = localStorage.getItem(this.adminKey) === 'true';
  }

  private saveAuth(userId: string, token: string, admin: boolean) {
    localStorage.setItem(this.userKey, userId);
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.adminKey, admin ? 'true' : 'false');

    this.userId = userId;
    this.token = token;
    this.isAdmin = admin;
  }

  private clearAuth() {
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminKey);

    this.userId = null;
    this.token = null;
    this.isAdmin = false;
  }

  // =======================
  // AUTH HELPERS (FIXED)
  // =======================
  isLoggedIn(): boolean {
    return !!this.token;
  }

  isAdminUser(): boolean {
    return this.isAdmin;
  }

  getToken(): string | null {
    return this.token;
  }

  logout(): void {
    this.http.post(`${this.API}/logout`, {}).subscribe({
      complete: () => this.completeLogout()
    });
  }

  private completeLogout(): void {
    this.clearAuth();
    this.clearAllData();
    window.location.href = '/login';
  }

  clearAllData(): void {
    this.userData.set({
      salary: 0,
      fixedDeductions: [],
      notifications: [],
      expenses: []
    });
  }

  async refreshToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await lastValueFrom(
        this.http.post<any>(`${this.API}/refresh`, {})
      );
      if (response?.token) {
        localStorage.setItem(this.tokenKey, response.token);
        this.token = response.token;
        return true;
      }
      return false;
    } catch (err) {
      this.errorService.handleError(err, 'Token refresh sikertelen');
      return false;
    }
  }

  // =======================
  // AUTH API
  // =======================
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, { username, password }).pipe(
      tap(res => {
        if (res.success && res.token && res.userId) {
          this.saveAuth(res.userId, res.token, res.is_admin ?? false);
        }
      }),
      catchError(err => {
        this.errorService.handleError(err, 'Login hiba');
        return throwError(() => err);
      })
    );
  }

  register(username: string, password: string, email?: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/register`, {
      username,
      password,
      email
    }).pipe(
      tap(res => {
        if (res.success && res.token && res.userId) {
          this.saveAuth(res.userId, res.token, res.is_admin ?? false);
        }
      }),
      catchError(err => {
        this.errorService.handleError(err, 'Register hiba');
        return throwError(() => err);
      })
    );
  }

  // =======================
  // USER DATA
  // =======================
  async loadUserData() {
    if (!this.token) return;

    const data = await lastValueFrom(
      this.http.get<any>(`${this.API}/user`)
    );

    this.userData.set({
      salary: data.salary ?? 0,
      fixedDeductions: data.fixedDeductions ?? [],
      notifications: data.notifications ?? [],
      expenses: data.expenses ?? []
    });
  }

  async saveUserData() {
    if (!this.token) return;

    await lastValueFrom(
      this.http.post(`${this.API}/user`, this.userData())
    );
  }

  // =======================
  // EXPENSES
  // =======================
  async addExpense(expense: Expense) {
    await lastValueFrom(
      this.http.post(`${this.API}/expenses`, expense)
    );
    await this.loadUserData();
  }

  // =======================
  // SALARY
  // =======================
  async updateSalary(salary: number) {
    await lastValueFrom(
      this.http.post(`${this.API}/user/salary`, { salary })
    );

    this.userData.update(u => ({ ...u, salary }));
  }

  // =======================
  // FIXED CALC FUNCTIONS (PUBLIC FIX)
  // =======================
  getTotalFixedDeductions(): number {
    return this.userData().fixedDeductions
      .reduce((sum, d) => sum + d.amount, 0);
  }

  getSpentThisMonth(): number {
    return this.userData().expenses
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getDailyBudget(): number {
    const salary = this.userData().salary;
    const fixed = this.getTotalFixedDeductions();
    const spent = this.getSpentThisMonth();

    const days = 30;
    return Math.max(0, (salary - fixed - spent) / days);
  }

  getWeeklyLimitStatus(): { warning: boolean; exceeded: boolean; message: string } {
    const limit = this.getDailyBudget() * 7;
    const spent = this.getSpentThisMonth();

    if (spent > limit) {
      return { warning: true, exceeded: true, message: 'Túllépted a heti keretet!' };
    }

    if (spent > limit * 0.7) {
      return { warning: true, exceeded: false, message: 'Közel a heti limit!' };
    }

    return { warning: false, exceeded: false, message: '' };
  }

  getTodaysNotifications(): Notification[] {
    const day = new Date().getDate();
    return this.userData().notifications.filter(n => n.day === day);
  }

  // =======================
  // FIXED DEDUCTIONS
  // =======================
  async addFixedDeduction(deduction: FixedDeduction) {
    await lastValueFrom(
      this.http.post(`${this.API}/deductions`, deduction)
    );
    await this.loadUserData();
  }

  // =======================
  // NOTIFICATIONS
  // =======================
  async addNotification(notification: Notification) {
    await lastValueFrom(
      this.http.post(`${this.API}/notifications`, notification)
    );
    await this.loadUserData();
  }
}