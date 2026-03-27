import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './apply-loan.html',
  styleUrl: './apply-loan.css'
})
export class ApplyLoanComponent {
  loanType = '';
  amount: number | null = null;
  purpose = '';
  durationMonths: number | null = null;
  annualIncome: number | null = null;
  employmentYears: number | null = null;
  age: number | null = null;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showValidation = false;

  constructor(
    private loanService: LoanService,
    private router: Router
  ) {}

  submitLoan(): void {
    if (this.isSubmitting) return;

    this.successMessage = '';
    this.errorMessage = '';
    this.showValidation = true;

    if (!this.isFormValid()) {
      this.errorMessage = 'Please correct the highlighted fields before submitting.';
      return;
    }

    const payload = {
      loanType: this.loanType,
      amount: Number(this.amount),
      purpose: this.purpose,
      durationMonths: Number(this.durationMonths),
      annualIncome: Number(this.annualIncome),
      employmentYears: Number(this.employmentYears),
      age: Number(this.age)
    };

    this.isSubmitting = true;

    this.loanService
      .applyLoan(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: string) => {
          this.successMessage = res || 'Loan application submitted successfully.';
          this.resetForm();

          setTimeout(() => {
            this.router.navigate(['/my-loans']);
          }, 1200);
        },
        error: (err: any) => {
          this.errorMessage =
            typeof err?.error === 'string'
              ? err.error
              : err?.error?.message || 'Loan submission failed. Please try again.';
        }
      });
  }

  resetForm(): void {
    this.loanType = '';
    this.amount = null;
    this.purpose = '';
    this.durationMonths = null;
    this.annualIncome = null;
    this.employmentYears = null;
    this.age = null;
    this.showValidation = false;
  }

  isFormValid(): boolean {
    return (
      this.isLoanTypeValid &&
      this.isAmountValid &&
      this.isPurposeValid &&
      this.isDurationValid &&
      this.isIncomeValid &&
      this.isEmploymentYearsValid &&
      this.isAgeValid
    );
  }

  get isLoanTypeValid(): boolean {
    return !!this.loanType?.trim();
  }

  get isAmountValid(): boolean {
    return this.amount !== null && this.amount >= 10000 && this.amount <= 5000000;
  }

  get isPurposeValid(): boolean {
    return !!this.purpose?.trim() && this.purpose.trim().length >= 3;
  }

  get isDurationValid(): boolean {
    return this.durationMonths !== null && this.durationMonths >= 6 && this.durationMonths <= 360;
  }

  get isIncomeValid(): boolean {
    return this.annualIncome !== null && this.annualIncome >= 100000;
  }

  get isEmploymentYearsValid(): boolean {
    return this.employmentYears !== null && this.employmentYears >= 0 && this.employmentYears <= 50;
  }

  get isAgeValid(): boolean {
    return this.age !== null && this.age >= 18 && this.age <= 75;
  }

  get amountError(): string {
    if (!this.showValidation) return '';
    if (this.amount === null) return 'Loan amount is required.';
    if (this.amount < 10000) return 'Minimum loan amount is ₹10,000.';
    if (this.amount > 5000000) return 'Maximum allowed here is ₹50,00,000.';
    return '';
  }

  get purposeError(): string {
    if (!this.showValidation) return '';
    if (!this.purpose?.trim()) return 'Purpose is required.';
    if (this.purpose.trim().length < 3) return 'Purpose should be at least 3 characters.';
    return '';
  }

  get durationError(): string {
    if (!this.showValidation) return '';
    if (this.durationMonths === null) return 'Loan duration is required.';
    if (this.durationMonths < 6) return 'Minimum duration is 6 months.';
    if (this.durationMonths > 360) return 'Maximum duration is 360 months.';
    return '';
  }

  get incomeError(): string {
    if (!this.showValidation) return '';
    if (this.annualIncome === null) return 'Annual income is required.';
    if (this.annualIncome < 100000) return 'Income should be at least ₹1,00,000.';
    return '';
  }

  get employmentYearsError(): string {
    if (!this.showValidation) return '';
    if (this.employmentYears === null) return 'Employment years is required.';
    if (this.employmentYears < 0) return 'Employment years cannot be negative.';
    if (this.employmentYears > 50) return 'Please enter a realistic value.';
    return '';
  }

  get ageError(): string {
    if (!this.showValidation) return '';
    if (this.age === null) return 'Age is required.';
    if (this.age < 18) return 'Applicant must be at least 18 years old.';
    if (this.age > 75) return 'Please enter a valid age.';
    return '';
  }

  get estimatedInterestRate(): number {
    const income = Number(this.annualIncome ?? 0);
    const amount = Number(this.amount ?? 0);
    const employmentYears = Number(this.employmentYears ?? 0);
    const age = Number(this.age ?? 0);

    if (!this.isFormValid()) return 0;

    if (income >= 1000000 && employmentYears >= 5 && age <= 55 && amount <= 800000) return 9.5;
    if (income >= 600000 && employmentYears >= 3) return 10.75;
    if (income >= 300000 && employmentYears >= 1) return 12.25;
    return 13.75;
  }

  get estimatedEmi(): number {
    if (!this.isFormValid()) return 0;

    const principal = Number(this.amount ?? 0);
    const months = Number(this.durationMonths ?? 0);
    const annualRate = this.estimatedInterestRate;

    if (!principal || !months || !annualRate) return 0;

    const monthlyRate = annualRate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return isFinite(emi) ? Math.round(emi) : 0;
  }

  get totalRepayment(): number {
    return this.estimatedEmi * Number(this.durationMonths ?? 0);
  }

  get eligibilityScore(): number {
    if (
      !this.loanType &&
      this.amount === null &&
      !this.purpose &&
      this.durationMonths === null &&
      this.annualIncome === null &&
      this.employmentYears === null &&
      this.age === null
    ) {
      return 0;
    }

    let score = 45;

    const income = Number(this.annualIncome ?? 0);
    const amount = Number(this.amount ?? 0);
    const duration = Number(this.durationMonths ?? 0);
    const employmentYears = Number(this.employmentYears ?? 0);
    const age = Number(this.age ?? 0);

    if (income >= 1000000) score += 22;
    else if (income >= 600000) score += 16;
    else if (income >= 300000) score += 10;
    else if (income > 0) score += 4;

    if (employmentYears >= 8) score += 16;
    else if (employmentYears >= 5) score += 12;
    else if (employmentYears >= 2) score += 8;
    else if (employmentYears >= 1) score += 4;

    if (amount > 0 && income > 0) {
      const ratio = amount / income;
      if (ratio <= 0.30) score += 14;
      else if (ratio <= 0.50) score += 8;
      else if (ratio <= 0.75) score += 2;
      else score -= 8;
    }

    if (duration >= 12 && duration <= 60) score += 6;
    else if (duration > 60 && duration <= 120) score += 2;

    if (age >= 21 && age <= 55) score += 8;
    else if (age > 55 && age <= 65) score += 3;
    else if (age >= 18 && age < 21) score += 2;
    else score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  get riskLevel(): string {
    if (this.eligibilityScore >= 80) return 'Low Risk';
    if (this.eligibilityScore >= 65) return 'Moderate Risk';
    return 'High Risk';
  }

  get recommendedDecision(): string {
    if (this.eligibilityScore === 0) return 'Awaiting Input';
    if (this.eligibilityScore >= 80) return 'Likely Approve';
    if (this.eligibilityScore >= 65) return 'Needs Manual Review';
    return 'Likely Reject';
  }

  get scoreStrokeOffset(): number {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    return circumference - (this.eligibilityScore / 100) * circumference;
  }

  get completionPercent(): number {
    let count = 0;
    if (this.isLoanTypeValid) count++;
    if (this.isAmountValid) count++;
    if (this.isPurposeValid) count++;
    if (this.isDurationValid) count++;
    if (this.isIncomeValid) count++;
    if (this.isEmploymentYearsValid) count++;
    if (this.isAgeValid) count++;
    return Math.round((count / 7) * 100);
  }

  get formStatus(): string {
    if (this.completionPercent === 100) return 'Ready to Submit';
    if (this.completionPercent >= 50) return 'In Progress';
    return 'Draft';
  }

  get affordabilityBand(): string {
    const emi = this.estimatedEmi;
    const monthlyIncome = Number(this.annualIncome ?? 0) / 12;
    if (!emi || !monthlyIncome) return 'Not available';

    const ratio = emi / monthlyIncome;
    if (ratio <= 0.25) return 'Comfortable';
    if (ratio <= 0.4) return 'Manageable';
    return 'High repayment burden';
  }

  get riskBadgeClass(): string {
    if (this.riskLevel === 'Low Risk') return 'badge-low';
    if (this.riskLevel === 'Moderate Risk') return 'badge-medium';
    return 'badge-high';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  }
}