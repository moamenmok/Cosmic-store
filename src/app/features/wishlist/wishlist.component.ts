import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { IWishlist } from '../../core/models/iwishlist.interface';
import { ToastrService } from 'ngx-toastr';

import { CartService } from '../../core/services/cart/cart.service';
import { Modal } from 'flowbite';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  imports: [TranslatePipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit, AfterViewInit {
  private readonly wishlist = inject(WishlistService);
  private readonly cartService = inject(CartService);
  toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  @ViewChild('deleteModal') deleteModalElement!: ElementRef<HTMLElement>;
  private deleteModal: Modal | null = null;
  pendingDeleteId = signal<string | null>(null);
  addingToCartId = signal<string | null>(null);

  wishlistData: WritableSignal<IWishlist[]> = signal([]);
  isLoading = signal(true);

  getLoggedUserWhishlist() {
    this.wishlist.getLoggedUserWishlist().subscribe({
      next: (res) => {
        this.wishlistData.set(res.data);
        this.wishlist.wishlistCounter.set(res.count ?? res.data?.length ?? 0);
        this.wishlist.wishlistProductIds.set(res.data.map((product: IWishlist) => product._id));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.deleteModal = new Modal(this.deleteModalElement.nativeElement, {
        backdrop: 'static',
        closable: true,
      });
    }
  }
  confirmRemoveFromWishlist(productId: string): void {
    this.pendingDeleteId.set(productId);
    this.deleteModal?.show();
  }
  applyDelete(): void {
    const productId = this.pendingDeleteId();
    this.deleteModal?.hide();
    this.pendingDeleteId.set(null);
    if (productId) this.removeFromWishlist(productId);
  }
  closeDeleteModal(): void {
    this.deleteModal?.hide();
    this.pendingDeleteId.set(null);
  }
  removeFromWishlist(productId: string) {
    this.wishlist
      .removeFromWishlist(productId)

      .subscribe({
        next: (res) => {
          this.getLoggedUserWhishlist();
          this.wishlist.wishlistProductIds.update((ids) => ids.filter((id) => id !== productId));
          this.wishlist.wishlistCounter.set(
            res.count ?? Math.max(0, this.wishlist.wishlistCounter() - 1),
          );
        },
      });
  }
  addToCart(productId: string) {
    this.addingToCartId.set(productId);
    this.cartService.addProductToCart(productId).pipe(
      finalize(() => this.addingToCartId.set(null)),
    ).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('toast.cartSuccess'), this.translate.instant('toast.cartSuccessTitle'));
      },
    });
  }

  ngOnInit(): void {
    this.getLoggedUserWhishlist();
  }
}
