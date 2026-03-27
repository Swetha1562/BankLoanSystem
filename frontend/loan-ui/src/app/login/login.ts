import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.message = '';

    const payload = {
      email: this.email,
      password: this.password
    };

    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);

        const role = this.authService.getUserRole();

        if (role === 'Officer') {
          this.router.navigate(['/officer-dashboard']);
        } else {
          this.router.navigate(['/customer-dashboard']);
        }
      },
      error: (err: any) => {
        this.message = err?.error || 'Login failed. Please try again.';
      }
    });
  }
}