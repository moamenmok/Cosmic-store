import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isCheckoutRequest =
    req.method === 'POST' &&
    req.url.includes('/api/v1/orders/') &&
    !req.url.includes('/checkout-session/');
  const shouldShowLoading =
    isCheckoutRequest ||
    (req.method === 'POST' && req.url.includes('/api/v1/orders/checkout-session/')) ||
    (req.method === 'POST' && req.url.includes('/api/v1/auth/signin')) ||
    (req.method === 'POST' && req.url.includes('/api/v1/auth/signup'));

  if (!isPlatformBrowser(platformId) || !shouldShowLoading) return next(req);

  const spinner = inject(NgxSpinnerService);
  activeRequests++;
  spinner.show();

  return next(req).pipe(
    finalize(() => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) spinner.hide();
    }),
  );
};
