import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Empresa, Asignacion, EstadoAsignacion } from '../supplier.component';

@Component({
    selector: 'app-list-supplier',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './list-supplier.component.html',
    styleUrls: ['./list-supplier.component.scss'],
})
export class ListSupplierComponent {
    @Input() empresa!: Empresa;
    @Input() asignaciones: Asignacion[] = [];
    @Output() volver = new EventEmitter<void>();

    EstadoAsignacion = EstadoAsignacion;

    // fila -> está en modo edición o no
    editando: { [id: string]: boolean } = {};
    // backup para poder restaurar valores al cancelar
    backup: { [id: string]: Asignacion } = {};

    // Asignaciones solo de esta empresa
    get asignacionesEmpresa(): Asignacion[] {
        if (!this.empresa) return [];
        return this.asignaciones.filter((a) => a.empresaId === this.empresa.id);
    }

    // ========================
    //   Cambiar estado directo
    // ========================
    cambiarEstadoDirecto(a: Asignacion) {
        a.estado =
            a.estado === EstadoAsignacion.Pendiente
                ? EstadoAsignacion.Entregado
                : EstadoAsignacion.Pendiente;
    }

    // ========================
    //   Entrar en modo edición
    // ========================
    editarFila(a: Asignacion) {
        this.editando[a.id] = true;

        // Guardamos una copia independiente de los valores actuales
        this.backup[a.id] = {
            ...a,
            fechaEntrega: a.fechaEntrega ? a.fechaEntrega : null,
        };
    }

    // ========================
    //   Cancelar edición
    // ========================
    cancelarEdicion(a: Asignacion) {
        const b = this.backup[a.id];
        if (b) {
            a.fechaAsignacion = b.fechaAsignacion;
            a.fechaEntrega = b.fechaEntrega;
        }
        this.editando[a.id] = false;
    }

    // ========================
    //   Guardar edición
    // ========================
    guardarFila(a: Asignacion) {
        // Los cambios ya están en `a` vía ngModel, solo salimos del modo edición
        this.editando[a.id] = false;
        // Ya no necesitamos el backup
        delete this.backup[a.id];
    }

    // ========================
    //   Eliminar asignación
    // ========================
    eliminar(a: Asignacion) {
        if (confirm(`¿Eliminar asignación ${a.pir}?`)) {
            this.asignaciones = this.asignaciones.filter((x) => x.id !== a.id);
        }
    }
}
