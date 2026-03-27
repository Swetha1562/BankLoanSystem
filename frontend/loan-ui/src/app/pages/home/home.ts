import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface LoanService {
  title: string;
  description: string;
  interestRate: string;
  amountRange: string;
  tenure: string;
  eligibility: string;
  processing: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  loanServices: LoanService[] = [
    {
      title: 'Personal Loans',
      description: 'Fast approval loans for emergency, education, travel, and family needs.',
      interestRate: '10.5% - 14.0% p.a.',
      amountRange: '₹50,000 - ₹10,00,000',
      tenure: '12 to 60 months',
      eligibility: 'Salaried or self-employed applicants with stable income.',
      processing: 'Quick approval with minimal documentation for eligible customers.'
    },
    {
      title: 'Home Loans',
      description: 'Structured financing with repayment flexibility for home purchase and renovation.',
      interestRate: '8.4% - 10.2% p.a.',
      amountRange: '₹5,00,000 - ₹1,00,00,000',
      tenure: '5 to 30 years',
      eligibility: 'Applicants with stable income, property documentation, and repayment capacity.',
      processing: 'Property and income verification required before final approval.'
    },
    {
      title: 'Business Loans',
      description: 'Funding support for expansion, operations, and working capital requirements.',
      interestRate: '11.0% - 16.5% p.a.',
      amountRange: '₹1,00,000 - ₹50,00,000',
      tenure: '12 to 84 months',
      eligibility: 'Business owners with valid business proof, income records, and repayment history.',
      processing: 'Officer review includes business performance and risk evaluation.'
    },
    {
      title: 'Vehicle Loans',
      description: 'Quick loan processing for two-wheeler and four-wheeler financing.',
      interestRate: '9.0% - 12.5% p.a.',
      amountRange: '₹75,000 - ₹25,00,000',
      tenure: '12 to 84 months',
      eligibility: 'Applicants with valid ID, income proof, and acceptable repayment profile.',
      processing: 'Vehicle quotation and applicant verification required.'
    }
  ];

  highlights: string[] = [
    'Secure login with role-based access',
    'Loan application and tracking in one place',
    'Officer approval and rejection workflow',
    'Transparent customer dashboard experience'
  ];

  selectedLoan: LoanService | null = null;
  userRole: string = '';

  ngOnInit(): void {
    this.userRole = this.getUserRoleFromToken();
  }

  openLoanDetails(loan: LoanService): void {
    this.selectedLoan = loan;
  }

  closeLoanDetails(): void {
    this.selectedLoan = null;
  }

  applyLoan(loanType: string): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/apply-loan', type: loanType }
      });
      return;
    }

    const role = this.getUserRoleFromToken();

    if (role === 'Customer') {
      this.router.navigate(['/apply-loan'], {
        queryParams: { type: loanType }
      });
      return;
    }

    if (role === 'Officer') {
      alert('Access Denied: Please login as Customer to apply for loans.');
      return;
    }

    this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/apply-loan', type: loanType }
    });
  }

  private getUserRoleFromToken(): string {
    const token = localStorage.getItem('token');

    if (!token) {
      return '';
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      return (
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] ||
        ''
      );
    } catch (error) {
      console.error('Failed to decode token:', error);
      return '';
    }
  }
}