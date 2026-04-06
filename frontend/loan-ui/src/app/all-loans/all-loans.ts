import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
 
@Component({
  selector: 'app-all-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './all-loans.html',
  styleUrl: './all-loans.css'
})
export class AllLoansComponent implements OnInit, OnDestroy {
  loans: any[] = [];
  filteredLoans: any[] = [];
 
  selectedFilter = 'all';
  loading = true;
  errorMessage = '';
 
  reviewLoanId: number | null = null;
  remarksMap: { [key: number]: string } = {};
 
  private destroy$ = new Subject<void>();

  getSalarySlipUrl(loan: any): string {
    const rawPath = (loan.salarySlipFilePath || loan.salarySlipPath || '').trim();
 
    if (!rawPath) {
      return '';
    }
 
    if (rawPath.startsWith('/uploads/') || rawPath.startsWith('/Uploads/')) {
      return 'http://localhost:5000' + rawPath;
    }
 
    if (rawPath.startsWith('uploads/') || rawPath.startsWith('Uploads/')) {
      return 'http://localhost:5000/' + rawPath;
    }
 
    return 'http://localhost:5000/Uploads/' + rawPath;
  }
 
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.loadLoans();
 
    this.loanService.loanStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadLoans();
      });
  }
 
  loadLoans(): void {
    this.loading = true;
 
    this.loanService.getAllLoans().subscribe({
      next: (res: any[]) => {
        this.loans = Array.isArray(res) ? res : [];
        this.applyFilter();
        this.loading = false;
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('All loans error:', err);
        this.loading = false;
        this.errorMessage = 'Failed to load loans.';
        this.loans = [];
        this.filteredLoans = [];
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
      loan => this.normalizeStatus(loan.status) === this.selectedFilter
    );
  }
 
  normalizeStatus(status: string): string {
    return (status || '').trim().toLowerCase();
  }
 
  canTakeAction(loan: any): boolean {
    return this.normalizeStatus(loan.status) === 'pending';
  }
 
  openReview(id: number): void {
    this.reviewLoanId = this.reviewLoanId === id ? null : id;
  }
 
  setRemarks(id: number, value: string): void {
    this.remarksMap[id] = value;
  }
 
  getRemarks(id: number): string {
    return this.remarksMap[id] || '';
  }
 
  approveLoan(id: number): void {
    const remarks = this.getRemarks(id).trim();
    if (!remarks) {
      this.errorMessage = 'Remarks are required before approval.';
      return;
    }
 
    this.loanService.approveLoan(id, remarks).subscribe({
      next: () => {
        this.reviewLoanId = null;
        delete this.remarksMap[id];
        this.loanService.notifyLoanStatusChanged();
      },
      error: (err: any) => {
        console.error('Approve loan error:', err);
        this.errorMessage = err?.error?.message || 'Approval failed.';
      }
    });
  }
 
  rejectLoan(id: number): void {
    const remarks = this.getRemarks(id).trim();
    if (!remarks) {
      this.errorMessage = 'Remarks are required before rejection.';
      return;
    }
 
    this.loanService.rejectLoan(id, remarks).subscribe({
      next: () => {
        this.reviewLoanId = null;
        delete this.remarksMap[id];
        this.loanService.notifyLoanStatusChanged();
      },
      error: (err: any) => {
        console.error('Reject loan error:', err);
        this.errorMessage = err?.error?.message || 'Rejection failed.';
      }
    });
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



