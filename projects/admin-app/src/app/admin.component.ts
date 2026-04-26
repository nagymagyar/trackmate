import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';

interface BackendUser {
  id: number;
  name: string;
  email: string;
  salary: number;
  expenses_count: number;
  expenses_sum_amount: number;
  is_admin: boolean;
  created_at?: string;
}

interface UserExpense {
  id: number;
  user_id: number;
  date: string;
  amount: number;
  description: string;
  created_at: string;
}

interface NewUser {
  username: string;
  password: string;
  email: string;
  salary: number;
}

interface AdminStats {
  totalUsers: number;
  totalExpenses: number;
  totalSpent: number;
  averageSalary: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Sidebar
  sidebarCollapsed = false;
  activeSection: 'overview' | 'users' | 'expenses' | 'analytics' | 'settings' = 'overview';

  // Auth
  isLoggedIn = false;
  isAdmin = false;
  adminUsername = '';
  adminPassword = '';
  loginError = '';

  // Data
  allUsers: BackendUser[] = [];
  allExpenses: UserExpense[] = [];
  totalUsers = 0;
  adminStats: AdminStats | null = null;
  serverStatus: 'loading' | 'online' | 'offline' = 'loading';

  // Selected user detail
  selectedUser: BackendUser | null = null;
  selectedUserExpenses: UserExpense[] = [];
  showUserDetail = false;

  // CRUD
  newUser: NewUser = { username: '', password: '', email: '', salary: 0 };
  editUserId = 0;
  editUserSalary = 0;
  editUserEmail = '';
  showNewUserForm = false;
  showEditForm = false;

  // Expense Editing
  editingExpenseId = 0;
  editingExpenseAmount = 0;
  showEditExpenseForm = false;

  // Search & Sort
  searchTerm = '';
  expenseSearchTerm = '';
  sortColumn: keyof BackendUser = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Theme
  isDarkTheme = true;

  readonly API_BASE = environment.apiBaseUrl;

  ngOnInit() {
    this.checkAuth();
  }

  private async checkAuth() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (!this.isLoggedIn) {
      return;
    }

