import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../shared/toast/toast.service';
import { NavbarComponent } from '../components/navbar/navbar';
import { RouterModule } from '@angular/router';
 
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
 
  email = '';
  newPassword = '';
  confirmPassword = '';
 
  showPassword = false;
  showConfirmPassword = false;
 
  message = '';        
  successMessage = ''; 
 
  isLoading = false;
 
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}
 
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }
 
  resetPassword(): void {
    this.message = '';
    this.successMessage = '';
 
    if (!this.newPassword || !this.confirmPassword) {
      this.message = 'Please fill all fields.';
      return;
    }
 
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }
 
    this.isLoading = true;
 
    const payload = {
      email: this.email.trim().toLowerCase(),
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };
 
    this.authService.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
 

        this.successMessage = 'Password reset successfully. Redirecting to login...';
        this.toastService.show(this.successMessage, 'success');
 
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.message = err?.error?.message || 'Password reset failed.';
        this.toastService.show(this.message, 'error');
      }
    });
  }
}