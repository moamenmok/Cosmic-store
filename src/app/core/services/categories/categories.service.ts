import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

type SubcategoriesPage = { data: any[]; metadata?: { numberOfPages?: number } };

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}api/v1`;

  getAllCategories(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/categories`);
  }

  getSpecificCategory(categoryId: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/categories/${categoryId}`);
  }
  private getSubcategoriesPage(page: number): Observable<SubcategoriesPage> {
    return this.httpClient.get<SubcategoriesPage>(`${this.baseUrl}/subcategories`, {
      params: { page },
    });
  }
  getAllSubcategories(): Observable<any[]> {
    return this.getSubcategoriesPage(1).pipe(
      switchMap((first) => {
        const pages = first.metadata?.numberOfPages ?? 1;
        if (pages <= 1) return of(first.data);

        const rest = Array.from({ length: pages - 1 }, (_, i) =>
          this.getSubcategoriesPage(i + 2).pipe(map((r) => r.data)),
        );
        return forkJoin(rest).pipe(map((others) => [first.data, ...others].flat()));
      }),
    );
  }
  getSubcategoriesByCategory(categoryId: string): Observable<any> {
    return this.getAllSubcategories().pipe(
      map((all) => ({
        data: all.filter(
          (s) => (typeof s.category === 'string' ? s.category : s.category?._id) === categoryId,
        ),
      })),
    );
  }

  getSpecificSubcategory(subcategoryId: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/subcategories/${subcategoryId}`);
  }

  getProductsBySubcategory(subcategoryId: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/products`, {
      params: { 'subcategory[in]': subcategoryId },
    });
  }

  getProducts(opts: {
    page?: number;
    limit?: number;
    subcategory?: string | null;
  }): Observable<any> {
    let params = new HttpParams().set('page', opts.page ?? 1).set('limit', opts.limit ?? 20);
    if (opts.subcategory) {
      params = params.set('subcategory[in]', opts.subcategory);
    }
    return this.httpClient.get(`${this.baseUrl}/products`, { params });
  }
}
