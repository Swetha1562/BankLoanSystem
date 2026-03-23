import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './officer-dashboard.html',
  styleUrls: ['./officer-dashboard.css']
})
export class OfficerDashboardComponent implements OnInit {
  totalLoans = 0;
  pendingLoans = 0;
  approvedLoans = 0;
  rejectedLoans = 0;
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private loanService: LoanService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    console.log('OFFICER TOKEN:', token);

    this.loanService.getAllLoans().subscribe({
      next: (res: any[]) => {
        console.log('OFFICER API RESPONSE:', res);

        const loans = Array.isArray(res) ? res : [];

        this.totalLoans = loans.length;
        this.pendingLoans = loans.filter(
          (x: any) => x.status === 'Pending' || x.Status === 'Pending'
        ).length;
        this.approvedLoans = loans.filter(
          (x: any) => x.status === 'Approved' || x.Status === 'Approved'
        ).length;
        this.rejectedLoans = loans.filter(
          (x: any) => x.status === 'Rejected' || x.Status === 'Rejected'
        ).length;

        console.log('TOTAL:', this.totalLoans);
        console.log('PENDING:', this.pendingLoans);
        console.log('APPROVED:', this.approvedLoans);
        console.log('REJECTED:', this.rejectedLoans);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Officer dashboard error:', err);
        this.errorMessage = err?.error || 'Unable to load officer dashboard.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}