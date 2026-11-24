import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private readonly httpClient = inject(HttpClient);

  getAllBrands(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}api/v1/brands`);
  }
  getSpecificBrand(brandId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}api/v1/brands/${brandId}`);
  }
  getProductsByBrand(brandId: string, page = 1, limit = 20): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}api/v1//products`, {
      params: { brand: brandId, page, limit },
    });
  }
}
