import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modal-confirmacion',
    standalone: true,
    imports: [CommonModule],                // 👈 necesario por *ngIf
    styleUrls: ['../modales.scss'],        // 👈 ruta CORRECTA (un nivel arriba)
    template: `
  <div class="modal-backdrop" *ngIf="abierto">
    <div class="modal">
      <div class="modal-header">
        <h3 style="margin:0">{{titulo || 'Confirmación'}}</h3>
        <button class="btn" (click)="cancelar.emit()">✕</button>
      </div>
      <p style="margin:.5rem 0 1rem">{{mensaje}}</p>
      <div class="row" style="justify-content:flex-end">
        <button class="btn" (click)="cancelar.emit()">Cancelar</button>
        <button class="btn btn-primario" (click)="confirmar.emit()">Confirmar</button>
      </div>
    </div>
  </div>`,
})
export class ModalConfirmacionComponent {
    @Input() abierto = false;
    @Input() titulo?: string;
    @Input() mensaje = '';
    @Output() confirmar = new EventEmitter<void>();
    @Output() cancelar  = new EventEmitter<void>();
}
