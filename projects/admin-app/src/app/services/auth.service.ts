import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_BASE = environment.apiBaseUrl;
  private tokenKey = 'auth_token';

  async checkAdmin(): Promise<boolean> {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;

    try {
      const response = await lastValueFrom(
        this.http.get<any>(`${this.API_BASE}/me`)
      );
      return response?.is_admin === true || response?.user?.is_admin === true;
    } catch {
      return false;
    }
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.tokenKey) !== null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.http.post<any>(`${this.API_BASE}/refresh`, {})
      );
      if (response?.token) {
        this.setToken(response.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('is_admin');
    window.location.href = '/login';
  }
}

