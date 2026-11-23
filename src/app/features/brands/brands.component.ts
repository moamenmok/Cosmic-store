import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { IBrands } from '../../core/models/ibrands.interface';
import { BrandService } from '../../core/services/brand/brand.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-brands',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
})
export class BrandsComponent implements OnInit {
  private readonly brandService = inject(BrandService);
  private readonly activatedRoute = inject(ActivatedRoute);

  brandsList: WritableSignal<IBrands[]> = signal([]);
  brandDetails: WritableSignal<IBrands[]> = signal([]);
  isLoading = signal(true);
  readonly skeletons = Array.from({ length: 12 }, (_, i) => i);

  getAllBrands() {
    this.brandService.getAllBrands().subscribe({
      next: (res) => {
        this.brandsList.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getBrandDetails(): void {
    const brandId = this.activatedRoute.snapshot.paramMap.get('id');

    if (!brandId) return;

    this.brandService.getSpecificBrand(brandId).subscribe({
      next: (res) => {
        this.brandDetails.set(res.data);
},
    });
  }
  ngOnInit(): void {
    this.getAllBrands();
    this.getBrandDetails();
  }
}
