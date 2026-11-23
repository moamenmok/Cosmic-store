import {
  afterNextRender,
  Component,
  computed,
  inject,
  Injector,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { ThemeMode } from '../../core/services/theme-mode';
import { TranslationService } from '../../core/services/translation/translation.service';
import { CartService } from '../../core/services/cart/cart.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { AuthService } from '../../core/auth/services/auth/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  themeService = inject(ThemeMode);

  private readonly myTranslation = inject(TranslationService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly authService = inject(AuthService);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly isArabic = computed(() => this.myTranslation.lang() === 'ar');

  numberOfCartItems = computed(() => this.cartService.cartCounter());
  numberOfwishlistItems = computed(() => this.wishlistService.wishlistCounter());
  isLogged = signal<boolean>(false);
  isMobileMenuOpen = signal(false);
  userName = signal('');
  userEmail = signal('');

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.checkLogin();
        this.closeMobileMenu();
      });
  }

  ngOnInit(): void {
    this.checkLogin();
  }

  checkLogin(): void {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('token');
    const wasLogged = this.isLogged();

    this.isLogged.set(!!token);

    if (token) {
      const userData = localStorage.getItem('user');

      if (userData) {
        const user = JSON.parse(userData);
        this.userName.set(user.name || user.email?.split('@')[0] || '');
        this.userEmail.set(user.email || '');
      }

      if (!wasLogged) {
        this.getCartProducts();
        this.getWishlisttProducts();
      }
    } else {
      this.userName.set('');
      this.userEmail.set('');
      this.cartService.cartCounter.set(0);
      this.wishlistService.wishlistCounter.set(0);
      this.wishlistService.wishlistProductIds.set([]);
    }
    afterNextRender(() => this.initFlowbite(), { injector: this.injector });
  }

  private initFlowbite(): void {
    import('flowbite').then((m) => m.initFlowbite());
  }

  logout(): void {
    this.authService.loggedOut();

    this.closeUserMenu();
  }

  closeUserMenu(): void {
    if (!this.isBrowser) return;
    document.getElementById('user-menu-button')?.click();
  }

  toggleLang(): void {
    this.myTranslation.changeLanguage(this.isArabic() ? 'en' : 'ar');
  }

  changeLang(lang: string): void {
    this.myTranslation.changeLanguage(lang);
  }

  getCartProducts(): void {
    this.cartService.getLoggedUserCart().subscribe({
      next: (response) => {
        this.cartService.cartCounter.set(response.numOfCartItems);
      },
      error: () => {},
    });
  }

  getWishlisttProducts(): void {
    this.wishlistService.getLoggedUserWishlist().subscribe({
      next: (response) => {
        this.wishlistService.wishlistCounter.set(
          response.count ?? response.data?.length ?? 0,
        );
        this.wishlistService.wishlistProductIds.set(
          (response.data ?? [])
            .map((product: { _id?: string; id?: string }) => product._id ?? product.id)
            .filter((id: string | undefined): id is string => !!id),
        );
      },
      error: () => {},
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
