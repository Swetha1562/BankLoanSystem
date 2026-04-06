import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
 
@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './apply-loan.html',
  styleUrl: './apply-loan.css'
})
export class ApplyLoanComponent implements OnInit {
  loanForm = {
    loanType: '',
    amount: null as number | null,
    purpose: '',
    durationMonths: null as number | null,
    annualIncome: null as number | null,
    employmentYears: null as number | null,
    age: null as number | null
  };
 
  selectedFile: File | null = null;
  selectedFileName = '';
 
  successMessage = '';
  errorMessage = '';
 
  eligibilityScore = 0;
  recommendedDecision = 'N/A';
  riskLevel = 'N/A';
  repaymentFit = 'N/A';
  interestRate = 'N/A';
  estimatedEmi = 'N/A';
  totalRepayment = 'N/A';
 
  creditScore = 700;
  existingLiabilities = 0;
 
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.calculatePreview();
  }
 
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
 
    if (!file) {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.calculatePreview();
      return;
    }
 
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.errorMessage = 'Please upload salary slip in PDF format only.';
      this.selectedFile = null;
      this.selectedFileName = '';
      this.calculatePreview();
      return;
    }
 
    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.errorMessage = '';
    this.calculatePreview();
  }
 
  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.calculatePreview();
  }
 
  calculatePreview(): void {
    const amount = Number(this.loanForm.amount || 0);
    const durationMonths = Number(this.loanForm.durationMonths || 0);
    const annualIncome = Number(this.loanForm.annualIncome || 0);
    const employmentYears = Number(this.loanForm.employmentYears || 0);
    const age = Number(this.loanForm.age || 0);
    const loanType = this.loanForm.loanType || '';
 
    let interest = 12;
 
    switch (loanType) {
      case 'Home Loan':
        interest = 8.75;
        break;
      case 'Vehicle Loan':
        interest = 9.5;
        break;
      case 'Education Loan':
        interest = 10.75;
        break;
      case 'Personal Loan':
        interest = 12.25;
        break;
      default:
        interest = 12;
        break;
    }
 
    this.interestRate = `${interest.toFixed(2)}%`;
 
    let score = 0;
 
    switch (loanType) {
      case 'Home Loan':
        score += 18;
        break;
      case 'Education Loan':
        score += 14;
        break;
      case 'Vehicle Loan':
        score += 12;
        break;
      case 'Personal Loan':
        score += 8;
        break;
    }
 
    if (age >= 23 && age <= 55) score += 15;
    else if (age >= 21 && age <= 58) score += 12;
    else if (age > 18 && age <= 60) score += 8;
 
    if (annualIncome >= 1200000) score += 22;
    else if (annualIncome >= 900000) score += 18;
    else if (annualIncome >= 700000) score += 15;
    else if (annualIncome >= 500000) score += 12;
    else if (annualIncome >= 350000) score += 7;
    else if (annualIncome >= 250000) score += 3;
 
    if (employmentYears >= 8) score += 18;
    else if (employmentYears >= 5) score += 15;
    else if (employmentYears >= 3) score += 10;
    else if (employmentYears >= 1) score += 5;
 
    const loanToIncomeRatio = annualIncome > 0 ? amount / annualIncome : 99;
 
    if (loanToIncomeRatio <= 0.2) score += 18;
    else if (loanToIncomeRatio <= 0.5) score += 15;
    else if (loanToIncomeRatio <= 1.0) score += 10;
    else if (loanToIncomeRatio <= 1.5) score += 4;
    else score -= 10;
 
    if (durationMonths >= 36 && durationMonths <= 120) score += 10;
    else if (durationMonths >= 24) score += 7;
    else if (durationMonths >= 12) score += 4;
    else if (durationMonths > 0) score += 1;
 
    if (this.selectedFile) score += 5;
 
    const monthlyIncome = annualIncome > 0 ? annualIncome / 12 : 0;
    const monthlyRate = interest / 12 / 100;
 
    let emi = 0;
    if (amount > 0 && durationMonths > 0 && monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, durationMonths);
      emi = (amount * monthlyRate * factor) / (factor - 1);
    }
 
    const emiRatio = monthlyIncome > 0 ? emi / monthlyIncome : 1;
 
    if (emiRatio <= 0.2) score += 20;
    else if (emiRatio <= 0.3) score += 16;
    else if (emiRatio <= 0.4) score += 10;
    else if (emiRatio <= 0.5) score += 3;
    else score -= 15;
 
    if (loanToIncomeRatio > 1.5) score -= 8;
    if (emiRatio > 0.45) score -= 10;
    if (emiRatio > 0.55) score -= 10;
    if (annualIncome < 400000 && amount > 500000) score -= 10;
    if (employmentYears < 2 && amount > 300000) score -= 8;
    if (age < 21 || age > 60) score -= 12;
 
    score = Math.max(0, Math.min(100, Math.round(score)));
    this.eligibilityScore = score;
 
    if (score >= 85) {
      this.riskLevel = 'Low';
      this.recommendedDecision = 'Likely Approve';
      this.repaymentFit = 'Comfortable';
    } else if (score >= 65) {
      this.riskLevel = 'Moderate';
      this.recommendedDecision = 'Review';
      this.repaymentFit = 'Manageable';
    } else if (score >= 40) {
      this.riskLevel = 'High';
      this.recommendedDecision = 'Needs Review';
      this.repaymentFit = 'Risky';
    } else {
      this.riskLevel = 'Very High';
      this.recommendedDecision = 'Likely Reject';
      this.repaymentFit = 'Risky';
    }
 
    this.estimatedEmi =
      emi > 0 ? `₹${Math.round(emi).toLocaleString()}/month` : 'N/A';
 
    this.totalRepayment =
      emi > 0 && durationMonths > 0
        ? `₹${Math.round(emi * durationMonths).toLocaleString()}`
        : 'N/A';
  }
 
  submitLoan(): void {
    this.successMessage = '';
    this.errorMessage = '';
 
    if (
      !this.loanForm.loanType ||
      !this.loanForm.amount ||
      !this.loanForm.purpose ||
      !this.loanForm.durationMonths ||
      !this.loanForm.annualIncome ||
      this.loanForm.employmentYears === null ||
      this.loanForm.employmentYears === undefined ||
      !this.loanForm.age ||
      !this.selectedFile
    ) {
      this.errorMessage = 'All fields are required, including salary slip.';
      return;
    }
 
    const formData = new FormData();
    formData.append('LoanType', this.loanForm.loanType);
    formData.append('Amount', String(this.loanForm.amount));
    formData.append('Purpose', this.loanForm.purpose);
    formData.append('DurationMonths', String(this.loanForm.durationMonths));
    formData.append('AnnualIncome', String(this.loanForm.annualIncome));
    formData.append('EmploymentYears', String(this.loanForm.employmentYears));
    formData.append('Age', String(this.loanForm.age));
    formData.append('CreditScore', String(this.creditScore || 700));
    formData.append('ExistingLiabilities', String(this.existingLiabilities || 0));
 
    if (this.selectedFile) {
      formData.append('SalarySlip', this.selectedFile);
    }
 
    this.loanService.applyLoan(formData).subscribe({
      next: (res: any) => {
        this.successMessage = res?.message || 'Loan applied successfully.';
        this.errorMessage = '';
 
        this.loanForm = {
          loanType: '',
          amount: null,
          purpose: '',
          durationMonths: null,
          annualIncome: null,
          employmentYears: null,
          age: null
        };
 
        this.selectedFile = null;
        this.selectedFileName = '';
 
        this.eligibilityScore = 0;
        this.recommendedDecision = 'N/A';
        this.riskLevel = 'N/A';
        this.repaymentFit = 'N/A';
        this.interestRate = 'N/A';
        this.estimatedEmi = 'N/A';
        this.totalRepayment = 'N/A';
 
        this.loanService.notifyLoanStatusChanged();
      },
      error: (err: any) => {
        console.error('Loan submission error:', err);
        console.error('Backend error body:', err?.error);
        this.successMessage = '';
        this.errorMessage = err?.error?.message || err?.error?.title || 'Loan submission failed. Please try again.';
      }
    });
  }
 
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}







