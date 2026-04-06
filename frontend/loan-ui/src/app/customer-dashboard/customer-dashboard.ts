import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
 
@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  totalLoans = 0;
  approvedLoans = 0;
  pendingLoans = 0;
  rejectedLoans = 0;
 
  errorMessage = '';
 
  private destroy$ = new Subject<void>();
 
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.loadDashboard();
 
    this.loanService.loanStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboard();
      });
  }
 
  loadDashboard(): void {
    this.loanService.getMyLoans().subscribe({
      next: (res: any) => {
        const loans = Array.isArray(res) ? res : [];
 
        this.totalLoans = loans.length;
        this.approvedLoans = loans.filter((l: any) => this.normalizeStatus(l.status) === 'approved').length;
        this.pendingLoans = loans.filter((l: any) => this.normalizeStatus(l.status) === 'pending').length;
        this.rejectedLoans = loans.filter((l: any) => this.normalizeStatus(l.status) === 'rejected').length;
 
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Customer dashboard error:', err);
        this.errorMessage = 'Unable to load dashboard.';
        this.totalLoans = 0;
        this.approvedLoans = 0;
        this.pendingLoans = 0;
        this.rejectedLoans = 0;
      }
    });
  }
 
  normalizeStatus(status: string): string {
    return (status || '').trim().toLowerCase();
  }
 
  goToFilteredLoans(status: string): void {
    this.router.navigate(['/my-loans'], { queryParams: { status } });
  }
 
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}



/*import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
 
@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  totalLoans = 0;
  approvedLoans = 0;
  pendingLoans = 0;
  rejectedLoans = 0;
 
  errorMessage = '';
 
  private destroy$ = new Subject<void>();
 
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.loadDashboard();
 
    this.loanService.loanStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboard();
      });
  }
 
  loadDashboard(): void {
    this.loanService.getMyLoans().subscribe({
      next: (res: any[]) => {
        const loans = Array.isArray(res) ? res : [];
 
        this.totalLoans = loans.length;
        this.approvedLoans = loans.filter(l => (l.status || '').toLowerCase() === 'approved').length;
        this.pendingLoans = loans.filter(l => (l.status || '').toLowerCase() === 'pending').length;
        this.rejectedLoans = loans.filter(l => (l.status || '').toLowerCase() === 'rejected').length;
 
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Customer dashboard error:', err);
        this.errorMessage = 'Unable to load dashboard.';
        this.totalLoans = 0;
        this.approvedLoans = 0;
        this.pendingLoans = 0;
        this.rejectedLoans = 0;
      }
    });
  }
 
  goToFilteredLoans(status: string): void {
    this.router.navigate(['/my-loans'], { queryParams: { status } });
  }
 
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}*/