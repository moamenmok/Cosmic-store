import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { headerInterceptor } from './core/interceptors/header/header-interceptor';
import { loadingInterceptor } from './core/interceptors/loading/loading-interceptor';
import { errorInterceptor } from './core/interceptors/error/error-interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(NgxSpinnerModule),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
      withViewTransitions(),
    ),
    provideClientHydration(withEventReplay()),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
    provideToastr({
      positionClass: 'toast-bottom-right',
      timeOut: 3500,
      closeButton: true,
      progressBar: true,
      newestOnTop: true,
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([headerInterceptor, loadingInterceptor, errorInterceptor]),
    ),
  ],
};
