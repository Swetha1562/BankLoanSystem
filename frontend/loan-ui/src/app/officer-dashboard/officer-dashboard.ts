import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoanService } from '../services/loan.service';
import { ToastService } from '../shared/toast/toast.service';
 
@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './officer-dashboard.html',
  styleUrl: './officer-dashboard.css'
})
export class OfficerDashboardComponent implements OnInit, OnDestroy {
  totalLoans = 0;
  pendingLoans = 0;
  approvedLoans = 0;
  rejectedLoans = 0;
 
  isLoading = true;
  errorMessage = '';
 
  private statusSubscription?: Subscription;
 
  constructor(
    private loanService: LoanService,
    private router: Router,
    private toastService: ToastService
  ) {}
 
  ngOnInit(): void {
    this.loadDashboardStats();
    this.loanService.startConnection();
 
    this.statusSubscription = this.loanService.loanStatusChanged$.subscribe(() => {
      this.loadDashboardStats(false);
    });
  }
 
  loadDashboardStats(showLoader: boolean = true): void {
    if (showLoader) {
      this.isLoading = true;
    }
 
    this.errorMessage = '';
 
    this.loanService.getAllLoans().subscribe({
      next: (loans: any[]) => {
        const data = Array.isArray(loans) ? loans : [];
 
        this.totalLoans = data.length;
        this.pendingLoans = data.filter((loan: any) => this.normalizeStatus(loan.status) === 'pending').length;
        this.approvedLoans = data.filter((loan: any) => this.normalizeStatus(loan.status) === 'approved').length;
        this.rejectedLoans = data.filter((loan: any) => this.normalizeStatus(loan.status) === 'rejected').length;
 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Officer dashboard error:', err);
        this.errorMessage = 'Unable to load officer dashboard.';
        this.totalLoans = 0;
        this.pendingLoans = 0;
        this.approvedLoans = 0;
        this.rejectedLoans = 0;
        this.isLoading = false;
      }
    });
  }
 
  normalizeStatus(status: string): string {
    return (status || '').trim().toLowerCase();
  }
 
  goToAllLoans(filter: string): void {
    this.router.navigate(['/all-loans'], {
      queryParams: { filter }
    });
  }
 
  logout(): void {
    localStorage.removeItem('token');
    this.toastService.showSuccess('Logged out successfully');
    this.router.navigate(['/login']);
  }
 
  ngOnDestroy(): void {
    this.statusSubscription?.unsubscribe();
  }
}



/*import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoanService } from '../services/loan.service';
import { ToastService } from '../shared/toast/toast.service';
 
@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './officer-dashboard.html',
  styleUrl: './officer-dashboard.css'
})
export class OfficerDashboardComponent implements OnInit, OnDestroy {
  totalLoans = 0;
  pendingLoans = 0;
  approvedLoans = 0;
  rejectedLoans = 0;
 
  isLoading = true;
  errorMessage = '';
 
  private statusSubscription?: Subscription;
 
  constructor(
    private loanService: LoanService,
    private router: Router,
    private toastService: ToastService
  ) {}
 
  ngOnInit(): void {
    this.loadDashboardStats();
    this.loanService.startConnection();
 
    this.statusSubscription = this.loanService.loanStatusChangeds$.subscribe(() => {
      this.loadDashboardStats();
    });
  }
 
  loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
 
    this.loanService.getOfficerSummary().subscribe({
      next: (res: any) => {
        this.totalLoans = res?.totalLoans ?? 0;
        this.pendingLoans = res?.pendingLoans ?? 0;
        this.approvedLoans = res?.approvedLoans ?? 0;
        this.rejectedLoans = res?.rejectedLoans ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Officer dashboard error:', err);
        this.errorMessage = 'Unable to load officer dashboard.';
        this.isLoading = false;
      }
    });
  }
 
  logout(): void {
    localStorage.removeItem('token');
    this.toastService.show('Logged out successfully');
    this.router.navigate(['/login']);
  }
 
  ngOnDestroy(): void {
    this.statusSubscription?.unsubscribe();
  }
}*/