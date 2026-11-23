import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);

  readonly lang = signal<string>('en');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('lang') || 'en';
      this.lang.set(saved);
      this.translate.use(saved);
      this.changeDirection();
    }
  }

  changeDirection(): void {
    if (isPlatformBrowser(this.platformId)) {
      const lang = this.lang();
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }

  changeLanguage(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
    this.lang.set(lang);
    this.translate.use(lang);
    this.changeDirection();
  }
}
