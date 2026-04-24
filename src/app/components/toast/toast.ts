import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of errorService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="errorService.remove(toast.id)">
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="errorService.remove(toast.id); $event.stopPropagation()">✕</button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.css'
})
export class ToastComponent {
  readonly errorService = inject(ErrorService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  }
}

