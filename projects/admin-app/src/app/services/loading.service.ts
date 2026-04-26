import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  readonly isLoading = signal<boolean>(false);
  private requestCount = 0;

  start(): void {
    this.requestCount++;
    this.isLoading.set(true);
  }

  stop(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      this.isLoading.set(false);
    }
  }

  reset(): void {
    this.requestCount = 0;
    this.isLoading.set(false);
  }
}
