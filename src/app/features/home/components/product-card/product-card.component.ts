import { Component, computed, inject, input, InputSignal, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IProducts } from '../../../../core/models/iproducts.interface';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart/cart.service';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../../../core/services/wishlist/wishlist.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  private readonly cartService = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);

  product: InputSignal<IProducts> = input({} as IProducts);
  readonly isLogged = isPlatformBrowser(this.platformId) && !!localStorage.getItem('token');
  isAddingToCart = signal(false);
  isAddingToWishlist = signal(false);
  isInWishlist = computed(() => this.wishlist.wishlistProductIds().includes(this.product()._id));

  stars = computed(() => {
    const rating = Math.round(this.product().ratingsAverage ?? 0);
    return Array.from({ length: 5 }, (_, i) => i < rating);
  });
  addToWishlist(productId: string) {
    if (!this.isLogged) return;
    this.isAddingToWishlist.set(true);
    this.wishlist
      .addProductToWishlist(productId)
      .pipe(finalize(() => this.isAddingToWishlist.set(false)))
      .subscribe({
        next: (res) => {
          this.wishlist.wishlistProductIds.update((ids) =>
            ids.includes(productId) ? ids : [...ids, productId],
          );
          this.wishlist.wishlistCounter.set(
            res.count ?? res.data?.length ?? this.wishlist.wishlistCounter() + 1,
          );
          this.toastr.success(
            this.translate.instant('toast.wishlistSuccess'),
            this.translate.instant('toast.wishlistSuccessTitle'),
          );
        },
      });
  }

  addToCart(productId: string) {
    if (!this.isLogged) return;
    this.isAddingToCart.set(true);
    this.cartService.addProductToCart(productId).pipe(
      finalize(() => this.isAddingToCart.set(false)),
    ).subscribe({
      next: (res) => {
        this.cartService.cartCounter.set(res.numOfCartItems);
        this.toastr.success(
          this.translate.instant('toast.cartSuccess'),
          this.translate.instant('toast.cartSuccessTitle'),
        );
      },
    });
  }
}
