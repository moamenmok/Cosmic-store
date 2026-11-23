import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { IOrders } from '../../core/models/iorders.interface';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { TranslatePipe } from '@ngx-translate/core';

interface ITokenPayload {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}
@Component({
  selector: 'app-orders',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private readonly checkoutService = inject(CheckoutService);
  private readonly platformId = inject(PLATFORM_ID);

  ordersList: WritableSignal<IOrders[]> = signal([]);
  isLoading = signal(true);

  userId = signal('');

  getUserId(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');

    if (token) {
      const decoded = jwtDecode<ITokenPayload>(token);
      this.userId.set(decoded.id);
    }
    this.getUserOrders();
  }
  getUserOrders(): void {
    const userId = this.userId();

    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.checkoutService.getUserOrders(userId).subscribe({
      next: (res) => {
        this.ordersList.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getUserId();
    }
  }
}
