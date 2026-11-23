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
import { CartService } from '../../core/services/cart/cart.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ICart } from '../../core/models/icart.interface';
import { Modal } from 'flowbite';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit, AfterViewInit {
  private readonly cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  @ViewChild('deleteModal') deleteModalElement!: ElementRef<HTMLElement>;
  private deleteModal: Modal | null = null;
  pendingDelete = signal<{ type: 'item'; id: string } | { type: 'all' } | null>(null);

  cartData: WritableSignal<ICart> = signal({
    _id: '',
    cartOwner: '',
    products: [],
    createdAt: '',
    updatedAt: '',
    __v: 0,
    totalCartPrice: 0,
  });
  isLoading = signal(true);

  getCartProducts() {
    this.cartService.getLoggedUserCart().subscribe({
      next: (respone) => {
        if (isPlatformBrowser(this.platformId)) {
          this.cartData.set(respone.data);
        }
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
  confirmRemoveProduct(productId: string): void {
    this.pendingDelete.set({ type: 'item', id: productId });
    this.deleteModal?.show();
  }
  confirmClearCart(): void {
    this.pendingDelete.set({ type: 'all' });
    this.deleteModal?.show();
  }
  applyDelete(): void {
    const pending = this.pendingDelete();
    this.deleteModal?.hide();
    this.pendingDelete.set(null);
    if (pending?.type === 'item') this.removeProductFromCart(pending.id);
    if (pending?.type === 'all') this.clearUserCart();
  }
  closeDeleteModal(): void {
    this.deleteModal?.hide();
    this.pendingDelete.set(null);
  }
  clearUserCart() {
    this.cartService.clearUserCart().subscribe({
      next: (respone) => {
        if (isPlatformBrowser(this.platformId)) {
          this.cartService.cartCounter.set(respone.numOfCartItems);
this.cartData.set(respone.data);
        }
      },
      error: () => {},
    });
  }
  removeProductFromCart(productId: string) {
    this.cartService.removeProductFromCart(productId).subscribe({
      next: (respone) => {
        if (isPlatformBrowser(this.platformId)) {
this.cartData.set(respone.data);
          this.cartService.cartCounter.set(respone.numOfCartItems);
        }
      },
      error: () => {},
    });
  }
  updateCartCount(productId: string, count: number) {
    this.cartService.updateCartProductQuantity(productId, count).subscribe({
      next: (respone) => {
        if (isPlatformBrowser(this.platformId)) {
this.cartData.set(respone.data);
          this.cartService.cartCounter.set(respone.numOfCartItems);
        }
      },
      error: () => {},
    });
  }
  ngOnInit(): void {
    this.getCartProducts();
  }
}
