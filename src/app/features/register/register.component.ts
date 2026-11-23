import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  registerForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(12)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[1250][0-9]{8}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
        ],
      ],
      rePassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: [this.confirmPassword] },
  );

  registerErrorMessage: WritableSignal<string> = signal('');
  registerSuccessMessage: WritableSignal<string> = signal('');
  iserror = signal(false);
  isloading = signal(false);
  showPass = signal(false);
  showRePass = signal(false);
  private readonly passwordValue = toSignal(this.registerForm.controls.password.valueChanges, {
    initialValue: '',
  });

  readonly strength = computed(() => {
    const p = this.passwordValue();
    const score = [
      p.length >= 8,
      /[a-z]/.test(p) && /[A-Z]/.test(p),
      /\d/.test(p),
      /[#?!@$%^&*-]/.test(p),
    ].filter(Boolean).length;

    const levels = [
      { label: '', color: 'bg-border' },
      { label: 'weak', color: 'bg-rose-500' },
      { label: 'medium', color: 'bg-amber-500' },
      { label: 'medium', color: 'bg-amber-500' },
      { label: 'strong', color: 'bg-emerald-500' },
    ];
    return { width: score * 25, ...levels[score] };
  });

  submitform() {
    this.registerErrorMessage.set('');
    this.registerSuccessMessage.set('');
    this.iserror.set(false);

    if (this.registerForm.valid) {
      this.isloading.set(true);
      const { name, email, phone, password, rePassword } = this.registerForm.getRawValue();

      this.authService.register({ name, email, phone, password, rePassword }).subscribe({
        next: (respone) => {
          if (respone.success) {
            this.registerSuccessMessage.set(respone.message);

            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          }
        },
        error: (err) => {
          this.iserror.set(true);
          this.registerErrorMessage.set(
            err.error?.message ?? 'Something went wrong, please try again',
          );
          this.isloading.set(false);
        },
        complete: () => {
          this.isloading.set(false);
        },
      });
    } else {
      this.registerForm.markAllAsDirty();
    }
  }

  confirmPassword(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const rePassword = form.get('rePassword')?.value;
    return password === rePassword ? null : { mismatch: true };
  }

  togglePassword(passwordElement: HTMLInputElement): void {
    if (passwordElement.type === 'password') {
      passwordElement.type = 'text';
    } else {
      passwordElement.type = 'password';
    }
  }
}
