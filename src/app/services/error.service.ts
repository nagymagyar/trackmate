import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private nextId = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  show(message: string, type: ToastMessage['type'] = 'error', duration = 5000): void {
    const id = ++this.nextId;
    const toast: ToastMessage = { id, message, type, duration };
    this.toasts.update(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  handleError(error: any, fallbackMessage = 'Ismeretlen hiba történt'): void {
    let message = fallbackMessage;

    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    console.error('[ErrorService]', error);
    this.show(message, 'error');
  }

  handleSuccess(message: string): void {
    this.show(message, 'success', 3000);
  }
}

