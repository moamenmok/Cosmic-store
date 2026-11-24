import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  wishlistCounter = signal(0);
  wishlistProductIds = signal<string[]>([]);

  private readonly httpClient = inject(HttpClient);

  addProductToWishlist(productId: string): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}api/v1/wishlist`, { productId: productId });
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}api/v1/wishlist/${productId}`);
  }

  getLoggedUserWishlist(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}api/v1/wishlist`);
  }
}
