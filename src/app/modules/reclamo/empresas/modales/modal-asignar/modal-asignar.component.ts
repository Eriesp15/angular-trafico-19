import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Empresa } from '../../modelos/empresas.model';
import { EmpresasService } from '../../servicios/empresas.service';

@Component({
    selector: 'app-modal-asignar',
    standalone: true,
    imports: [FormsModule],
    styleUrls: ['../modales.scss'],
    template: `
  <div class="modal-backdrop" *ngIf="abierto">
    <div class="modal">
      <div class="modal-header">
        <h3 style="margin:0">Asignar a {{empresa?.nombre}}</h3>
        <button class="btn" (click)="cerrar()">✕</button>
      </div>

      <div class="row">
        <div class="col">
          <label>Tipo reclamo</label>
          <select class="input" [(ngModel)]="tipoReclamo">
            <option value="DPR">DPR</option><option value="AHL">AHL</option>
            <option value="PIL">PIL</option><option value="OHD">OHD</option>
          </select>
        </div>
        <div class="col">
          <label>PIR</label>
          <input class="input" [(ngModel)]="pir" (input)="updateSugerencias()" list="pirList" placeholder="PIR00..." />
          <datalist id="pirList">
            <option *ngFor="let p of sugerencias" [value]="p"></option>
          </datalist>
        </div>
      </div>

      <div class="row" style="margin-top:.6rem">
        <div class="col"><label>Pasajero</label><input class="input" [(ngModel)]="pasajero" /></div>
      </div>

      <div class="row" style="margin-top:.6rem">
        <div class="col">
          <label>Fecha asignación</label>
          <input class="input" type="date" [(ngModel)]="fechaAsignacion" />
        </div>
        <div class="col">
          <label>Fecha entrega</label>
          <input class="input" type="date" [(ngModel)]="fechaEntrega" />
        </div>
      </div>

      <div class="row" style="justify-content:flex-end; margin-top:1rem">
        <button class="btn" (click)="cerrar()">Cancelar</button>
        <button class="btn btn-primario"
         [disabled]="!empresa || !tipoReclamo || !pir || !pasajero || !fechaAsignacion"
         (click)="guardar()">Asignar</button>
      </div>
    </div>
  </div>`,
})
export class ModalAsignarComponent {
    constructor(private svc: EmpresasService){}
    abierto = false;
    @Input() empresa?: Empresa;
    @Output() creado = new EventEmitter<void>();

    tipoReclamo:'DPR'|'AHL'|'PIL'|'OHD'='DPR';
    pir=''; pasajero=''; fechaAsignacion = new Date().toISOString().slice(0,10); fechaEntrega='';
    sugerencias: string[] = [];

    abrir(empresa: Empresa){ this.empresa = empresa; this.abierto=true; this.tipoReclamo='DPR'; this.pir=''; this.pasajero=''; this.fechaAsignacion=new Date().toISOString().slice(0,10); this.fechaEntrega=''; this.sugerencias=[]; }
    cerrar(){ this.abierto=false; }
    updateSugerencias(){ this.sugerencias = this.svc.sugerirPIR(this.pir); }
    guardar(){
        if(!this.empresa) return;
        this.svc.crearAsignacion({
            empresaId: this.empresa.id,
            tipoReclamo: this.tipoReclamo,
            pir: this.pir,
            pasajero: this.pasajero,
            fechaAsignacion: this.fechaAsignacion,
            fechaEntrega: this.fechaEntrega || undefined,
        });
        this.creado.emit();
        this.cerrar();
    }
}
