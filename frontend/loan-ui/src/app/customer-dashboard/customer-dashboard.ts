import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css']
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  loans: any[] = [];
  totalLoans = 0;
  approvedLoans = 0;
  pendingLoans = 0;
  rejectedLoans = 0;
  errorMessage = '';
  isLoading = false;

  private hubConnection!: signalR.HubConnection;

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLoanSummary();
    this.startSignalRConnection();
  }

  startSignalRConnection(): void {
    const token = localStorage.getItem('token') || '';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/notificationHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connected in customer dashboard');
      })
      .catch((err) => {
        console.error('SignalR connection error:', err);
      });

    this.hubConnection.on('LoanStatusUpdated', (data: any) => {
      console.log('LoanStatusUpdated received in dashboard:', data);
      this.loadLoanSummary();
    });

    this.hubConnection.on('ReceiveNotification', (data: any) => {
      console.log('ReceiveNotification received in dashboard:', data);
      this.loadLoanSummary();
    });
  }

  loadLoanSummary(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    console.log('TOKEN:', token);

    this.loanService.getMyLoans().subscribe({
      next: (res: any[]) => {
        console.log('API RESPONSE:', res);

        this.loans = Array.isArray(res) ? res : [];

        this.totalLoans = this.loans.length;
        this.approvedLoans = this.loans.filter(
          loan => loan.status === 'Approved' || loan.Status === 'Approved'
        ).length;
        this.pendingLoans = this.loans.filter(
          loan => loan.status === 'Pending' || loan.Status === 'Pending'
        ).length;
        this.rejectedLoans = this.loans.filter(
          loan => loan.status === 'Rejected' || loan.Status === 'Rejected'
        ).length;

        console.log('TOTAL:', this.totalLoans);
        console.log('APPROVED:', this.approvedLoans);
        console.log('PENDING:', this.pendingLoans);
        console.log('REJECTED:', this.rejectedLoans);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ERROR:', err);
        this.errorMessage = err?.error || 'Unable to load dashboard data.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR disconnected from customer dashboard'))
        .catch(err => console.error('Error stopping SignalR:', err));
    }
  }
}