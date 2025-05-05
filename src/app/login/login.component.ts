import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SesionService } from '../service/sesion.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false; // <-- Añade esta línea

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private sesionService: SesionService // Asegúrate de inyectar el servicio de sesión aquí
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  onLogin(userData: any): void {
    // Aquí validarías las credenciales, si son correctas llamas a:
    this.sesionService.login(userData);
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const credentials = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };
  
      this.http.post<any>('http://localhost:8090/api/auth/login', credentials)
        .subscribe({
          next: (response) => {
            console.log('Respuesta completa del login:', response);
            localStorage.setItem('currentUser', JSON.stringify(response.encargado)); // Asegúrate de que 'encargado' esté disponible
            
            // Ahora llama a onLogin() para almacenar el usuario en sesión
            this.sesionService.login(response.encargado);
  
            this.router.navigate(['/formulario-pago']); // Redirige al formulario de pago
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error en login:', error);
            this.errorMessage = error.status === 401 ? 'Credenciales incorrectas' : 'Error en el servidor';
            this.isLoading = false;
          }
        });
    }
  }
  
}