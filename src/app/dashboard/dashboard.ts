import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BudgetService } from '../services/budget.service';
import { Router } from '@angular/router';
import { ThemeService, Theme, THEMES } from '../services/theme.service';

interface BackendUser {
  username: string;
  salary: number;
  expensesCount: number;
  totalSpent: number;
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
  editUserUsername = '';
  editUserSalary = 0;
  editUserEmail = '';
  showNewUserForm = false;
  showEditForm = false;

  allUsers: BackendUser[] = [];
  totalUsers = 0;
  dataFileSize = 0;
  rawData: any = null;
  serverStatus = 'loading';
  loggedInUserSalary = 0;
  isLoggedIn = false;
  showStats = false;
  showRaw = false;

  ngOnInit() {
    this.isLoggedIn = this.budgetService.isLoggedIn();
    this.loadLoggedInUserData();
    this.loadBackendData();
    this.checkServerStatus();
  }

  private async loadBackendData() {
    try {
      const response = await this.http.get<any>('http://localhost:3000/api/admin/users').toPromise();
      this.allUsers = Object.entries(response.users || {}).map(([username, user]: [string, any]) => ({
        username,
        salary: user.salary || 0,
        expensesCount: (user.expenses || []).length,
        totalSpent: (user.expenses || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
      }));
      this.totalUsers = response.totalUsers || 0;
      this.dataFileSize = response.dataFileSize || 0;
      this.serverStatus = 'online';
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
    this.http.get('http://localhost:3000/api/ping').subscribe({
      next: () => this.serverStatus = 'online',
      error: () => this.serverStatus = 'offline'
    });
  }

  loadRawData() {
    this.http.get('http://localhost:3000/api/admin/raw').subscribe({
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
    this.http.post<any>('http://localhost:3000/api/login', { username: this.adminUsername, password: this.adminPassword }).subscribe({
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
    this.http.post('http://localhost:3000/api/admin/user', this.newUser).subscribe({
      next: () => {
        this.newUser = { username: '', password: '', email: '', salary: 0 };
        this.showNewUserForm = false;
        this.loadBackendData();
      },
      error: (err) => console.error('Create user error', err)
    });
  }

  editUser(user: BackendUser): void {
    this.editUserUsername = user.username;
    this.editUserSalary = user.salary;
    this.editUserEmail = '';
    this.showEditForm = true;
  }

  updateUser(): void {
    const updates = { salary: this.editUserSalary, email: this.editUserEmail };
    this.http.put(`http://localhost:3000/api/admin/user/${this.editUserUsername}`, updates).subscribe({
      next: () => {
        this.showEditForm = false;
        this.loadBackendData();
      },
      error: (err) => console.error('Update user error', err)
    });
  }

  deleteUser(username: string): void {
    if (confirm(`Biztosan törölni szeretnéd a felhasználót: ${username}?`)) {
      this.http.delete(`http://localhost:3000/api/admin/user/${username}`).subscribe({
        next: () => this.loadBackendData(),
        error: (err) => console.error('Delete user error', err)
      });
    }
  }
}

