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

  async checkAdmin(): Promise<boolean> {
    const token = localStorage.getItem('auth_token');
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
    return localStorage.getItem('auth_token') !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('is_admin');
    window.location.reload();
  }
}

