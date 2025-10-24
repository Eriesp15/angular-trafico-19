import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-modal-tipo-empresa',
    standalone: true,
    imports: [FormsModule],
    styleUrls: ['../modales.scss'],
    template: `
  <div class="modal-backdrop" *ngIf="abierto">
    <div class="modal">
      <div class="modal-header">
        <h3 style="margin:0">Nuevo tipo de empresa</h3>
        <button class="btn" (click)="cerrar()">✕</button>
      </div>
      <div class="row">
        <input class="input" [(ngModel)]="nombre" placeholder="Nombre del tipo (p.ej. Transporte)" />
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:1rem">
        <button class="btn" (click)="cerrar()">Cancelar</button>
        <button class="btn btn-primario" [disabled]="!nombre?.trim()" (click)="guardar()">Guardar</button>
      </div>
    </div>
  </div>`,
})
export class ModalTipoEmpresaComponent {
    abierto = false;
    nombre = '';
    @Output() crear = new EventEmitter<string>();
    abrir(){ this.abierto = true; this.nombre=''; }
    cerrar(){ this.abierto = false; }
    guardar(){ if(this.nombre.trim()) { this.crear.emit(this.nombre.trim()); this.cerrar(); } }
}
