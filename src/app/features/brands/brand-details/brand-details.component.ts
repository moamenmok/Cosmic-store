import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, combineLatest, map, Observable, of, startWith, switchMap } from 'rxjs';
import { BrandService } from '../../../core/services/brand/brand.service';
import { ProductCardComponent } from '../../home/components/product-card/product-card.component';
import { TranslatePipe } from '@ngx-translate/core';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; products: any[]; totalPages: number };

@Component({
  selector: 'app-brand-details',
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  templateUrl: './brand-details.component.html',
})
export class BrandDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly brandService = inject(BrandService);

  readonly limit = 20;
  readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  private readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly page = computed(() => Math.max(1, Number(this.query().get('page')) || 1));
  readonly brand = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) =>
        this.brandService.getSpecificBrand(id).pipe(
          map((res) => res.data),
          catchError(() => of(null)),
        ),
      ),
    ),
    { initialValue: null },
  );
  private readonly state = toSignal(
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, query]) => ({
        id: params.get('id') ?? '',
        page: Math.max(1, Number(query.get('page')) || 1),
      })),
      switchMap(({ id, page }): Observable<State> =>
        this.brandService.getProductsByBrand(id, page, this.limit).pipe(
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
}
