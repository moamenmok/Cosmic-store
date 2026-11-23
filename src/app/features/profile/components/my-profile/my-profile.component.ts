import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../core/auth/services/auth/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-my-profile',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent {
  private readonly userInfo = inject(AuthService);

  changePasswordForm = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
      ]),
      rePassword: new FormControl('', [Validators.required]),
    },
    { validators: this.confirmPassword },
  );

  errorMessage: WritableSignal<string> = signal('');
  successMessage: WritableSignal<string> = signal('');
  isloading = signal(false);

  visible = signal({ currentPassword: false, newPassword: false, rePassword: false });

  toggleVisibility(field: 'currentPassword' | 'newPassword' | 'rePassword'): void {
    this.visible.update((v) => ({ ...v, [field]: !v[field] }));
  }

  get currentPassword() {
    return this.changePasswordForm.controls.currentPassword;
  }
  get newPassword() {
    return this.changePasswordForm.controls.newPassword;
  }
  get rePassword() {
    return this.changePasswordForm.controls.rePassword;
  }
  loggedOut(): void {
    this.userInfo.loggedOut();
  }
  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isloading.set(true);

    const body = {
      currentPassword: this.currentPassword.value!,
      password: this.newPassword.value!,
      rePassword: this.rePassword.value!,
    };

    this.userInfo.userChangePassword(body).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set(response.message);
          this.changePasswordForm.reset();
          this.loggedOut();
        }
        this.isloading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Something went wrong. Please try again.');

        this.isloading.set(false);
      },
      complete: () => {
        this.loggedOut();
      },
    });
  }

  confirmPassword(form: AbstractControl): ValidationErrors | null {
    const password = form.get('newPassword')?.value;
    const rePassword = form.get('rePassword')?.value;
    const reControl = form.get('rePassword');

    if (password !== rePassword) {
      reControl?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    if (reControl?.hasError('mismatch')) {
      const { mismatch, ...rest } = reControl.errors ?? {};
      reControl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  }
}
