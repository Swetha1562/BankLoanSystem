import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.message = '';

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        if (!res?.token) {
          this.message = 'Token not returned from server.';
          return;
        }

        this.authService.saveToken(res.token);
        const role = this.authService.getUserRole();

        if (role === 'Officer') {
          this.router.navigate(['/officer-dashboard']);
        } else {
          this.router.navigate(['/customer-dashboard']);
        }
      },
      error: (err) => {
        console.log('Login error:', err);
        this.message =
          err?.error?.message ||
          err?.error ||
          'Invalid email or password.';
      }
    });
  }
}