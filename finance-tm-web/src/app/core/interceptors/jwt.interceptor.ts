import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../../shared/ui/toast/toasts.service';

export const NO_TOAST = new HttpContextToken<boolean>(() => false);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

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

  const silent = req.context.get(NO_TOAST);
  const isPreflight = req.method === 'OPTIONS';

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!silent && !isPreflight) {
        const apiMsg = (err.error && (err.error.message || err.error.error_description)) || null;

        if (err.status === 0) {
          toast.error('Falha de conexão', 'Não foi possível comunicar com o servidor. Verifique se o serviço está no ar.');
        } else if (err.status === 401) {
          toast.warning('Sessão expirada', 'Faça login novamente.');
        } else if (err.status === 403) {
          toast.error('Acesso negado', 'Você não tem permissão para executar esta ação.');
        } else if (err.status >= 500) {
          toast.error('Erro no servidor', apiMsg || 'Tente novamente em instantes.');
        } else {
          toast.error('Falha na requisição', apiMsg || `Erro ${err.status}.`);
        }
      }

      if (isBrowser && err.status === 401) {
        localStorage.removeItem('tm.jwt');
        localStorage.removeItem('tm.account');
        if (typeof location !== 'undefined') location.href = '/login';
      }
      return throwError(() => err);
    })
  );
};
