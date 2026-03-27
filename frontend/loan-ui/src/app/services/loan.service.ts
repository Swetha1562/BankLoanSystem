import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoanApplication {
  id: number;
  loanType: string;
  amount: number;
  purpose: string;
  durationMonths: number;
  annualIncome: number;
  existingLiabilities?: number;
  status: string;
  createdAt?: string;
  riskLevel?: string;
  eligibilityScore?: number;
  recommendedDecision?: string;
  rowVersion?: string;
  remarks?: string;
}

export interface LoanActionResponse {
  message: string;
}

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

  applyLoan(data: unknown): Observable<string> {
    return this.http.post(`${this.baseUrl}/apply`, data, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  getMyLoans(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.baseUrl}/myloans`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllLoans(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.baseUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

  getLoanById(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  approveLoan(
    loanId: number,
    remarks: string,
    rowVersion?: string
  ): Observable<LoanActionResponse> {
    return this.http.post<LoanActionResponse>(
      `${this.baseUrl}/${loanId}/approve`,
      { remarks, rowVersion },
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  rejectLoan(
    loanId: number,
    remarks: string,
    rowVersion?: string
  ): Observable<LoanActionResponse> {
    return this.http.post<LoanActionResponse>(
      `${this.baseUrl}/${loanId}/reject`,
      { remarks, rowVersion },
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}