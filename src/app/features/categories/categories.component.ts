import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CategoriesService } from '../../core/services/categories/categories.service';
import { ICategories } from '../../core/models/icategories.interface';
import { CategoriesCardsComponent } from './components/categories-cards/categories-cards.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, RouterOutlet, CategoriesCardsComponent, TranslatePipe],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);

  categoriesList: WritableSignal<ICategories[]> = signal([]);

  ngOnInit(): void {}
}
