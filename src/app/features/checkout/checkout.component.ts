import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';

import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { CartService } from '../../core/services/cart/cart.service';
import { ICart } from '../../core/models/icart.interface';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

interface IShippingAddress {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
  postalCode: string;
}

interface ICheckoutPayload {
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
    postalCode: string;
  };
}

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);

  cartData: WritableSignal<ICart> = signal({
    _id: '',
    cartOwner: '',
    products: [],
    createdAt: '',
    updatedAt: '',
    __v: 0,
    totalCartPrice: 0,
  });
  cartPrice = signal('');
  addressesList = signal<IShippingAddress[]>([]);
  cartId = signal('');
  isLoadingCart = signal(true);
  isLoadingAddresses = signal(true);

  selectedAddressId = signal<string | null>(null);
  paymentMethod = signal<'cash' | 'visa'>('cash');

  checkoutForm = new FormGroup({
    details: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),

    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)],
    }),

    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    postalCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  getCartIdFromRoute(): void {
    this.activatedRoute.paramMap.subscribe((param) => {
      this.cartId.set(param.get('id') ?? '');
    });
  }

  getCartProducts(): void {
    this.cartService.getLoggedUserCart().subscribe({
      next: (response) => {
        this.cartData.set(response.data);
        this.isLoadingCart.set(false);
        this.cartPrice.set(
          response.data.products.reduce(
            (total: number, product: any) => total + product.price * product.count,
            0,
          ),
        );
      },
      error: () => this.isLoadingCart.set(false),
    });
  }

  getUserAddress(): void {
    this.checkoutService.getLoggedUserAddresses().subscribe({
      next: (response) => {
        const addresses: IShippingAddress[] = response.data;

        this.addressesList.set(addresses);
        this.isLoadingAddresses.set(false);
        if (addresses.length > 0) {
          this.selectSavedAddress(addresses[0]);
        }
      },
      error: () => this.isLoadingAddresses.set(false),
    });
  }

  selectSavedAddress(address: IShippingAddress): void {
    this.selectedAddressId.set(address._id);

    this.checkoutForm.patchValue({
      details: address.details,
      phone: address.phone,
      city: address.city,
      postalCode: address.postalCode,
    });
  }

  useNewAddress(): void {
    this.selectedAddressId.set(null);

    this.checkoutForm.reset({
      details: '',
      phone: '',
      city: '',
      postalCode: '',
    });
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const payload: ICheckoutPayload = {
      shippingAddress: this.checkoutForm.getRawValue(),
    };

    if (this.paymentMethod() === 'cash') {
      this.checkoutService.createCashOrder(this.cartId(), payload).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('checkout.cashOrderSuccess'),
            this.translate.instant('checkout.orderPlaced'),
          );
          void this.router.navigate(['/cart']);
        },
        error: (error) => {},
      });
    } else {
      this.checkoutService.checkoutVisa(this.cartId(), payload).subscribe({
        next: (response) => {
          if (isPlatformBrowser(this.platformId)) {
            window.open(response.session.url, '_blank');
          }
        },
        error: (error) => {},
      });
    }
  }

  ngOnInit(): void {
    this.getCartIdFromRoute();

    if (isPlatformBrowser(this.platformId)) {
      this.getCartProducts();
      this.getUserAddress();
    }
  }
}
