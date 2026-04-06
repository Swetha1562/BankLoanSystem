import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}
 
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  toast$ = this.toastSubject.asObservable();
 
  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.toastSubject.next({ text: message, type });
    this.autoClear();
  }
 
  showSuccess(message: string): void {
    this.show(message, 'success');
  }
 
  showError(message: string): void {
    this.show(message, 'error');
  }
 
  showInfo(message: string): void {
    this.show(message, 'info');
  }
 
  clear(): void {
    this.toastSubject.next(null);
  }
 
  private autoClear(): void {
    setTimeout(() => {
      this.clear();
    }, 3000);
  }
}



/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
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
  loanStatusChangeds$ = this.loanStatusChangedSource.asObservable();
 
  constructor(private http: HttpClient) {}
 
  getMyLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/myloans`);
  }
 
  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
 
  getOfficerSummary(): Observable<any> {
    return this.http.get<any>(`${this.dashboardUrl}/officer-summary`);
  }
 
  applyLoan(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apply`, data);
  }
 
  approveLoan(id: number, remarks: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, { remarks });
  }
 
  rejectLoan(id: number, remarks: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reject`, { remarks });
  }
 
  notifyLoanStatusChanged(): void {
    this.loanStatusChangedSource.next();
  }
 
  startConnection(): void {
    if (this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      return;
    }
 
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();
 
    this.hubConnection.on('LoanStatusUpdated', () => {
      this.notifyLoanStatusChanged();
    });
 
    this.hubConnection.on('ReceiveNotification', () => {
      this.notifyLoanStatusChanged();
    });
 
    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch((err: any) => console.error('SignalR connection error:', err));
  }
 
  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = undefined;
    }
  }
}
*/



/*import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}
 
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  toast$ = this.toastSubject.asObservable();
 
  show(text: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.toastSubject.next({ text, type });
 
    setTimeout(() => {
      this.clear();
    }, 3000);
  }
 
  clear(): void {
    this.toastSubject.next(null);
  }
}*/