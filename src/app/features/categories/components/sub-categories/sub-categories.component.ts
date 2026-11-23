import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { TranslatePipe } from '@ngx-translate/core';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; category: any; subcategories: any[] };

@Component({
  selector: 'app-sub-categories',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './sub-categories.component.html',
})
export class SubCategoriesComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);

  private readonly state = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id): Observable<State> =>
        forkJoin({
          category: this.categoriesService.getSpecificCategory(id),
          subcategories: this.categoriesService.getSubcategoriesByCategory(id),
        }).pipe(
          map((res): State => ({
            status: 'ready',
            category: res.category.data,
            subcategories: res.subcategories.data,
          })),
          catchError((err) =>
            of<State>({
              status: 'error',
              message: err.error?.message ?? 'Failed to load this category, please try again',
            }),
          ),
          startWith<State>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  isLoading = computed(() => this.state().status === 'loading');

  errorMessage = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.message : '';
  });

  category = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.category : null;
  });

  subcategories = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.subcategories : [];
  });
}
