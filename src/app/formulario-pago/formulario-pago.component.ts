import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AsesoresModalComponent } from '../asesores-modal/asesores-modal.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <-- Añade esta importación
import { SesionService } from '../service/sesion.service';

@Component({
  selector: 'app-formulario-pago',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-pago.component.html',
  styleUrl: './formulario-pago.component.css'
})
export class FormularioPagoComponent implements OnInit {
  pagoForm: FormGroup;
  asesores: any[] = [];
  encargadoData: any;
  listaAsesores: any[] = [];
  encargado: any;




  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router, 
    private sesionService: SesionService,  // Asegúrate de inyectarlo aquí
    private modalService: NgbModal
  ) {
    this.pagoForm = this.fb.group({
      cliente_dni: ['', Validators.required],
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
  isSearchingClient: boolean = false; // Esto va en tu componente

  buscarCliente(): void {
    const dni = this.pagoForm.get('cliente_dni')?.value;
    if (dni) {
      this.isSearchingClient = true; // Activa barra
  
      this.http.get(`http://localhost:8090/clientes/${dni}`).subscribe({
        next: (data: any) => {
          this.pagoForm.patchValue({
            cliente_nombre: data.nombre_contacto,
            cliente_cartera: data.nombre_campana,
            cliente_numero_producto: data.codigo_producto
          });
          this.isSearchingClient = false; // Desactiva barra
        },
        error: (error) => {
          console.error('Error al buscar cliente:', error);
          this.isSearchingClient = false; // También si falla
        }
      });
    }
  }
  

  abrirModalAsesores() {
    const modalRef = this.modalService.open(AsesoresModalComponent, {
      centered: true,
      size: 'lg'
    });
  
    modalRef.componentInstance.asesores = this.encargado?.asesores || []; // le pasas los asesores directamente
    // Si quieres pasar el encargado entero:
    // modalRef.componentInstance.encargado = this.encargado;
    
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
  }
  


onSubmit() {
  if (this.confirmacionPendiente) {
    alert('Por favor confirma la subida del voucher antes de enviar el formulario.');
    return;
  }
  if (this.selectedFile) {

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8090/api/pagos/registrar', this.pagoForm.value)
    .subscribe(response => {
      console.log('Registro exitoso', response);
    });
  } else {
    this.enviarFormulario();
  }
}
//checar esto
enviarFormulario() {
  this.http.post('http://localhost:8090/api/pagos/registrar', this.pagoForm.value)
    .subscribe(response => {
      console.log('Registro exitoso', response);
    });
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

isUploading: boolean = false; // Esto va en tu componente

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
        },
        error: error => {
          console.error('Error al subir imagen:', error);
          this.isUploading = false; // Ocultamos la barra también si falla
        }
      });
  }
}}