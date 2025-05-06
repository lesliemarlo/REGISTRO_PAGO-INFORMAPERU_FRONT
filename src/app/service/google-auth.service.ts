import { Injectable } from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private client: any;

  constructor() { }

  initialize() {
    google.accounts.id.initialize({
      client_id: '1066391192514-6gjqb9g4a44jf2vfag7n1a1rnvdg8sl5.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
      ux_mode: 'popup', // Cambia a 'redirect' si prefieres
      auto_select: false
    });

    // Solo muestra el botón si estás en un entorno de producción
    if (window.location.hostname !== 'localhost') {
      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { theme: 'outline', size: 'large' }
      );
    }
  }

  handleCredentialResponse(response: any) {
    if (response.credential) {
      console.log("Token recibido:", response.credential);
      // Aquí puedes procesar el token JWT
    } else {
      console.error("Error en la respuesta:", response);
    }
  }

  prompt() {
    google.accounts.id.prompt();
  }
}