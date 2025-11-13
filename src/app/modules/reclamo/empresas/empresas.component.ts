import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListaAsignacionesComponent } from './lista-asignaciones/lista-asignaciones.component';

export enum EstadoAsignacion { Pendiente = 'Pendiente', Entregado = 'Entregado' }

export interface Empresa {
    id: string;
    tipo: string;
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    activo: boolean;
}

export interface Asignacion {
    id: string;
    empresaId: string;
    pir: string;
    fechaAsignacion: string;
    fechaEntrega: string | null;
    estado: EstadoAsignacion;
}

@Component({
    selector: 'app-empresas',
    standalone: true,
    imports: [CommonModule, FormsModule, ListaAsignacionesComponent],
    templateUrl: './empresas.component.html',
    styleUrls: ['./empresas.component.scss'],
})
export class EmpresasComponent {
    EstadoAsignacion = EstadoAsignacion;
    vista = signal<'lista' | 'detalle'>('lista');
    empresaSel = signal<Empresa | null>(null);

    // Mock data
    empresas = signal<Empresa[]>([
        {
            id: '1',
            tipo: 'Transporte',
            nombre: 'LogiTrans',
            telefono: '78900011',
            email: 'contacto@logitrans.com',
            direccion: 'Av. Ayacucho 123',
            activo: true,
        },
        {
            id: '2',
            tipo: 'Reparación',
            nombre: 'ReparaYa',
            telefono: '65875552',
            email: 'soporte@reparaya.com',
            direccion: 'C. Lanza 456',
            activo: true,
        },
    ]);

    asignaciones = signal<Asignacion[]>([
        {
            id: 'a1',
            empresaId: '2',
            pir: 'CBBO1315449',
            fechaAsignacion: '2025-06-10',
            fechaEntrega: null,
            estado: EstadoAsignacion.Pendiente,
        },
    ]);

    verDetalle(e: Empresa) {
        this.empresaSel.set(e);
        this.vista.set('detalle');
    }

    volver() {
        this.vista.set('lista');
        this.empresaSel.set(null);
    }

    cambiarEstado(e: Empresa) {
        e.activo = !e.activo;
        this.empresas.set([...this.empresas()]);
    }

    abrirModalAgregar() {
        alert('Aquí iría tu modal de agregar empresa');
    }
}
