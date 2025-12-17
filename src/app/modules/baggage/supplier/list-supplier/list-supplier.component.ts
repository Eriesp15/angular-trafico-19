import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Empresa, Asignacion, EstadoAsignacion } from '../supplier.component';

@Component({
    selector: 'app-list-supplier',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './list-supplier.component.html',
    styleUrls: ['./list-supplier.component.scss'],
})
export class ListSupplierComponent {

    @Input() empresa!: Empresa;
    @Input() asignaciones: Asignacion[] = [];

    @Output() volver = new EventEmitter<void>();

    EstadoAsignacion = EstadoAsignacion;

    // control de edición por fila
    editando: { [id: string]: boolean } = {};

    // respaldo para cancelar
    backup: { [id: string]: Asignacion } = {};

    // ============================
    //   FILTRAR SOLO DEL EMPRESA
    // ============================
    get asignacionesEmpresa(): Asignacion[] {
        if (!this.empresa) return [];
        return this.asignaciones.filter(a => a.empresaId === this.empresa.id);
    }

    // ============================
    //  CAMBIAR ESTADO HACIENDO CLICK
    // ============================
    cambiarEstadoDirecto(a: Asignacion) {
        a.estado = a.estado === EstadoAsignacion.Pendiente
            ? EstadoAsignacion.Entregado
            : EstadoAsignacion.Pendiente;
    }

    // ============================
    //  ENTRAR EN MODO EDICIÓN
    // ============================
    editarFila(a: Asignacion) {
        this.editando[a.id] = true;

        // guardar copia exacta para restablecer
        this.backup[a.id] = { ...a };
    }

    // ============================
    //  CANCELAR EDICIÓN
    // ============================
    cancelarEdicion(a: Asignacion) {
        const b = this.backup[a.id];
        if (b) {
            a.fechaAsignacion = b.fechaAsignacion;
            a.fechaEntrega = b.fechaEntrega;
            a.estado = b.estado;
        }

        this.editando[a.id] = false;
    }

    // ============================
    //  GUARDAR EDICIÓN
    // ============================
    guardarFila(a: Asignacion) {
        this.editando[a.id] = false;
        delete this.backup[a.id];
    }

    // ============================
    //  ELIMINAR REGISTRO
    // ============================
    eliminar(a: Asignacion) {
        if (!confirm(`¿Eliminar asignación ${a.pir}?`)) return;

        this.asignaciones = this.asignaciones.filter(x => x.id !== a.id);
    }

    // ============================
    //  IMPRIMIR
    // ============================
    imprimir() {
        window.print();
    }

    // ============================
    //  DESCARGAR PDF (simple)
    // ============================
    descargarPDF() {
        const contenido = document.querySelector('.detalle-container')?.innerHTML;

        const ventana = window.open('', '_blank', 'width=800,height=600');

        ventana!.document.write(`
        <html>
        <head>
            <title>Asignaciones - ${this.empresa.nombre}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    border: 1px solid black;
                    padding: 6px;
                    text-align: center;
                }

                h2 {
                    margin-bottom: 15px;
                }
            </style>
        </head>
        <body>
            <h2>Asignaciones — ${this.empresa.nombre}</h2>
            ${contenido}
        </body>
        </html>
    `);

        ventana!.document.close();
        ventana!.print();
    }

}
