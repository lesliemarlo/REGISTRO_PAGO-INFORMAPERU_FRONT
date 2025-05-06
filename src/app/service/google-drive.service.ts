// google-drive.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private readonly API_URL = 'http://localhost:3001'; // Asegúrate que coincida con tu backend

  constructor(private http: HttpClient) {}

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.http.post<{url: string}>(
        `${this.API_URL}/upload`, 
        formData
      ).toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.url;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(this.getUploadErrorMessage(error));
    }
  }

  private getUploadErrorMessage(error: any): string {
    if (error.status === 403) {
      return 'No tienes permisos para subir archivos. Por favor autentícate primero.';
    }
    if (error.status === 413) {
      return 'El archivo es demasiado grande.';
    }
    return error.message || 'Error desconocido al subir el archivo';
  }

  
}