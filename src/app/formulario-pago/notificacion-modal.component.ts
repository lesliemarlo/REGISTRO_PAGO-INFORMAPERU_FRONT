import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notificacion-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header" [ngClass]="{'bg-success text-white': tipo === 'exito', 'bg-danger text-white': tipo === 'error'}">
      <h5 class="modal-title">{{ titulo }}</h5>
      <button type="button" class="btn-close btn-close-white" (click)="activeModal.dismiss()" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <p>{{ mensaje }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn" 
              [ngClass]="{'btn-success': tipo === 'exito', 'btn-danger': tipo === 'error'}" 
              (click)="activeModal.close()">Aceptar</button>
    </div>
  `
})
export class NotificacionModalComponent {
  @Input() tipo: 'exito' | 'error' = 'exito';
  @Input() titulo: string = 'Notificación';
  @Input() mensaje: string = '';

  constructor(public activeModal: NgbActiveModal) {}
}