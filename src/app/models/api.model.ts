export interface ApiSuccessResponse {
  success: true;
  message?: string;
}

export interface PingResponse {
  status: string;
  timestamp: string;
}

export interface AdminUsersResponse {
  users: Record<string, Omit<any, 'password'>>;
  totalUsers: number;
  dataFileSize: number;
}

export interface BackendUser {
  username: string;
  salary: number;
  expensesCount: number;
  totalSpent: number;
}

export interface NewUserRequest {
  username: string;
  password: string;
  email: string;
  salary: number;
}

