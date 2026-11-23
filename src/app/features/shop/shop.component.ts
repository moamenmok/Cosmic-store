import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CategoriesService } from '../../core/services/categories/categories.service';
import { ProductCardComponent } from '../home/components/product-card/product-card.component';
import { TranslatePipe } from '@ngx-translate/core';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; products: any[]; totalPages: number };

@Component({
  selector: 'app-shop',
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  templateUrl: './shop.component.html',
})
export class ShopComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);

  readonly limit = 20;
  readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  private readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly subcategoryId = computed(() => this.query().get('subcategory'));
  readonly page = computed(() => Math.max(1, Number(this.query().get('page')) || 1));

  readonly activeSubcategory = toSignal(
    toObservable(this.subcategoryId).pipe(
      switchMap((id) =>
        id
          ? this.categoriesService.getSpecificSubcategory(id).pipe(
              map((res) => res.data),
              catchError(() => of(null)),
            )
          : of(null),
      ),
    ),
    { initialValue: null },
  );

  private readonly state = toSignal(
    toObservable(computed(() => ({ sub: this.subcategoryId(), page: this.page() }))).pipe(
      switchMap(({ sub, page }): Observable<State> =>
        this.categoriesService.getProducts({ page, limit: this.limit, subcategory: sub }).pipe(
          map((res): State => ({
            status: 'ready',
            products: res.data,
            totalPages: res.metadata?.numberOfPages ?? 1,
          })),
          catchError((err) =>
            of<State>({
              status: 'error',
              message: err.error?.message ?? 'Failed to load products, please try again',
            }),
          ),
          startWith<State>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  readonly isLoading = computed(() => this.state().status === 'loading');

  readonly errorMessage = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.message : '';
  });

  readonly products = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.products : [];
  });

  readonly totalPages = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.totalPages : 1;
  });

  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: p === 1 ? null : p },
      queryParamsHandling: 'merge',
    });
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subcategory: null, page: null },
      queryParamsHandling: 'merge',
    });
  }
}
