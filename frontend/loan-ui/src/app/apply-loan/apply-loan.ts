import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './apply-loan.html',
  styleUrls: ['./apply-loan.css']
})
export class ApplyLoanComponent {
  loanData = {
    loanType: '',
    amount: 0,
    purpose: '',
    durationMonths: 0,
    annualIncome: 0,
    employmentYears: 0,
    age: 0
  };

  isSubmitting = false;
  message = '';
  errorMessage = '';

  constructor(
    private loanService: LoanService,
    private router: Router
  ) {}

  applyLoan(): void {
    this.isSubmitting = true;
    this.message = '';
    this.errorMessage = '';

    this.loanService.applyLoan(this.loanData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.message = res?.message || 'Loan applied successfully.';
        this.router.navigate(['/customer-dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Loan apply error:', err);
        this.errorMessage = err?.error || 'Loan application failed.';
      }
    });
  }
}