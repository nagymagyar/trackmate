import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BudgetService } from '../services/budget.service';
import { ThemeService, Theme, THEMES } from '../services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  themes: Theme[] = THEMES;
  showThemeSelector = false;

  // User data
  salary = 0;
  fixedDeductionsTotal = 0;
  spentThisMonth = 0;
  dailyBudget = 0;
  remainingBudget = 0;
  weeklyStatus = { warning: false, exceeded: false, message: '' };
  todaysNotifications: any[] = [];

  // Stats
  totalExpenses = 0;
  daysInMonth = 0;
  currentMonthName = '';
  currentDay = 0;

  ngOnInit() {
    if (!this.budgetService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadDataFromServer();
  }

  async loadDataFromServer(): Promise<void> {
    try {
      // Load fresh data from backend
      await this.budgetService.loadUserData();
      this.loadData();
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fall back to local data
      this.loadData();
    }
  }

  loadData(): void {
    const data = this.budgetService.userData();
    this.salary = data.salary;
    this.fixedDeductionsTotal = this.budgetService.getTotalFixedDeductions();
    this.spentThisMonth = this.budgetService.getSpentThisMonth();
    this.dailyBudget = this.budgetService.getDailyBudget();
    this.remainingBudget = this.salary - this.fixedDeductionsTotal - this.spentThisMonth;
    this.weeklyStatus = this.budgetService.getWeeklyLimitStatus();
    this.todaysNotifications = this.budgetService.getTodaysNotifications();
    this.totalExpenses = data.expenses.length;

    const now = new Date();
    this.currentDay = now.getDate();
    this.daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
    this.currentMonthName = `${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  get isAdmin(): boolean {
    return this.budgetService.isAdminUser();
  }

  toggleThemeSelector(): void {
    this.showThemeSelector = !this.showThemeSelector;
  }

  selectTheme(index: number): void {
    this.themeService.setTheme(index);
    this.showThemeSelector = false;
  }

  goToMain(): void {
    this.router.navigate(['/main']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToAdmin(): void {
    window.open('http://localhost:4201', '_blank');
  }

  logout(): void {
    this.budgetService.logout();
    this.router.navigate(['/login']);
  }
}

