import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { ICategories } from '../../../../core/models/icategories.interface';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-categories-cards',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './categories-cards.component.html',
  styleUrl: './categories-cards.component.css',
})
export class CategoriesCardsComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);

  categoryDetails: WritableSignal<ICategories | null> = signal(null);
  categoriesList: WritableSignal<ICategories[]> = signal([]);
  isLoading = signal(true);
  readonly skeletons = Array.from({ length: 10 }, (_, i) => i);

  getAllCategories(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.categoriesService.getAllCategories().subscribe({
        next: (res) => {
          this.categoriesList.set(res.data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    }
  }

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('categoryId');

    if (categoryId) {
    }
    this.getAllCategories();
  }
}
