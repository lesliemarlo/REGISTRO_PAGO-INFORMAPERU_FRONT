import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asesores-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asesores-modal.component.html',
  styleUrls: ['./asesores-modal.component.css']
})
export class AsesoresModalComponent {
  @Input() asesores: any[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  seleccionarAsesor(asesor: any): void {
    this.activeModal.close(asesor);
  }
}