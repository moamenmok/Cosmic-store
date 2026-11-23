import {
  afterNextRender,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Injector,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductsService } from '../../core/services/products/products.service';
import { IProducts } from '../../core/models/iproducts.interface';
import { ICategories } from '../../core/models/icategories.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoriesCardsComponent } from '../categories/components/categories-cards/categories-cards.component';
import { ProfileComponent } from '../profile/profile.component';
import { initFlowbite } from 'flowbite';
import { FlowbiteService } from '../../core/services/flowbite/flowbite.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ProductCardComponent, TranslatePipe, CategoriesCardsComponent, ProfileComponent, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly injector = inject(Injector);
  categoriesList: WritableSignal<ICategories[]> = signal([]);
  productsList: WritableSignal<IProducts[]> = signal([]);
  isLoadingProducts = signal(true);
  readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  isFlipped1 = false;
  isFlipped2 = false;

  copied1 = false;
  copied2 = false;

  constructor(private flowbiteService: FlowbiteService) {
    afterNextRender(() => {
      void import('swiper/element/bundle').then(({ register }) => register());
    }, { injector: this.injector });
  }

  toggleFlip(cardNum: number): void {
    if (cardNum === 1) {
      this.isFlipped1 = !this.isFlipped1;
    } else {
      this.isFlipped2 = !this.isFlipped2;
    }
  }

  copyCode(event: Event, code: string, cardNum: number): void {
    event.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      if (cardNum === 1) {
        this.copied1 = true;
        setTimeout(() => (this.copied1 = false), 2000);
      } else {
        this.copied2 = true;
        setTimeout(() => (this.copied2 = false), 2000);
      }
    });
  }

  getAllProduct(): void {
    this.productsService.getAllProducts().subscribe({
      next: (res) => {
        this.productsList.set(res.data);
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false),
    });
  }

  ngOnInit(): void {
    this.getAllProduct();
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }
}
