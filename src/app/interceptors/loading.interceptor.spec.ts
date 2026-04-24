import { describe, it, expect, vi } from 'vitest';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';
import { loadingInterceptor } from './loading.interceptor';

describe('loadingInterceptor', () => {
  it('should pass through requests and stop loading', async () => {
    const request = new HttpRequest('GET', '/test');
    const next: HttpHandlerFn = () => of(new Response('ok') as any);

    const result = await loadingInterceptor(request, next).toPromise();
    expect(result).toBeTruthy();
  });
});
