import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private baseUrl = 'http://localhost:5000/api/Loan';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  applyLoan(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getMyLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/myloans`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

  approveLoan(id: number, remarks: string = '', rowVersion: any = null): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${id}/approve`,
      { remarks, rowVersion },
      { headers: this.getAuthHeaders() }
    );
  }

  rejectLoan(id: number, remarks: string, rowVersion: any = null): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${id}/reject`,
      { remarks, rowVersion },
      { headers: this.getAuthHeaders() }
    );
  }
}