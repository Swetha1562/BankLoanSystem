import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ToastMessage, ToastService } from './toast.service';
 
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent {
  toast$: Observable<ToastMessage | null>;
 
  constructor(private toastService: ToastService) {
    this.toast$ = this.toastService.toast$;
  }
 
  closeToast(): void {
    this.toastService.clear();
  }
}
 