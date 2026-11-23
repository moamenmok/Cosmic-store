import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckoutService } from '../../../../core/services/checkout/checkout.service';
import { Modal } from 'flowbite';
import { TranslatePipe } from '@ngx-translate/core';

interface IAddress {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

@Component({
  selector: 'app-setting',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './setting.component.html',
})
export class SettingComponent implements OnInit, AfterViewInit {
  private readonly checkoutService = inject(CheckoutService);
  private readonly platformId = inject(PLATFORM_ID);
  @ViewChild('deleteModal') deleteModalElement!: ElementRef<HTMLElement>;
  private deleteModal: Modal | null = null;

  addresses = signal<IAddress[]>([]);
  showForm = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  deletingId = signal<string | null>(null);
  pendingDeleteId = signal<string | null>(null);
  errorMessage = signal('');

  addressForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    details: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)],
    }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  ngOnInit(): void {
    this.getAddresses();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.deleteModal = new Modal(this.deleteModalElement.nativeElement, {
        backdrop: 'static',
        closable: true,
      });
    }
  }

  confirmDeleteAddress(id: string): void {
    this.pendingDeleteId.set(id);
    this.deleteModal?.show();
  }

  applyDeleteAddress(): void {
    const id = this.pendingDeleteId();
    this.deleteModal?.hide();
    this.pendingDeleteId.set(null);
    if (id) this.deleteAddress(id);
  }

  closeDeleteModal(): void {
    this.deleteModal?.hide();
    this.pendingDeleteId.set(null);
  }

  getAddresses(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.checkoutService.getLoggedUserAddresses().subscribe({
      next: (res) => {
        this.addresses.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load addresses.');
        this.isLoading.set(false);
      },
    });
  }

  openAddForm(): void {
    this.addressForm.reset();
    this.errorMessage.set('');
    this.showForm.set(true);
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.checkoutService.addAddress(this.addressForm.getRawValue()).subscribe({
      next: (res) => {
        this.addresses.set(res.data ?? []);
        this.isSaving.set(false);
        this.closeForm();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to add address.');
        this.isSaving.set(false);
      },
    });
  }

  deleteAddress(id: string): void {
    this.deletingId.set(id);
    this.checkoutService.removeAddress(id).subscribe({
      next: (res) => {
        this.addresses.set(res.data ?? this.addresses().filter((a) => a._id !== id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to delete address.');
        this.deletingId.set(null);
      },
    });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.addressForm.reset();
  }
}
