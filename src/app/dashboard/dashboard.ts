import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BudgetService } from '../services/budget.service';
import { Router } from '@angular/router';
import { ThemeService, Theme, THEMES } from '../services/theme.service';
import { environment } from '../../environments/environment';

interface BackendUser {
  id: number;
  name: string;
  email: string;
  salary: number;
  expenses_count: number;
  expenses_sum_amount: number;
  is_admin: boolean;
}

interface NewUser {
  username: string;
  password: string;
  email: string;
  salary: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  public http = inject(HttpClient);
  public budgetService = inject(BudgetService);
  public router = inject(Router);
  public themeService = inject(ThemeService);

  themes: Theme[] = THEMES;
  showThemeSelector = false;

  // Admin login
  adminUsername = '';
  adminPassword = '';
  loginError = '';
  showLoginForm = false;
  adminLoggedIn = true;

  // CRUD
  newUser: NewUser = { username: '', password: '', email: '', salary: 0 };
  editUserId = 0;
  editUserSalary = 0;
  editUserEmail = '';
  showNewUserForm = false;
  showEditForm = false;

  allUsers: BackendUser[] = [];
  totalUsers = 0;
  rawData: any = null;
  serverStatus = 'loading';
  loggedInUserSalary = 0;
  isLoggedIn = false;
  showStats = false;
  showRaw = false;

  private readonly API_BASE = environment.apiBaseUrl;

  ngOnInit() {
    this.isLoggedIn = this.budgetService.isLoggedIn();
    this.loadLoggedInUserData();
    this.loadBackendData();
    this.checkServerStatus();
  }

  private async loadBackendData() {
    try {
      const response = await this.http.get<any>(`${this.API_BASE}/admin/users`).toPromise();
      if (response && response.success) {
        this.allUsers = (response.users || []).map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          salary: user.salary || 0,
          expenses_count: user.expenses_count || 0,
          expenses_sum_amount: user.expenses_sum_amount || 0,
          is_admin: user.is_admin || false,
        }));
        this.totalUsers = response.totalUsers || 0;
        this.serverStatus = 'online';
      } else {
        this.serverStatus = 'offline';
      }
    } catch (error) {
      this.serverStatus = 'offline';
      console.error('Admin data load error:', error);
    }
  }

  private loadLoggedInUserData() {
    if (this.isLoggedIn) {
      const data = this.budgetService.userData();
      this.loggedInUserSalary = data.salary || 0;
    }
  }

  checkServerStatus() {
    this.http.get(`${this.API_BASE}/admin/stats`).subscribe({
      next: () => this.serverStatus = 'online',
      error: () => this.serverStatus = 'offline'
    });
  }

  loadRawData() {
    this.http.get(`${this.API_BASE}/admin/users`).subscribe({
      next: (data) => this.rawData = data,
      error: (err) => console.error('Raw data error:', err)
    });
  }

  getAverageSalary(): number {
    if (this.allUsers.length === 0) return 0;
    return this.allUsers.reduce((sum, user) => sum + user.salary, 0) / this.allUsers.length;
  }

  toggleThemeSelector(): void {
    this.showThemeSelector = !this.showThemeSelector;
  }

  selectTheme(index: number): void {
    this.themeService.setTheme(index);
    this.showThemeSelector = false;
  }

  adminLogin(): void {
    this.loginError = '';
    this.http.post<any>(`${this.API_BASE}/login`, { username: this.adminUsername, password: this.adminPassword }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showLoginForm = false;
          this.adminLoggedIn = true;
          this.loadBackendData();
        } else {
          this.loginError = res.message || 'Hibás adatok';
        }
      },
      error: () => {
        this.loginError = 'Szerver hiba';
      }
    });
  }

  createUser(): void {
    this.http.post(`${this.API_BASE}/admin/users`, this.newUser).subscribe({
      next: () => {
        this.newUser = { username: '', password: '', email: '', salary: 0 };
        this.showNewUserForm = false;
        this.loadBackendData();
      },
      error: (err) => console.error('Create user error', err)
    });
  }

  editUser(user: BackendUser): void {
    this.editUserId = user.id;
    this.editUserSalary = user.salary;
    this.editUserEmail = user.email;
    this.showEditForm = true;
  }

  updateUser(): void {
    const updates = { salary: this.editUserSalary, email: this.editUserEmail };
    this.http.put(`${this.API_BASE}/admin/users/${this.editUserId}`, updates).subscribe({
      next: () => {
        this.showEditForm = false;
        this.loadBackendData();
      },
      error: (err) => console.error('Update user error', err)
    });
  }

  deleteUser(userId: number): void {
    const user = this.allUsers.find(u => u.id === userId);
    if (confirm(`Biztosan törölni szeretnéd a felhasználót: ${user?.name}?`)) {
      this.http.delete(`${this.API_BASE}/admin/users/${userId}`).subscribe({
        next: () => this.loadBackendData(),
        error: (err) => console.error('Delete user error', err)
      });
    }
  }
}

