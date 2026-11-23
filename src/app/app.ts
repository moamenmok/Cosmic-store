import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { TranslationService } from './core/services/translation/translation.service';
import { NgxSpinnerComponent } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, NgxSpinnerComponent, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('e-commerce');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);
  private readonly myTranslation = inject(TranslationService);

  constructor() {
    this.translate.addLangs(['ar', 'en']);

    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang');

      const lang = savedLang === 'ar' ? 'ar' : 'en';

      this.myTranslation.changeLanguage(lang);
    }
  }
}
