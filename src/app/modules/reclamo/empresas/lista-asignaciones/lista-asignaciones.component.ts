import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresasComponent, Asignacion, EstadoAsignacion, Empresa } from '../empresas.component';

@Component({
    selector: 'app-lista-asignaciones',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './lista-asignaciones.component.html',
    styleUrls: ['./lista-asignaciones.component.scss'],
})
export class ListaAsignacionesComponent {
    @Input() empresa!: Empresa;
    @Input() asignaciones: Asignacion[] = [];
    @Output() volver = new EventEmitter<void>();

    EstadoAsignacion = EstadoAsignacion;

    cambiarEstado(a: Asignacion) {
        a.estado =
            a.estado === EstadoAsignacion.Pendiente
                ? EstadoAsignacion.Entregado
                : EstadoAsignacion.Pendiente;
    }

    eliminar(a: Asignacion) {
        if (confirm(`¿Eliminar la asignación ${a.pir}?`)) {
            this.asignaciones = this.asignaciones.filter(x => x.id !== a.id);
        }
    }
}
