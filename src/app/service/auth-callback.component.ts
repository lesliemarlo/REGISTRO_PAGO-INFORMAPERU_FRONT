// auth-callback.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  template: `
    <div *ngIf="type === 'success'">
      Autenticación exitosa! Cerrando esta ventana...
    </div>
    <div *ngIf="type === 'error'">
      Error en la autenticación. Por favor intenta nuevamente.
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  type: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.type = this.route.snapshot.data['type'];
    if (this.type === 'success') {
      setTimeout(() => window.close(), 2000);
    }
  }
}