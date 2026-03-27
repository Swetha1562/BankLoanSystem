import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LoanApplication,
  LoanActionResponse,
  LoanService
} from '../services/loan.service';

@Component({
  selector: 'app-all-loans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './all-loans.html',
  styleUrls: ['./all-loans.css']
})
export class AllLoansComponent implements OnInit {
  loans: LoanApplication[] = [];
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private loanService: LoanService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllLoans();
  }

  loadAllLoans(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const token = localStorage.getItem('token');
    console.log('ALL LOANS TOKEN:', token);

    this.loanService.getAllLoans().subscribe({
      next: (res: LoanApplication[]) => {
        console.log('ALL LOANS API RESPONSE:', res);

        this.loans = Array.isArray(res) ? res : [];

        console.log('ALL LOANS COUNT:', this.loans.length);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading all loans:', err);
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || 'Unable to load all loans.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approve(loan: LoanApplication): void {
    this.errorMessage = '';
    this.successMessage = '';

    const remarks = prompt('Enter approval remarks (optional):') || '';
    const loanId = Number(loan.id);
    const rowVersion = loan.rowVersion;

    console.log('APPROVE ID:', loanId);
    console.log('APPROVE REMARKS:', remarks);
    console.log('APPROVE ROW VERSION:', rowVersion);

    this.loanService.approveLoan(loanId, remarks, rowVersion).subscribe({
      next: (res: LoanActionResponse) => {
        console.log('APPROVE SUCCESS RESPONSE:', res);
        this.successMessage = res?.message || 'Loan approved successfully.';
        alert(this.successMessage);
        this.loadAllLoans();
      },
      error: (err: any) => {
        console.error('APPROVE ERROR:', err);
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || 'Unable to approve loan.';
        alert(this.errorMessage);
      }
    });
  }

  reject(loan: LoanApplication): void {
    this.errorMessage = '';
    this.successMessage = '';

    const remarks = prompt('Enter rejection reason:');

    if (!remarks || remarks.trim() === '') {
      this.errorMessage = 'Rejection reason is required.';
      alert(this.errorMessage);
      return;
    }

    const loanId = Number(loan.id);
    const rowVersion = loan.rowVersion;

    console.log('REJECT ID:', loanId);
    console.log('REJECT REMARKS:', remarks.trim());
    console.log('REJECT ROW VERSION:', rowVersion);

    this.loanService.rejectLoan(loanId, remarks.trim(), rowVersion).subscribe({
      next: (res: LoanActionResponse) => {
        console.log('REJECT SUCCESS RESPONSE:', res);
        this.successMessage = res?.message || 'Loan rejected successfully.';
        alert(this.successMessage);
        this.loadAllLoans();
      },
      error: (err: any) => {
        console.error('REJECT ERROR:', err);
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || 'Unable to reject loan.';
        alert(this.errorMessage);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/officer-dashboard']);
  }
}