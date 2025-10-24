import { Injectable, computed, signal } from '@angular/core';
import { Asignacion, Empresa, EstadoAsignacion, Tipo } from '../modelos/empresas.model';

const uid = () => Math.random().toString(36).slice(2, 10);

@Injectable({ providedIn: 'root' })
export class EmpresasService {

    // --- Datos base (mock) ---
    private _tipos = signal<Tipo[]>([
        { id: uid(), nombre: 'Transporte',  activo: true },
        { id: uid(), nombre: 'Reparación',  activo: true },
    ]);

    private _empresas = signal<Empresa[]>([
        {
            id: uid(), tipoId: () => this._tipos()[0].id, nombre: 'TransBolivia',
            telefono: '70123456', email: 'info@transbolivia.com',
            razonSocial: 'Transportadora Bolivia', direccion: 'Av. los Angeles N 965', activo: true,
        } as any,
        {
            id: uid(), tipoId: () => this._tipos()[0].id, nombre: 'TransCochabamba',
            telefono: '63878787', email: 'info@transcochabamba.com',
            razonSocial: 'Transportadora Cochabamba', direccion: 'Av. Blanco Galindo N 965', activo: false,
        } as any,
        {
            id: uid(), tipoId: () => this._tipos()[1].id, nombre: 'ReparaYa',
            telefono: '65875552', email: 'info@reparaya.com',
            razonSocial: 'Reparación', direccion: 'Calle Camaro N 657', activo: true,
        } as any,
    ].map(e => ({ ...e, tipoId: typeof e.tipoId === 'function' ? (e as any).tipoId() : e.tipoId })));

    private _asignaciones = signal<Asignacion[]>([
        {
            id: uid(), empresaId: this._empresas()[2].id, tipoReclamo: 'DPR',
            pir: 'PIR001234', pasajero: 'Juan Alberto Pérez Lopez',
            fechaAsignacion: '2025-01-15', fechaEntrega: '2025-01-20',
            estado: EstadoAsignacion.Entregado,
        },
        {
            id: uid(), empresaId: this._empresas()[2].id, tipoReclamo: 'DPR',
            pir: 'PIR001236', pasajero: 'Ana Maria Mamani Quiroga',
            fechaAsignacion: '2025-10-11',
            estado: EstadoAsignacion.Pendiente,
        },
    ]);

    // --- Getters de lectura ---
    tipos = () => this._tipos();
    empresas = () => this._empresas();
    empresasPorTipo = computed(() => {
        const map: Record<string, Empresa[]> = {};
        for (const t of this._tipos()) map[t.id] = [];
        for (const e of this._empresas()) (map[e.tipoId] ??= []).push(e);
        return map;
    });

    asignacionesPorEmpresa(empresaId: string) {
        return this._asignaciones().filter(a => a.empresaId === empresaId);
    }

    // --- Acciones ---
    crearTipo(nombre: string) {
        this._tipos.update(arr => [...arr, { id: uid(), nombre, activo: true }]);
    }

    crearEmpresa(e: Omit<Empresa, 'id'>) {
        this._empresas.update(arr => [...arr, { ...e, id: uid() }]);
    }

    cambiarEstadoEmpresa(e: Empresa, activo: boolean) {
        this._empresas.update(arr => arr.map(x => x.id === e.id ? { ...x, activo } : x));
    }

    toggleEstadoAsignacion(id: string) {
        this._asignaciones.update(arr =>
            arr.map(a => a.id === id
                ? { ...a, estado: a.estado === EstadoAsignacion.Pendiente ? EstadoAsignacion.Entregado : EstadoAsignacion.Pendiente }
                : a
            )
        );
    }

    eliminarAsignacion(id: string) {
        this._asignaciones.update(arr => arr.filter(a => a.id !== id));
    }
    cambiarEstadoAsignacion(id: string, nuevo: EstadoAsignacion) {
        this._asignaciones.update(arr =>
            arr.map(a => a.id === id ? { ...a, estado: nuevo } : a)
        );
    }
}
