import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/Auth';
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  register(data: any): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, data, {
      responseType: 'text'
    });
  }

  forgotPassword(data: { email: string }): Observable<string> {
    return this.http.post(`${this.baseUrl}/forgot-password`, data, {
      responseType: 'text'
    });
  }

  verifyOtp(data: { email: string; otp: string }): Observable<string> {
    return this.http.post(`${this.baseUrl}/verify-otp`, data, {
      responseType: 'text'
    });
  }

  resetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Observable<string> {
    return this.http.post(`${this.baseUrl}/reset-password`, data, {
      responseType: 'text'
    });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }

  getUserRole(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      return (
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] ||
        null
      );
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}