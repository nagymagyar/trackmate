export interface FixedDeduction {
  id?: number;
  name: string;
  amount: number;
}

export interface Notification {
  id?: number;
  name: string;
  amount: number;
  day: number;
  recurring: boolean;
}

export interface Expense {
  id?: number;
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
  token?: string;
  is_admin?: boolean;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  userId?: string;
  token?: string;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

