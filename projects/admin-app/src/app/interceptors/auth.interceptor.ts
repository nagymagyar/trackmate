import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  console.log('[Auth Interceptor] Token:', token ? '✓ Present' : '✗ Missing', 'URL:', req.url);

  if (token) {
    console.log('[Auth Interceptor] Adding Bearer token to request');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('[Auth Interceptor] No token found in localStorage');
  }

  return next(req);
};
