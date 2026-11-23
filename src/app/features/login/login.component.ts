import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  loginErrorMessage: WritableSignal<string> = signal('');
  loginSuccessMessage: WritableSignal<string> = signal('');
  iserror = signal(false);
  isloading = signal(false);
  submitform() {
    this.loginErrorMessage.set('');
    this.loginSuccessMessage.set('');
    this.iserror.set(false);
    if (isPlatformBrowser(this.platformId)) {
      if (this.loginForm.valid) {
        this.isloading.set(true);

        this.authService.login(this.loginForm.value).subscribe({
          next: (respone) => {
            if (respone) {
localStorage.setItem('token', respone.token);
              localStorage.setItem('user', JSON.stringify(respone.user));
              this.loginSuccessMessage.set(respone.message);

              setTimeout(() => {
                this.router.navigate(['/home']);
              }, 1500);
            } else {
              this.iserror.set(true);
              this.loginErrorMessage.set(respone.message ?? 'Login failed, please try again');
              this.isloading.set(false);
            }
          },
          error: (err) => {
            this.iserror.set(true);
            this.loginErrorMessage.set(
              err.error?.message ?? 'Something went wrong, please try again',
            );
            this.isloading.set(false);
          },
          complete: () => {
            this.isloading.set(false);
          },
        });
      } else {
        this.loginForm.markAllAsDirty();
      }
    }
  }
  togglePassword(passwordElement: HTMLInputElement): void {
    if (passwordElement.type === 'password') {
      passwordElement.type = 'text';
    } else {
      passwordElement.type = 'password';
    }
  }
}
