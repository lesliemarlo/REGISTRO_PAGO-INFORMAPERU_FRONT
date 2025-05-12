import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-clientes-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header bg-primary text-white">
      <h4 class="modal-title">Seleccionar Cliente</h4>
      <button type="button" class="btn-close btn-close-white" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div *ngIf="clientes && clientes.length > 0">
        <p>Se encontraron múltiples clientes con el mismo DNI. Por favor seleccione uno:</p>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Cartera</th>
                <th>Número de Producto</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cliente of clientes">
                <td>{{ cliente.clientes_dni }}</td>
                <td>{{ cliente.cliente_nombre }}</td>
                <td>{{ cliente.cliente_cartera }}</td>
                <td>{{ cliente.cliente_numero_producto }}</td>
                <td>
                  <button class="btn btn-sm btn-primary" (click)="seleccionarCliente(cliente)">
                    Seleccionar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div *ngIf="!clientes || clientes.length === 0" class="text-center p-3">
        <p class="text-muted">No se encontraron clientes para mostrar.</p>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cerrar</button>
    </div>
  `
})
export class ClientesModalComponent {
  @Input() clientes: any[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  seleccionarCliente(cliente: any) {
    this.activeModal.close(cliente);
  }
}