import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly httpClient = inject(HttpClient);
  cartCounter = signal(0);

  addProductToCart(productId: string): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}api/v2/cart`, { productId: productId });
  }
  updateCartProductQuantity(productId: string, count: number): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}api/v2/cart/${productId}`, { count: count });
  }
  removeProductFromCart(productId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}api/v2/cart/${productId}`);
  }
  clearUserCart(): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}api/v2/cart`);
  }
  getLoggedUserCart(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}api/v2/cart`);
  }
}
