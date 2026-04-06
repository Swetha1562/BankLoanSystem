import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import * as signalR from '@microsoft/signalr';
 
@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:5000/api/Loan';
  private dashboardUrl = 'http://localhost:5000/api/Dashboard';
  private hubUrl = 'http://localhost:5000/notificationHub';
 
  private hubConnection?: signalR.HubConnection;
 
  private loanStatusChangedSource = new Subject<void>();
  loanStatusChanged$ = this.loanStatusChangedSource.asObservable();
 
  constructor(private http: HttpClient) {
    this.startConnection();
  }
 
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
 
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
 
  getMyLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/myloans`, this.getHeaders());
  }
 
  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, this.getHeaders());
  }
 
  getLoanById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }
 
  getCustomerSummary(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/customer-summary`, this.getHeaders());
  }
 
  getOfficerSummary(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/officer-summary`, this.getHeaders());
  }
 
  applyLoan(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apply`, data, this.getHeaders()).pipe(
      tap(() => this.notifyLoanStatusChanged())
    );
  }
 
  approveLoan(id: number, remarks: string): Observable<any> {
    const formData = new FormData();
    formData.append('Remarks', remarks);
 
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, formData, this.getHeaders()).pipe(
      tap(() => this.notifyLoanStatusChanged())
    );
  }
 
  rejectLoan(id: number, remarks: string): Observable<any> {
    const formData = new FormData();
    formData.append('Remarks', remarks);
 
    return this.http.post<any>(`${this.apiUrl}/${id}/reject`, formData, this.getHeaders()).pipe(
      tap(() => this.notifyLoanStatusChanged())
    );
  }
 
  notifyLoanStatusChanged(): void {
    this.loanStatusChangedSource.next();
  }
 
  startConnection(): void {
    if (this.hubConnection) return;
 
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();
 
    this.hubConnection.on('LoanStatusUpdated', () => {
      this.notifyLoanStatusChanged();
    });
 
    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR error:', err));
  }
}
 









/*import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import * as signalR from '@microsoft/signalr';
 
@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:5000/api/Loan';
  private hubUrl = 'http://localhost:5000/notificationHub';
 
  private hubConnection?: signalR.HubConnection;
  private loanStatusChangedSource = new Subject<void>();
  loanStatusChanged$ = this.loanStatusChangedSource.asObservable();
 
  constructor(private http: HttpClient) {
    this.startConnection();
  }
 
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
 
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }
 
  getMyLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/myloans`, this.getHeaders());
  }
 
  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, this.getHeaders());
  }
 
  applyLoan(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apply`, data, this.getHeaders()).pipe(
      tap(() => this.notifyLoanStatusChanged())
    );
  }
 
  approveLoan(id: number, remarks: string): Observable<any> {
    const formData = new FormData();
    formData.append('Remarks', remarks);
 
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, formData, this.getHeaders()).pipe(
      tap(() => this.notifyLoanStatusChanged())
    );
  }
 
  rejectLoan(id: number, remarks: string): Observable<any> {
    const formData = new FormData();
    formData.append('Remarks', remarks);
 
    return this.http.post<any>(`${this.apiUrl}/${id}/reject`, formData, this.getHeaders()).pipe(
      tap(() => this.notifyLoanStatusChanged())
    );
  }
 
  notifyLoanStatusChanged(): void {
    this.loanStatusChangedSource.next();
  }
 
  startConnection(): void {
    if (this.hubConnection) return;
 
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();
 
    this.hubConnection.on('LoanStatusUpdated', () => {
      this.notifyLoanStatusChanged();
    });
 
    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR error:', err));
  }
}*/