    this.isAdmin = await this.authService.checkAdmin();
    if (this.isAdmin) {
      this.loadAllData();
    } else {
      this.isLoggedIn = false;
      this.loginError = 'Nincs admin jogosultságod! Kérlek jelentkezz be admin felhasználóval.';
    }
  }

  adminLogin(): void {
    this.loginError = '';
    this.http.post<any>(`${this.API_BASE}/login`, {
      username: this.adminUsername,
      password: this.adminPassword
    }).subscribe({
      next: (res) => {
        if (res.success) {
          localStorage.setItem('auth_token', res.token!);
          localStorage.setItem('is_admin', res.is_admin ? 'true' : 'false');
          this.isLoggedIn = true;
          this.isAdmin = res.is_admin || false;
          if (this.isAdmin) {
            this.loadAllData();
          } else {
            this.loginError = 'Nincs admin jogosultságod!';
            this.logout();
          }
        } else {
          this.loginError = res.message || 'Hibás adatok';
        }
      },
      error: () => this.loginError = 'Szerver hiba'
    });
  }

  private async loadAllData() {
    await this.loadBackendData();
    this.loadStats();
    this.loadAllExpenses();
    this.checkServerStatus();
  }

  private async loadBackendData() {
    try {
      const response = await this.http.get<any>(`${this.API_BASE}/admin/users`).toPromise();
      if (response?.success) {
        this.allUsers = (response.users || []).map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          salary: user.salary || 0,
          expenses_count: user.expenses_count || 0,
          expenses_sum_amount: user.expenses_sum_amount || 0,
          is_admin: user.is_admin || false,
          created_at: user.created_at,
        }));
        this.totalUsers = response.totalUsers || 0;
        this.serverStatus = 'online';
      } else {
        this.serverStatus = 'offline';
      }
    } catch {
      this.serverStatus = 'offline';
    }
  }

  private loadStats() {
    this.http.get<any>(`${this.API_BASE}/admin/stats`).subscribe({
      next: (data) => {
        if (data?.success) this.adminStats = data.stats;
      },
      error: () => {}
    });
  }

  private loadAllExpenses() {
    this.http.get<any>(`${this.API_BASE}/expenses`).subscribe({
      next: (data) => {
        if (data?.success) this.allExpenses = data.expenses || [];
      },
      error: () => {}
    });
  }

  checkServerStatus() {
    this.http.get(`${this.API_BASE}/admin/stats`).subscribe({
      next: () => this.serverStatus = 'online',
      error: () => this.serverStatus = 'offline'
    });
  }

  // User Detail
  openUserDetail(user: BackendUser): void {
    this.selectedUser = user;
    this.http.get<any>(`${this.API_BASE}/admin/users/${user.id}`).subscribe({
      next: (data) => {
        if (data?.success?.user?.expenses) {
          this.selectedUserExpenses = data.user.expenses;
        }
        this.showUserDetail = true;
      },
      error: () => {
        this.selectedUserExpenses = [];
        this.showUserDetail = true;
      }
    });
  }

  closeUserDetail(): void {
    this.showUserDetail = false;
    this.selectedUser = null;
    this.selectedUserExpenses = [];
  }

  // Filtering & Sorting
  get filteredUsers(): BackendUser[] {
    let users = this.allUsers;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }
    users = [...users].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return this.sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return users;
  }

  get filteredExpenses(): UserExpense[] {
    let expenses = this.allExpenses;
    if (this.expenseSearchTerm.trim()) {
      const term = this.expenseSearchTerm.toLowerCase();
      expenses = expenses.filter(e =>
        e.description.toLowerCase().includes(term) ||
        e.amount.toString().includes(term)
      );
    }
    return expenses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  setSort(column: keyof BackendUser): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getAverageSalary(): number {
    if (this.allUsers.length === 0) return 0;
    return this.allUsers.reduce((sum, user) => sum + user.salary, 0) / this.allUsers.length;
  }

  getTotalSpent(): number {
    return this.allUsers.reduce((sum, user) => sum + user.expenses_sum_amount, 0);
  }

  getRecentUsers(count: number): BackendUser[] {
    return [...this.allUsers].sort((a, b) => (b.id - a.id)).slice(0, count);
  }

  getTopSpenders(count: number): BackendUser[] {
    return [...this.allUsers].sort((a, b) => b.expenses_sum_amount - a.expenses_sum_amount).slice(0, count);
  }

  // Sidebar
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setSection(section: 'overview' | 'users' | 'expenses' | 'analytics' | 'settings'): void {
    this.activeSection = section;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
  }

  getSectionTitle(): string {
    const titles: Record<string, string> = {
      overview: 'Áttekintés',
      users: 'Felhasználók kezelése',
      expenses: 'Költések',
      analytics: 'Analitika',
      settings: 'Beállítások'
    };
    return titles[this.activeSection] || 'Admin';
  }

  getUserNameById(userId: number): string {
    const user = this.allUsers.find(u => u.id === userId);
    return user?.name || `User #${userId}`;
  }

  getExpensePercentage(amount: number): number {
    const max = Math.max(...this.allUsers.map(u => u.expenses_sum_amount), 1);
    return (amount / max) * 100;
  }

  // CRUD
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

  // Expense Management
  deleteExpense(expenseId: number): void {
    const expense = this.allExpenses.find(e => e.id === expenseId);
    if (confirm(`Biztosan törölni szeretnéd ezt a költést: ${expense?.description}?`)) {
      this.http.delete(`${this.API_BASE}/expenses/${expenseId}`).subscribe({
        next: () => this.loadAllExpenses(),
        error: (err) => console.error('Delete expense error', err)
      });
    }
  }

  editExpense(expense: UserExpense): void {
    const newAmount = prompt(`Szerkesztés: ${expense.description}`, expense.amount.toString());
    if (newAmount !== null && !isNaN(Number(newAmount))) {
      this.http.put(`${this.API_BASE}/expenses/${expense.id}`, {
        amount: Number(newAmount)
      }).subscribe({
        next: () => this.loadAllExpenses(),
        error: (err) => console.error('Update expense error', err)
      });
    }
  }

  // User Salary & Email Management
  updateUserSalary(userId: number, newSalary: number): void {
    this.http.put(`${this.API_BASE}/admin/users/${userId}`, {
      salary: newSalary
    }).subscribe({
      next: () => this.loadBackendData(),
      error: (err) => console.error('Update salary error', err)
    });
  }

  updateUserEmail(userId: number, newEmail: string): void {
    if (!newEmail.includes('@')) {
      alert('Érvényes email cím szükséges!');
      return;
    }
    this.http.put(`${this.API_BASE}/admin/users/${userId}`, {
      email: newEmail
    }).subscribe({
      next: () => this.loadBackendData(),
      error: (err) => console.error('Update email error', err)
    });
  }

  // Bulk Actions
  deleteAllExpensesForUser(userId: number): void {
    const user = this.allUsers.find(u => u.id === userId);
    if (confirm(`Biztosan törölni szeretnéd az összes költést a(z) ${user?.name} felhasználónak?`)) {
      this.allExpenses.filter(e => e.user_id === userId).forEach(expense => {
        this.http.delete(`${this.API_BASE}/expenses/${expense.id}`).subscribe({
          next: () => {},
          error: (err) => console.error('Delete expense error', err)
        });
      });
      setTimeout(() => this.loadAllExpenses(), 500);
    }
  }

  resetUserData(userId: number): void {
    const user = this.allUsers.find(u => u.id === userId);
    if (confirm(`Biztosan szeretnéd a(z) ${user?.name} felhasználó összes adatát alaphelyzetbe állítani?`)) {
      this.http.post(`${this.API_BASE}/admin/users/${userId}/reset`, {}).subscribe({
        next: () => {
          this.loadBackendData();
          this.loadAllExpenses();
          alert('Felhasználó adatai alaphelyzetbe állítva');
        },
        error: (err) => console.error('Reset user error', err)
      });
    }
  }

  // Export Data
  exportUsersToCSV(): void {
    let csv = 'ID,Felhasználónév,Email,Fizetés,Költések száma,Összes költés\n';
    this.filteredUsers.forEach(user => {
      csv += `${user.id},"${user.name}","${user.email}",${user.salary},${user.expenses_count},${user.expenses_sum_amount}\n`;
    });
    this.downloadCSV(csv, 'users.csv');
  }

  exportExpensesToCSV(): void {
    let csv = 'ID,Felhasználó ID,Dátum,Összesg,Leírás\n';
    this.filteredExpenses.forEach(expense => {
      csv += `${expense.id},${expense.user_id},"${expense.date}",${expense.amount},"${expense.description}"\n`;
    });
    this.downloadCSV(csv, 'expenses.csv');
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  logout(): void {
    this.authService.logout();
  }
}

