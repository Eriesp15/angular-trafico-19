import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListSupplierComponent } from './list-supplier/list-supplier.component';

export enum EstadoAsignacion {
    Pendiente = 'Pendiente',
    Entregado = 'Entregado'
}

export interface Empresa {
    id: string;
    tipo: string;
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    razon?: string;
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
    selector: 'app-supplier',
    standalone: true,
    imports: [CommonModule, FormsModule, ListSupplierComponent],
    templateUrl: './supplier.component.html',
    styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent {
    constructor() {
        document.addEventListener('click', () => {
            this.menuEmpresaAbierto = null;
            this.menuTipoAbierto = null;
        });
    }
    detenerPropagacion(event: Event) {
        event.stopPropagation();
    }

    // =============================================
    //                VARIABLES BASE
    // =============================================

    vista: 'lista' | 'detalle' = 'lista';

    empresas: Empresa[] = [];

    asignaciones: Asignacion[] = [];

    empresaSel: Empresa | null = null;

    tiposEmpresa: string[] = ['Transporte', 'Reparación'];


    // =============================================
    //            MENÚ DE TRES PUNTITOS
    // =============================================

    menuTipoAbierto: string | null = null;
    menuEmpresaAbierto: Empresa | null = null;

    toggleMenuTipo(tipo: string) {
        this.menuTipoAbierto = this.menuTipoAbierto === tipo ? null : tipo;
    }

    toggleMenuEmpresa(e: Empresa) {
        this.menuEmpresaAbierto = this.menuEmpresaAbierto === e ? null : e;
    }


    // =============================================
    //              CREAR / EDITAR TIPO
    // =============================================

    modalTipo = false;
    nuevoTipo = '';
    editarTipoSeleccionado: string | null = null;

    agregarTipo() {
        if (!this.nuevoTipo.trim()) return;

        // Si se está editando
        if (this.editarTipoSeleccionado) {
            const index = this.tiposEmpresa.indexOf(this.editarTipoSeleccionado);
            if (index >= 0) {
                this.tiposEmpresa[index] = this.nuevoTipo.trim();

                // Actualizar empresas que usen este tipo
                this.empresas.forEach(e => {
                    if (e.tipo === this.editarTipoSeleccionado) {
                        e.tipo = this.nuevoTipo.trim();
                    }
                });
            }
            this.editarTipoSeleccionado = null;
        } else {
            // Modo crear
            this.tiposEmpresa.push(this.nuevoTipo.trim());
        }

        this.nuevoTipo = '';
        this.modalTipo = false;
    }

    editarTipo(tipo: string) {
        this.editarTipoSeleccionado = tipo;
        this.nuevoTipo = tipo;
        this.modalTipo = true;
        this.menuTipoAbierto = null;
    }

    eliminarTipo(tipo: string) {
        if (!confirm(`¿Eliminar tipo "${tipo}" y todas sus empresas?`)) return;

        this.tiposEmpresa = this.tiposEmpresa.filter(t => t !== tipo);
        this.empresas = this.empresas.filter(e => e.tipo !== tipo);

        this.menuTipoAbierto = null;
    }


    // =============================================
    //              CREAR / EDITAR EMPRESA
    // =============================================

    modalCrear = false;

    formEmpresa = {
        tipo: '',
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        razon: ''
    };

    editarEmpresaData: Empresa | null = null;

    abrirCrearEmpresa(tipo: string) {
        this.formEmpresa.tipo = tipo;
        this.editarEmpresaData = null; // modo crear
        this.modalCrear = true;
    }

    editarEmpresa(e: Empresa) {
        this.editarEmpresaData = e;

        this.formEmpresa = {
            tipo: e.tipo,
            nombre: e.nombre,
            telefono: e.telefono,
            email: e.email,
            direccion: e.direccion,
            razon: e.razon ?? ''
        };

        this.modalCrear = true;
        this.menuEmpresaAbierto = null;
    }

    guardarEmpresa() {
        if (this.editarEmpresaData) {
            // EDITAR
            this.editarEmpresaData.nombre = this.formEmpresa.nombre;
            this.editarEmpresaData.telefono = this.formEmpresa.telefono;
            this.editarEmpresaData.email = this.formEmpresa.email;
            this.editarEmpresaData.direccion = this.formEmpresa.direccion;
            this.editarEmpresaData.razon = this.formEmpresa.razon;

            this.editarEmpresaData = null;
        } else {
            // CREAR
            const nueva: Empresa = {
                id: Date.now().toString(),
                activo: true,
                ...this.formEmpresa
            };

            this.empresas.push(nueva);
        }

        // Reiniciar
        this.formEmpresa = {
            tipo: '',
            nombre: '',
            telefono: '',
            email: '',
            direccion: '',
            razon: ''
        };

        this.modalCrear = false;
    }


    // =============================================
    //              NAVEGAR ENTRE VISTAS
    // =============================================

    verDetalle(e: Empresa) {
        this.empresaSel = e;
        this.vista = 'detalle';
    }

    volver() {
        this.empresaSel = null;
        this.vista = 'lista';
    }


    // =============================================
    //              ACTIVAR / DESACTIVAR
    // =============================================

    cambiarEstado(e: Empresa) {
        e.activo = !e.activo;
    }


    // =============================================
    //              FILTRAR EMPRESAS POR TIPO
    // =============================================

    getEmpresasPorTipo(tipo: string) {
        return this.empresas.filter(e => e.tipo === tipo);
    }


    // =============================================
    //              ASIGNAR PIR
    // =============================================

    modalAsignar = false;
    empresaAsignar: Empresa | null = null;

    pirBuscar = '';
    pirSeleccionados: string[] = [];
    fechaEntrega = '';

    pirLista = [
        'CBBO1315449', 'CBBO1315450', 'CBBO1315451',
        'LPZ778899', 'VVI112233', 'VVI889900'
    ];

    get pirYaAsignadosPorTipo() {
        if (!this.empresaAsignar) return [];

        const tipo = this.empresaAsignar.tipo;

        return this.asignaciones
            .filter(a => this.empresas.find(e => e.id === a.empresaId)?.tipo === tipo)
            .map(a => a.pir);
    }

    get pirFiltrado() {
        return this.pirLista
            .filter(p => p.toUpperCase().includes(this.pirBuscar.toUpperCase()))
            .filter(p => !this.pirYaAsignadosPorTipo.includes(p))
            .filter(p => !this.pirSeleccionados.includes(p));
    }

    abrirAsignar(e: Empresa) {
        this.empresaAsignar = e;
        this.pirSeleccionados = [];
        this.pirBuscar = '';
        this.fechaEntrega = '';
        this.modalAsignar = true;
    }

    cerrarAsignar() {
        this.modalAsignar = false;
        this.pirSeleccionados = [];
        this.pirBuscar = '';
        this.fechaEntrega = '';
        this.empresaAsignar = null;
    }

    addPIR(p: string) {
        if (!this.pirSeleccionados.includes(p)) {
            this.pirSeleccionados.push(p);
        }
    }

    removePIR(p: string) {
        this.pirSeleccionados = this.pirSeleccionados.filter(x => x !== p);
    }

    guardarAsignaciones() {
        if (!this.empresaAsignar) return;

        const nuevas = this.pirSeleccionados.map(p => ({
            id: Date.now().toString() + Math.random(),
            pir: p,
            empresaId: this.empresaAsignar!.id,
            fechaAsignacion: new Date().toISOString().slice(0, 10),
            fechaEntrega: this.fechaEntrega || null,
            estado: EstadoAsignacion.Pendiente
        }));

        this.asignaciones.push(...nuevas);

        this.cerrarAsignar();
    }

}
