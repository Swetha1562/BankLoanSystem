import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  currentStep: 1 | 2 | 3 = 1;

  forgotData = {
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  };

  submitted = false;
  isLoading = false;
  showNewPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isStrongPassword(password: string): boolean {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  sendOtp(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.forgotData.email.trim()) {
      this.errorMessage = 'Email is required.';
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword({
      email: this.forgotData.email.trim()
    }).subscribe({
      next: (res: string) => {
        this.isLoading = false;
        this.successMessage = res || 'OTP sent to your email.';
        this.errorMessage = '';
        this.currentStep = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.successMessage = '';
        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Failed to send OTP.';
      }
    });
  }

  verifyOtp(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.forgotData.otp.trim()) {
      this.errorMessage = 'OTP is required.';
      return;
    }

    this.isLoading = true;

    this.authService.verifyOtp({
      email: this.forgotData.email.trim(),
      otp: this.forgotData.otp.trim()
    }).subscribe({
      next: (res: string) => {
        this.isLoading = false;
        this.successMessage = res || 'OTP verified successfully.';
        this.errorMessage = '';
        this.currentStep = 3;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.successMessage = '';
        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Invalid OTP.';
      }
    });
  }

  resetPassword(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (
      !this.forgotData.newPassword.trim() ||
      !this.forgotData.confirmPassword.trim()
    ) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (!this.isStrongPassword(this.forgotData.newPassword)) {
      this.errorMessage =
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
      return;
    }

    if (this.forgotData.newPassword !== this.forgotData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword({
      email: this.forgotData.email.trim(),
      otp: this.forgotData.otp.trim(),
      newPassword: this.forgotData.newPassword
    }).subscribe({
      next: (res: string) => {
        this.isLoading = false;
        this.successMessage = res || 'Password reset successful.';
        this.errorMessage = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.successMessage = '';
        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Password reset failed.';
      }
    });
  }
}