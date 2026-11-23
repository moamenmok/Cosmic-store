import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, of, switchMap } from 'rxjs';
import { IProducts } from '../../core/models/iproducts.interface';
import { ProductsService } from '../../core/services/products/products.service';
import { CartService } from '../../core/services/cart/cart.service';
import { ICart } from '../../core/models/icart.interface';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-product-details',
  imports: [TranslatePipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  private readonly productsService = inject(ProductsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly wishlist = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  readonly isLogged = isPlatformBrowser(this.platformId) && !!localStorage.getItem('token');

  cartData: WritableSignal<ICart> = signal({} as ICart);
  productId = signal('');
  productData: WritableSignal<IProducts> = signal({} as IProducts);
  selectedImage = signal('');

  quantity = signal(1);
  isAdding = signal(false);
  isAddingToWishlist = signal(false);
  isLoading = signal(true);

  maxQuantity = computed(() => this.productData().quantity ?? 1);

  total = computed(() => (this.productData().price ?? 0) * this.quantity());

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.productId.set(params.get('id')!);
      this.quantity.set(1);
      this.selectedImage.set('');
      this.isLoading.set(true);
      this.getProductDetails();
    });
  }

  increaseQuantity(): void {
    if (this.quantity() < this.maxQuantity()) {
      this.quantity.update((count) => count + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((count) => count - 1);
    }
  }

  addToCart() {
    if (!this.isLogged) return;
    const count = this.quantity();
    this.isAdding.set(true);

    this.cartService
      .addProductToCart(this.productId())
      .pipe(
        switchMap((res) =>
          count > 1 ? this.cartService.updateCartProductQuantity(this.productId(), count) : of(res),
        ),
      )
      .subscribe({
        next: (res) => {
          this.cartData.set(res.data);
          this.cartService.cartCounter.set(res.numOfCartItems);

          this.isAdding.set(false);
        },
        error: (err) => {
          this.isAdding.set(false);
          if (err.status === 401) {
            this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
          }
        },
      });
  }
  addToWishlist() {
    if (!this.isLogged) return;
    this.isAddingToWishlist.set(true);
    this.wishlist.addProductToWishlist(this.productId()).pipe(
      finalize(() => this.isAddingToWishlist.set(false)),
    ).subscribe({
      next: (res) => {
        this.wishlist.wishlistProductIds.update((ids) =>
          ids.includes(this.productId()) ? ids : [...ids, this.productId()],
        );
        this.wishlist.wishlistCounter.set(
          res.count ?? res.data?.length ?? this.wishlist.wishlistCounter() + 1,
        );
      },
    });
  }

  updateCartCount(count: number) {
    this.cartService.updateCartProductQuantity(this.productId(), count).subscribe({
      next: (respone) => {
        this.cartData.set(respone.data);
      },
      error: () => {},
    });
  }

  getProductDetails(): void {
    this.productsService.getspecificProduct(this.productId()).subscribe({
      next: (res) => {
        this.productData.set(res.data);
        this.selectedImage.set(res.data.imageCover);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectImage(image: string): void {
    this.selectedImage.set(image);
  }
}
