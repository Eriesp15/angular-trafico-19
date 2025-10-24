import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tipo } from '../../modelos/empresas.model';


@Component({
    selector: 'app-modal-empresa',
    standalone: true,
    imports: [FormsModule],
    styleUrls: ['../modales.scss'],
    template: `
  <div class="modal-backdrop" *ngIf="abierto">
    <div class="modal">
      <div class="modal-header">
        <h3 style="margin:0">Nueva empresa</h3>
        <button class="btn" (click)="cerrar()">✕</button>
      </div>

      <div class="row">
        <div class="col">
          <label>Tipo</label>
          <select class="input" [(ngModel)]="tipoId">
            <option *ngFor="let t of tipos" [value]="t.id">{{t.nombre}}</option>
          </select>
        </div>
        <div class="col">
          <label>Nombre</label>
          <input class="input" [(ngModel)]="nombre" />
        </div>
      </div>

      <div class="row" style="margin-top:.6rem">
        <div class="col"><label>Teléfono</label><input class="input" [(ngModel)]="telefono" /></div>
        <div class="col"><label>Email</label><input class="input" [(ngModel)]="email" /></div>
      </div>
      <div class="row" style="margin-top:.6rem">
        <div class="col"><label>Razón social</label><input class="input" [(ngModel)]="razonSocial" /></div>
        <div class="col"><label>Dirección</label><input class="input" [(ngModel)]="direccion" /></div>
      </div>

      <div class="row" style="justify-content:flex-end; margin-top:1rem">
        <button class="btn" (click)="cerrar()">Cancelar</button>
        <button class="btn btn-primario"
          [disabled]="!tipoId || !nombre || !telefono || !email || !razonSocial || !direccion"
          (click)="guardar()">Guardar</button>
      </div>
    </div>
  </div>`,
})
export class ModalEmpresaComponent {
    abierto = false;
    @Input({ required: true }) tipos: Tipo[] = [];
    @Output() crear = new EventEmitter<{tipoId:string, nombre:string, telefono:string, email:string, razonSocial:string, direccion:string}>();

    tipoId=''; nombre=''; telefono=''; email=''; razonSocial=''; direccion='';

    abrir(){ this.abierto = true; this.tipoId=this.tipos[0]?.id ?? ''; this.nombre=this.telefono=this.email=this.razonSocial=this.direccion=''; }
    cerrar(){ this.abierto = false; }
    guardar(){ this.crear.emit({ tipoId:this.tipoId, nombre:this.nombre, telefono:this.telefono, email:this.email, razonSocial:this.razonSocial, direccion:this.direccion }); this.cerrar(); }
}
