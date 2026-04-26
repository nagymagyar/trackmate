import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

 
  console.log('API CALL:', req.url);
  console.log('TOKEN:', token);

  if (!token) return next(req);

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  return next(cloned);
};