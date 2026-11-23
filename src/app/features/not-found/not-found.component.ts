import { Component, inject } from '@angular/core';
import { RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  private readonly response = inject(RESPONSE_INIT, { optional: true });

  constructor() {
    if (this.response) {
      this.response.status = 404;
    }
  }
}
