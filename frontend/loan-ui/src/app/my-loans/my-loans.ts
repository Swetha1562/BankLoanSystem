import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
 
@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css'
})
export class MyLoansComponent implements OnInit, OnDestroy {
  loans: any[] = [];
  filteredLoans: any[] = [];
  selectedFilter = 'all';
  totalLoans = 0;
  errorMessage = '';
 
  private destroy$ = new Subject<void>();
 
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
 
  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.selectedFilter = (params['status'] || 'all').toLowerCase();
      this.loadLoans();
    });
 
    this.loanService.loanStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadLoans();
      });
  }
 
  loadLoans(): void {
    this.loanService.getMyLoans().subscribe({
      next: (res: any[]) => {
        this.loans = Array.isArray(res) ? res : [];
        this.totalLoans = this.loans.length;
        this.applyFilter();
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('My loans error:', err);
        this.errorMessage = 'Unable to load loan details.';
        this.loans = [];
        this.filteredLoans = [];
        this.totalLoans = 0;
      }
    });
  }
 
  setFilter(filter: string): void {
    this.selectedFilter = filter.toLowerCase();
    this.applyFilter();
  }
 
  applyFilter(): void {
    if (this.selectedFilter === 'all') {
      this.filteredLoans = [...this.loans];
      return;
    }
 
    this.filteredLoans = this.loans.filter(
      loan => (loan.status || '').toLowerCase() === this.selectedFilter
    );
  }
  getLoanCount(): number {
    if (this.selectedFilter === 'pending') {
      return this.loans.filter(l => l.status === 'Pending').length;
    }
 
    if (this.selectedFilter === 'approved') {
      return this.loans.filter(l => l.status === 'Approved').length;
    }
 
    if (this.selectedFilter === 'rejected') {
      return this.loans.filter(l => l.status === 'Rejected').length;
    }
    return this.loans.length;
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










/*import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoanService } from '../services/loan.service';
 
@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css'
})
export class MyLoansComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
 
  loans: any[] = [];
  filteredLoans: any[] = [];
  selectedFilter = 'All';
  loading = true;
  errorMessage = '';
 
  constructor(private loanService: LoanService) {}
 
  ngOnInit(): void {
    this.loadMyLoans();
 
    this.loanService.loanStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMyLoans(false);
      });
  }
 
  loadMyLoans(showLoader: boolean = true): void {
    if (showLoader) {
      this.loading = true;
    }
 
    this.errorMessage = '';
 
    this.loanService.getMyLoans().subscribe({
      next: (res: any[]) => {
        console.log('My Loans Response:', res);
 
        this.loans = Array.isArray(res) ? res : [];
        this.applyFilter(this.selectedFilter);
        this.loading = false;
      },
      error: (err) => {
        console.error('My Loans Error:', err);
 
        this.loans = [];
        this.filteredLoans = [];
        this.errorMessage =
          err?.error?.message ||
          err?.error?.title ||
          'Unable to load loan details.';
 
        this.loading = false;
      }
    });
  }
 
  applyFilter(filter: string): void {
    this.selectedFilter = filter;
 
    if (filter === 'All') {
      this.filteredLoans = [...this.loans];
      return;
    }
 
    this.filteredLoans = this.loans.filter(
      loan => (loan.status || '').toLowerCase() === filter.toLowerCase()
    );
  }
 
  getStatusClass(status: string): string {
    const value = (status || '').toLowerCase();
 
    if (value === 'approved') return 'approved';
    if (value === 'rejected') return 'rejected';
    if (value === 'pending') return 'pending';
    return 'default';
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}*/
 





/*import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoanService } from '../services/loan.service';
 
@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css'
})
export class MyLoansComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
 
  loans: any[] = [];
  filteredLoans: any[] = [];
  selectedFilter = 'All';
  loading = true;
  errorMessage = '';
 
  constructor(private loanService: LoanService) {}
 
  ngOnInit(): void {
    this.loadMyLoans();
 
    this.loanService.loanStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMyLoans(false);
      });
  }
 
  loadMyLoans(showLoader: boolean = true): void {
    if (showLoader) {
      this.loading = true;
    }
 
    this.errorMessage = '';
 
    this.loanService.getMyLoans().subscribe({
      next: (res: any[]) => {
        console.log('My Loans Response:', res);
        this.loans = Array.isArray(res) ? res : [];
        this.applyFilter(this.selectedFilter);
        this.loading = false;
      },
      error: (err) => {
        console.error('My Loans Error:', err);
        this.loans = [];
        this.filteredLoans = [];
        this.errorMessage =
          err?.error?.message ||
          err?.error?.title ||
          'Unable to load loan details.';
        this.loading = false;
      }
    });
  }
 
  applyFilter(filter: string): void {
    this.selectedFilter = filter;
 
    if (filter === 'All') {
      this.filteredLoans = [...this.loans];
      return;
    }
 
    this.filteredLoans = this.loans.filter(
      loan => (loan.status || '').toLowerCase() === filter.toLowerCase()
    );
  }
 
  getStatusClass(status: string): string {
    const value = (status || '').toLowerCase();
 
    if (value === 'approved') return 'approved';
    if (value === 'rejected') return 'rejected';
    if (value === 'pending') return 'pending';
    return 'default';
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}*/