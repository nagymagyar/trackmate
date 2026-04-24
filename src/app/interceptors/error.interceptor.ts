import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ErrorService } from '../services/error.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Hálózati hiba történt';

      if (error.error instanceof ErrorEvent) {
        message = error.error.message;
      } else {
        switch (error.status) {
          case 0:
            message = 'A szerver nem elérhető. Ellenőrizd a kapcsolatot!';
            break;
          case 400:
            message = error.error?.message || 'Hibás kérés';
            break;
          case 401:
            message = 'Nincs jogosultság a művelethez';
            break;
          case 404:
            message = 'A kért erőforrás nem található';
            break;
          case 500:
            message = 'Szerver hiba történt';
            break;
          default:
            message = error.error?.message || `Hiba: ${error.status}`;
        }
      }

      errorService.show(message, 'error');
      return throwError(() => error);
    })
  );
};

