import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../core/auth/services/auth/auth.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const rePassword = control.get('rePassword')?.value;

  return password === rePassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-forget-pass',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './forget-pass.component.html',
  styleUrl: './forget-pass.component.css',
})
export class ForgetPassComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  step = signal(1);

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  codeForm = new FormGroup({
    resetCode: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]),
  });

  passwordForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rePassword: new FormControl('', Validators.required),
    },
    { validators: passwordMatchValidator },
  );
  sendCode(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.get('email')?.value;

    if (!email) return;

    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
this.step.set(2);
      },
      error: (err) => {
},
    });
  }
  verifyCode(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    const resetCode = this.codeForm.get('resetCode')?.value;

    if (!resetCode) return;

    this.authService.verifyResetCode({ resetCode }).subscribe({
      next: (res) => {
this.step.set(3);
      },
      error: (err) => {
},
    });
  }
  resetPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.get('email')?.value;
    const newPassword = this.passwordForm.get('password')?.value;

    if (!email || !newPassword) return;

    this.authService
      .resetPassword({
        email,
        newPassword,
      })
      .subscribe({
        next: (res) => {
this.router.navigate(['/login']);
        },
        error: (err) => {
},
      });
  }
  resendCode(): void {
    const email = this.emailForm.get('email')?.value;

    if (!email) return;

    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
},
      error: (err) => {
},
    });
  }

  changeEmail(): void {
    this.step.set(1);
  }

  goBack(): void {
    this.step.update((current) => Math.max(1, current - 1));
  }
}
