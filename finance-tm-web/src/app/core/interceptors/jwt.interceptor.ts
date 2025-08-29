import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  const token = isBrowser ? localStorage.getItem('tm.jwt') : null;

  const idemp =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  const setHeaders: Record<string, string> = {
    'X-Idempotency-Key': idemp,
    Accept: 'application/json',
  };
  if (token) setHeaders['Authorization'] = `Bearer ${token}`;

  const authReq = req.clone({ setHeaders });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isBrowser && err.status === 401) {
        localStorage.removeItem('tm.jwt');
        localStorage.removeItem('tm.account');
        if (typeof location !== 'undefined') location.href = '/login';
      }
      return throwError(() => err);
    })
  );
};
