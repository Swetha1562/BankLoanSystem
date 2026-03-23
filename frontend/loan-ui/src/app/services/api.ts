import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api/Loan';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  applyLoan(data: any) {
    return this.http.post(`${this.baseUrl}/apply`, data, this.getHeaders());
  }

  getMyLoans() {
    return this.http.get(`${this.baseUrl}/myloans`, this.getHeaders());
  }

  getAllLoans() {
    return this.http.get(`${this.baseUrl}`, this.getHeaders());
  }

  approveLoan(id: number, body: any) {
    return this.http.post(`${this.baseUrl}/${id}/approve`, body, {
      ...this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  rejectLoan(id: number, body: any) {
    return this.http.post(`${this.baseUrl}/${id}/reject`, body, {
      ...this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }
}