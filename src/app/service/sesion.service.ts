import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  constructor(private router: Router) { }

  // Método para verificar si hay sesión activa
  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuario'); // Revisa si el usuario está en localStorage
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('usuario'); // Elimina los datos del usuario de localStorage
    this.router.navigate(['/login']); // Redirige al login
  }

  // Método para realizar el login
 
login(userData: any): void {
    localStorage.setItem('usuario', JSON.stringify(userData)); // Guarda el usuario en localStorage
    console.log('Login exitoso');
    this.router.navigate(['/formulario-pago']); // Redirige a la página de formulario de pago
  }
  
}