/*import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
 
@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './apply-loan.html',
  styleUrl: './apply-loan.css'
})
export class ApplyLoanComponent implements OnInit {
  loanForm = {
    loanType: '',
    amount: null as number | null,
    purpose: '',
    durationMonths: null as number | null,
    annualIncome: null as number | null,
    employmentYears: null as number | null,
    age: null as number | null
  };
 
  selectedFile: File | null = null;
  selectedFileName = '';
 
  successMessage = '';
  errorMessage = '';
 
  eligibilityScore = 0;
  recommendedDecision = 'N/A';
  riskLevel = 'N/A';
  repaymentFit = 'N/A';
  interestRate = 'N/A';
  estimatedEmi = 'N/A';
  totalRepayment = 'N/A';
 
  creditScore = 700;
  existingLiabilities = 0;
 
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.calculatePreview();
  }
 
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
 
    if (!file) {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.calculatePreview();
      return;
    }
 
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.errorMessage = 'Please upload salary slip in PDF format only.';
      this.selectedFile = null;
      this.selectedFileName = '';
      this.calculatePreview();
      return;
    }
 
    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.errorMessage = '';
    this.calculatePreview();
  }
 
  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.calculatePreview();
  }
 
  calculatePreview(): void {
    const amount = Number(this.loanForm.amount || 0);
    const durationMonths = Number(this.loanForm.durationMonths || 0);
    const annualIncome = Number(this.loanForm.annualIncome || 0);
    const employmentYears = Number(this.loanForm.employmentYears || 0);
    const age = Number(this.loanForm.age || 0);
    const loanType = this.loanForm.loanType || '';
 
    let interest = 12;
 
    switch (loanType) {
      case 'Home Loan':
        interest = 8.75;
        break;
      case 'Vehicle Loan':
        interest = 9.5;
        break;
      case 'Education Loan':
        interest = 10.75;
        break;
      case 'Personal Loan':
        interest = 12.25;
        break;
      default:
        interest = 12;
        break;
    }
 
    this.interestRate = `${interest.toFixed(2)}%`;
 
    let score = 0;
 
    switch (loanType) {
      case 'Home Loan':
        score += 18;
        break;
      case 'Education Loan':
        score += 14;
        break;
      case 'Vehicle Loan':
        score += 12;
        break;
      case 'Personal Loan':
        score += 8;
        break;
    }
 
    if (age >= 23 && age <= 55) score += 15;
    else if (age >= 21 && age <= 58) score += 12;
    else if (age > 18 && age <= 60) score += 8;
 
    if (annualIncome >= 1200000) score += 22;
    else if (annualIncome >= 900000) score += 18;
    else if (annualIncome >= 700000) score += 15;
    else if (annualIncome >= 500000) score += 12;
    else if (annualIncome >= 350000) score += 7;
    else if (annualIncome >= 250000) score += 3;
 
    if (employmentYears >= 8) score += 18;
    else if (employmentYears >= 5) score += 15;
    else if (employmentYears >= 3) score += 10;
    else if (employmentYears >= 1) score += 5;
 
    const loanToIncomeRatio = annualIncome > 0 ? amount / annualIncome : 99;
 
    if (loanToIncomeRatio <= 0.2) score += 18;
    else if (loanToIncomeRatio <= 0.5) score += 15;
    else if (loanToIncomeRatio <= 1.0) score += 10;
    else if (loanToIncomeRatio <= 1.5) score += 4;
    else score -= 10;
 
    if (durationMonths >= 36 && durationMonths <= 120) score += 10;
    else if (durationMonths >= 24) score += 7;
    else if (durationMonths >= 12) score += 4;
    else if (durationMonths > 0) score += 1;
 
    if (this.selectedFile) score += 5;
 
    const monthlyIncome = annualIncome > 0 ? annualIncome / 12 : 0;
    const monthlyRate = interest / 12 / 100;
 
    let emi = 0;
    if (amount > 0 && durationMonths > 0 && monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, durationMonths);
      emi = (amount * monthlyRate * factor) / (factor - 1);
    }
 
    const emiRatio = monthlyIncome > 0 ? emi / monthlyIncome : 1;
 
    if (emiRatio <= 0.2) score += 20;
    else if (emiRatio <= 0.3) score += 16;
    else if (emiRatio <= 0.4) score += 10;
    else if (emiRatio <= 0.5) score += 3;
    else score -= 15;
 
    if (loanToIncomeRatio > 1.5) score -= 8;
    if (emiRatio > 0.45) score -= 10;
    if (emiRatio > 0.55) score -= 10;
    if (annualIncome < 400000 && amount > 500000) score -= 10;
    if (employmentYears < 2 && amount > 300000) score -= 8;
    if (age < 21 || age > 60) score -= 12;
 
    score = Math.max(0, Math.min(100, Math.round(score)));
    this.eligibilityScore = score;
 
    if (score >= 85) {
      this.riskLevel = 'Low';
      this.recommendedDecision = 'Likely Approve';
      this.repaymentFit = 'Comfortable';
    } else if (score >= 65) {
      this.riskLevel = 'Moderate';
      this.recommendedDecision = 'Review';
      this.repaymentFit = 'Manageable';
    } else if (score >= 40) {
      this.riskLevel = 'High';
      this.recommendedDecision = 'Needs Review';
      this.repaymentFit = 'Risky';
    } else {
      this.riskLevel = 'Very High';
      this.recommendedDecision = 'Likely Reject';
      this.repaymentFit = 'Risky';
    }
 
    this.estimatedEmi =
      emi > 0 ? `₹${Math.round(emi).toLocaleString()}/month` : 'N/A';
 
    this.totalRepayment =
      emi > 0 && durationMonths > 0
        ? `₹${Math.round(emi * durationMonths).toLocaleString()}`
        : 'N/A';
  }
 
  submitLoan(): void {
    this.successMessage = '';
    this.errorMessage = '';
 
    if (
      !this.loanForm.loanType ||
      !this.loanForm.amount ||
      !this.loanForm.purpose ||
      !this.loanForm.durationMonths ||
      !this.loanForm.annualIncome ||
      this.loanForm.employmentYears === null ||
      this.loanForm.employmentYears === undefined ||
      !this.loanForm.age ||
      !this.selectedFile
    ) {
      this.errorMessage = 'All fields are required, including salary slip.';
      return;
    }
 
    const formData = new FormData();
    formData.append('LoanType', this.loanForm.loanType);
    formData.append('Amount', String(this.loanForm.amount));
    formData.append('Purpose', this.loanForm.purpose);
    formData.append('DurationMonths', String(this.loanForm.durationMonths));
    formData.append('AnnualIncome', String(this.loanForm.annualIncome));
    formData.append('EmploymentYears', String(this.loanForm.employmentYears));
    formData.append('Age', String(this.loanForm.age));
    formData.append('CreditScore', String(this.creditScore || 700));
    formData.append('ExistingLiabilities', String(this.existingLiabilities || 0));
 
    if (this.selectedFile) {
      formData.append('SalarySlip', this.selectedFile);
    }
 
    this.loanService.applyLoan(formData).subscribe({
      next: (res: any) => {
        this.successMessage = res?.message || 'Loan applied successfully.';
        this.errorMessage = '';
 
        this.loanForm = {
          loanType: '',
          amount: null,
          purpose: '',
          durationMonths: null,
          annualIncome: null,
          employmentYears: null,
          age: null
        };
 
        this.selectedFile = null;
        this.selectedFileName = '';
 
        this.eligibilityScore = 0;
        this.recommendedDecision = 'N/A';
        this.riskLevel = 'N/A';
        this.repaymentFit = 'N/A';
        this.interestRate = 'N/A';
        this.estimatedEmi = 'N/A';
        this.totalRepayment = 'N/A';
 
        this.loanService.notifyLoanStatusChanged();
      },
      error: (err: any) => {
        console.error('Loan submission error:', err);
        this.successMessage = '';
        this.errorMessage = err?.error?.message || 'Loan submission failed. Please try again.';
      }
    });
  }
 
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}*/