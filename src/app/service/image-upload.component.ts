import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { GoogleDriveService } from './google-drive.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule], // Añade CommonModule aquí
  template: `
    <div>
      <label class="form-label">Subir comprobante:</label>
      
      <!-- Usa @if en lugar de *ngIf si estás en Angular 17+ -->
      @if (previewUrl) {
        <div class="mb-3">
          <img [src]="previewUrl" alt="Vista previa" style="max-height: 200px; max-width: 100%;">
        </div>
      }
      
      <div class="input-group">
        <input 
          type="file" 
          class="form-control"
          accept="image/*" 
          (change)="onFileChange($event)"
          [disabled]="isUploading"
        >
        <button 
          class="btn btn-primary" 
          type="button" 
          (click)="uploadImage()"
          [disabled]="!selectedFile || isUploading"
        >
          Subir
        </button>
      </div>
      
      @if (isUploading) {
        <div class="mt-2">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Subiendo...</span>
          </div>
          <span class="ms-2">Subiendo imagen...</span>
        </div>
      }
      
      @if (uploadError) {
        <div class="alert alert-danger mt-2">
          {{ uploadError }}
        </div>
      }
    </div>
  `,
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Output() imageUploaded = new EventEmitter<string>();
  isUploading = false;
  uploadError: string | null = null;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private driveService: GoogleDriveService) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.previewImage(this.selectedFile);
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // image-upload.component.ts
async uploadImage(): Promise<void> {
  if (!this.selectedFile) return;

  this.isUploading = true;
  this.uploadError = null;
  
  try {
    const imageUrl = await this.driveService.uploadFile(this.selectedFile);
    this.imageUploaded.emit(imageUrl);
  } catch (error: any) {
    console.error('Upload error:', error);
    this.uploadError = 'Error al subir la imagen. Intenta nuevamente.';
  } finally {
    this.isUploading = false;
  }
}
  
  private getErrorMessage(error: any): string {
    if (error.error === 'access_denied') {
      return 'No se otorgaron los permisos necesarios. Por favor, acepta todos los permisos solicitados.';
    }
    return error.message || 'Ocurrió un error al subir el archivo';
  }
}