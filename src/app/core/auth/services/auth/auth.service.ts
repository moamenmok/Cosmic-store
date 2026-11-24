import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly spinner = inject(NgxSpinnerService);
  private readonly platformID = inject(PLATFORM_ID);

  register(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}api/v1/auth/signup`, data);
  }
  login(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}api/v1/auth/signin`, data);
  }
  userChangePassword(data: object): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}api/v1/users/changeMyPassword`, data);
  }
  forgotPassword(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}api/v1/auth/forgotPasswords`, data);
  }
  verifyResetCode(data: object): Observable<any> {
    return this.httpClient.post(` ${environment.baseUrl}api/v1/auth/verifyResetCode`, data);
  }
  resetPassword(data: object): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}api/v1/auth/resetPassword`, data);
  }

  loggedOut() {
    this.spinner.show();
    setTimeout(() => {
      if (isPlatformBrowser(this.platformID)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('socialToken');
        localStorage.removeItem('socialUser');
      }
      this.spinner.hide();

      void this.router.navigate(['/login']);
    }, 1500);
  }
}
