import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css'
})
export class MyLoansComponent implements OnInit, OnDestroy {
  loans: any[] = [];
  private hubConnection!: signalR.HubConnection;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLoans();
    this.startSignalRConnection();
  }

  startSignalRConnection(): void {
    const token = localStorage.getItem('token') || '';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/notificationHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connected in my-loans');
      })
      .catch((err) => {
        console.error('SignalR connection error in my-loans:', err);
      });

    this.hubConnection.on('LoanStatusUpdated', (data: any) => {
      console.log('LoanStatusUpdated received in my-loans:', data);
      this.loadLoans();
    });

    this.hubConnection.on('ReceiveNotification', (data: any) => {
      console.log('ReceiveNotification received in my-loans:', data);
      this.loadLoans();
    });
  }

  loadLoans(): void {
    this.apiService.getMyLoans().subscribe({
      next: (res: any) => {
        console.log('My loans response:', res);
        this.loans = Array.isArray(res) ? [...res] : [];
        console.log('Loans assigned:', this.loans);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Get my loans error:', err);
        this.loans = [];
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR disconnected from my-loans'))
        .catch(err => console.error('Error stopping SignalR:', err));
    }
  }
}
















/*import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css'
})
export class MyLoansComponent implements OnInit {
  loans: any[] = [];

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.apiService.getMyLoans().subscribe({
      next: (res: any) => {
        console.log('My loans response:', res);
        this.loans = Array.isArray(res) ? [...res] : [];
        console.log('Loans assigned:', this.loans);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Get my loans error:', err);
        this.loans = [];
        this.cdr.detectChanges();
      }
    });
  }
}*/