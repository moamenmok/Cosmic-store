import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly httpClient = inject(HttpClient);

  createCashOrder(cartId: string, data: any): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}api/v1/orders/${cartId}`, data);
  }
  checkoutVisa(cartId: string, data: any): Observable<any> {
    const returnUrl = window.location.origin;
    const params = new URLSearchParams({ url: returnUrl });

    return this.httpClient.post(
      `${environment.baseUrl}api/v1/orders/checkout-session/${cartId}?${params.toString()}`,
      data,
    );
  }
  getUserOrders(userId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}api/v1/orders/user/${userId}`);
  }
  getAllOrders(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}api/v1/orders`);
  }

  addAddress(data: {
    name: string;
    details: string;
    phone: string;
    city: string;
  }): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}api/v1/addresses`, data);
  }

  removeAddress(addressesId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}api/v1/addresses/${addressesId}`);
  }
  getLoggedUserAddresses(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}api/v1/addresses`);
  }
}
