import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal, NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { AsesoresModalComponent } from '../asesores-modal/asesores-modal.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SesionService } from '../service/sesion.service';
import { NotificacionModalComponent } from './notificacion-modal.component';

@Component({
  selector: 'app-formulario-pago',
  imports: [CommonModule, ReactiveFormsModule, NotificacionModalComponent],
  templateUrl: './formulario-pago.component.html',
  styleUrl: './formulario-pago.component.css'
})
export class FormularioPagoComponent implements OnInit {
  pagoForm: FormGroup;
  asesores: any[] = [];
  encargadoData: any;
  listaAsesores: any[] = [];
  encargado: any;
  
  // Variables para mensajes y estados
  isSearchingClient: boolean = false;
  isUploading: boolean = false;
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mensajeError: string = '';
  formSubmitted: boolean = false; // Para mostrar errores de validación

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router, 
    private sesionService: SesionService,
    private modalService: NgbModal
  ) {
    this.pagoForm = this.fb.group({
      cliente_dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      cliente_nombre: ['', Validators.required],
      cliente_cartera: ['', Validators.required],
      cliente_numero_producto: ['', Validators.required],
      
      asesor_dni: ['', Validators.required],
      asesor_nombre: ['', Validators.required],
      asesor_rango: ['', Validators.required],
      
      encargado_username: ['', Validators.required],
      encargado_nombre: ['', Validators.required],
      
      fecha_voucher: ['', Validators.required],
      tipo_pago: ['', Validators.required],
      importe: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      empresa: ['', Validators.required],
      voucher_link: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Verifica si el usuario está logueado cuando el componente se carga
    if (!this.sesionService.isLoggedIn()) {
      this.router.navigate(['/login']); // Si no está logueado, redirige al login
    }
    const encargadoStr = localStorage.getItem('currentUser');
    if (encargadoStr) {
      this.encargado = JSON.parse(encargadoStr);
      console.log('Encargado cargado:', this.encargado);
      
      this.pagoForm.patchValue({
        encargado_username: this.encargado.username,
        encargado_nombre: this.encargado.nombre
      });
    } else {
      console.error('No se encontró el encargado en localStorage');
    }
  }
  
  // Método para verificar si un campo es inválido y mostrar mensaje
  campoNoValido(campo: string): boolean {
    return this.pagoForm.get(campo)?.invalid && 
           (this.pagoForm.get(campo)?.touched || this.formSubmitted) 
           ? true : false;
  }
  
  // Método para obtener mensaje de error de un campo
  getMensajeError(campo: string): string {
    const control = this.pagoForm.get(campo);
    
    if (control?.errors?.['required']) {
      return 'Este campo es obligatorio';
    } else if (control?.errors?.['pattern']) {
      if (campo === 'cliente_dni') {
        return 'El DNI debe tener 7 u 8 dígitos';
      } else if (campo === 'importe') {
        return 'Formato de importe inválido';
      }
    }
    
    return 'Campo inválido';
  }

  cargarAsesores(): void {
    console.log('Cargando asesores para encargado ID:', this.encargadoData.id);
    
    this.http.get<any[]>(`http://localhost:8090/api/asesores/by-encargado/${this.encargadoData.id}`)
      .subscribe({
        next: (asesores) => {
          console.log('Asesores recibidos:', asesores);
          this.asesores = asesores;
        },
        error: (error) => {
          console.error('Error al cargar asesores:', error);
          this.asesores = [];
        }
      });
  }

  buscarCliente(): void {
    const dni = this.pagoForm.get('cliente_dni')?.value;
    if (dni) {
      this.isSearchingClient = true;
  
      this.http.get<any[]>(`http://localhost:8090/api/clientes/buscar-por-dni?dni=${dni}`).subscribe({
        next: (data: any[]) => {
          if (data.length > 0) {
            const cliente = data[0]; // Toma el primero de la lista
            this.pagoForm.patchValue({
              cliente_nombre: cliente.cliente_nombre,
              cliente_cartera: cliente.cliente_cartera,
              cliente_numero_producto: cliente.cliente_numero_producto?.replace(/[\r\n]/g, '') // Limpiamos por si acaso
            });
          } else {
            this.mostrarError('No se encontraron clientes con ese DNI.');
          }
          this.isSearchingClient = false;
        },
        error: (error) => {
          console.error('Error al buscar cliente:', error);
          this.isSearchingClient = false;
          this.mostrarError('Cliente no encontrado. Verifique el DNI.');
        }
      });
    } else {
      this.mostrarError('Ingrese un DNI para buscar el cliente.');
    }
  }
  
  
  abrirModalAsesores() {
    // Primero cargamos los asesores habilitados del backend
    this.http.get<any[]>(`http://localhost:8090/api/asesores/by-encargado/${this.encargado.id}`)
      .subscribe({
        next: (asesoresHabilitados) => {
          console.log('Asesores habilitados recibidos:', asesoresHabilitados);
          
          // Ahora que tenemos los asesores filtrados, abrimos el modal
          const modalRef = this.modalService.open(AsesoresModalComponent, {
            centered: true,
            size: 'lg'
          });
          
          // Pasamos los asesores filtrados al modal
          modalRef.componentInstance.asesores = asesoresHabilitados;
          
          modalRef.result.then((asesorSeleccionado) => {
            if (asesorSeleccionado) {
              this.pagoForm.patchValue({
                asesor_dni: asesorSeleccionado.dni,
                asesor_nombre: asesorSeleccionado.nombre,
                asesor_rango: asesorSeleccionado.rango
              });
            }
          }).catch((err) => {
            console.log('Modal cerrado sin selección');
          });
        },
        error: (error) => {
          console.error('Error al cargar asesores habilitados:', error);
          this.mostrarError('Error al cargar asesores. Intente nuevamente.');
          // Aún con error, abrimos el modal con una lista vacía
          const modalRef = this.modalService.open(AsesoresModalComponent, {
            centered: true,
            size: 'lg'
          });
          modalRef.componentInstance.asesores = [];
        }
      });
  }

  onSubmit() {
    this.formSubmitted = true;
    
    // Validar el formulario
    if (this.pagoForm.invalid) {
      this.mostrarError('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }
    
    if (this.confirmacionPendiente) {
      this.mostrarError('Por favor confirme la subida del voucher antes de enviar el formulario.');
      return;
    }
    
    this.enviarFormulario();
  }
  
  enviarFormulario() {
    this.http.post('http://localhost:8090/api/pagos/registrar', this.pagoForm.value)
      .subscribe({
        next: (response) => {
          console.log('Registro exitoso', response);
          this.mostrarExito();
          this.limpiarFormulario();
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          this.mostrarError('Error al registrar el pago. Intente nuevamente.');
        }
      });
  }
  
  // Método para mostrar mensaje de éxito
  mostrarExito() {
    // Mostrar alerta en el propio componente
    this.mostrarMensajeExito = true;
    setTimeout(() => {
      this.mostrarMensajeExito = false;
    }, 5000); // Ocultar después de 5 segundos
    
    // Mostrar modal de éxito
    const modalRef = this.modalService.open(NotificacionModalComponent, {
      centered: true
    });
    modalRef.componentInstance.tipo = 'exito';
    modalRef.componentInstance.titulo = '¡Operación Exitosa!';
    modalRef.componentInstance.mensaje = 'El registro de pago se ha completado correctamente.';
  }
  // Método para mostrar mensaje de éxito
  mostrarSubida() {
    // Mostrar alerta en el propio componente
    this.mostrarMensajeExito = true;
    setTimeout(() => {
      this.mostrarMensajeExito = false;
    }, 5000); // Ocultar después de 5 segundos
    
    // Mostrar modal de éxito
    const modalRef = this.modalService.open(NotificacionModalComponent, {
      centered: true
    });
    modalRef.componentInstance.tipo = 'exito';
    modalRef.componentInstance.titulo = '¡Subida exitosa!';
    modalRef.componentInstance.mensaje = 'El voucher se ha subido a la carpeta de Drive exitosamente.';
  }
  // Método para mostrar mensaje de error
  mostrarError(mensaje: string) {
    // Mostrar alerta en el propio componente
    this.mostrarMensajeError = true;
    this.mensajeError = mensaje;
    setTimeout(() => {
      this.mostrarMensajeError = false;
    }, 5000); // Ocultar después de 5 segundos
    
    // Mostrar modal de error para errores críticos
    if (mensaje.includes('Error al registrar') || mensaje.includes('Error al subir')) {
      const modalRef = this.modalService.open(NotificacionModalComponent, {
        centered: true
      });
      modalRef.componentInstance.tipo = 'error';
      modalRef.componentInstance.titulo = '¡Error!';
      modalRef.componentInstance.mensaje = mensaje;
    }
  }
  
  // Método para limpiar el formulario después de un registro exitoso
  limpiarFormulario() {
    this.formSubmitted = false;
    this.pagoForm.reset();
    
    // Mantener los datos del encargado
    this.pagoForm.patchValue({
      encargado_username: this.encargado.username,
      encargado_nombre: this.encargado.nombre
    });
    
    // Resetear las variables de estado
    this.selectedFile = null;
    this.imagePreview = null;
    this.confirmacionPendiente = false;
  }

  cerrarSesion(): void {
    this.sesionService.logout(); // Llama al servicio para cerrar la sesión
  }

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  confirmacionPendiente: boolean = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.confirmacionPendiente = true;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelarSubida() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.confirmacionPendiente = false;
  }

  confirmarSubida() {
    if (this.selectedFile) {
      this.isUploading = true; // Mostramos la barra de carga desde el inicio

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<any>('http://localhost:8090/api/drive/upload', formData)
        .subscribe({
          next: response => {
            const url = response.webViewLink;
            this.pagoForm.patchValue({ voucher_link: url });
            this.imagePreview = null;
            this.confirmacionPendiente = false;
            this.isUploading = false; // Ocultamos la barra
            this.mostrarSubida();
          },
          error: error => {
            console.error('Error al subir imagen:', error);
            this.isUploading = false; // Ocultamos la barra también si falla
            this.mostrarError('Error al subir el voucher. Intente nuevamente.');
          }
        });
    }
  }
}