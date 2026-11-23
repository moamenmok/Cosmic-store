import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, DOCUMENT, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
type Theme = 'light' | 'dark';
@Injectable({
  providedIn: 'root',
})
export class ThemeMode {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  theme = signal<Theme>('light');

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const savedTheme = localStorage.getItem('cosmic-theme');

      this.setTheme(savedTheme === 'dark' ? 'dark' : 'light', false);
    });
  }

  setTheme(theme: Theme, save = true): void {
    this.theme.set(theme);

    const html = this.document.documentElement;

    html.classList.toggle('dark', theme === 'dark');
    html.style.colorScheme = theme;

    if (save && isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cosmic-theme', theme);
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }
}
