import { Injectable, signal, computed } from '@angular/core';
import { Asignacion, Empresa, EstadoAsignacion, Tipo } from '../modelos/empresas.model';

function uid() { return crypto.randomUUID(); }
function hoyISO() { return new Date().toISOString().slice(0,10); }

@Injectable({ providedIn: 'root' })
export class EmpresasService {
    // Tipos
    private _tipos = signal<Tipo[]>([
        { id: uid(), nombre: 'Transporte', activo: true },
        { id: uid(), nombre: 'Reparación', activo: true },
    ]);

    // Empresas
    private _empresas = signal<Empresa[]>([
        { id: uid(), tipoId: this._tipos()[0].id, nombre: 'TransBolivia', telefono:'70123456', email:'info@transbolivia.com', razonSocial:'Transportadora Bolivia', direccion:'Av. los Angeles N 965', activo:true },
        { id: uid(), tipoId: this._tipos()[0].id, nombre: 'TransCochabamba', telefono:'63878787', email:'info@transcochabamba.com', razonSocial:'Transportadora Cochabamba', direccion:'Av. Blanco Galindo N 965', activo:false },
        { id: uid(), tipoId: this._tipos()[1].id, nombre: 'ReparaYa', telefono:'65875552', email:'info@reparaya.com', razonSocial:'Reparacion', direccion:'Calle Camaro N 657', activo:true },
    ]);

    // Asignaciones
    private _asignaciones = signal<Asignacion[]>([
        { id: uid(), empresaId: '', tipoReclamo:'DPR', pir:'PIR001234', pasajero:'Juan Alberto Pérez Lopez', fechaAsignacion: '2025-01-15', fechaEntrega:'2025-01-20', estado:'Entregado' },
    ]);

    // Sugerencias de PIR abiertos (mock)
    private _pirsAbiertos = signal<string[]>(['PIR001234','PIR001235','PIR001236','PIR001500','PIR002000']);

    // Computados
    tipos = computed(() => this._tipos());
    empresas = computed(() => this._empresas());
    empresasPorTipo = computed(() => {
        const map: Record<string, Empresa[]> = {};
        for (const t of this._tipos()) map[t.id] = this._empresas().filter(e => e.tipoId === t.id);
        return map;
    });

    asignacionesPorEmpresa(id: string) {
        return this._asignaciones().filter(a => a.empresaId === id);
    }

    // CRUD Tipos
    crearTipo(nombre: string) {
        this._tipos.update(arr => [...arr, { id: uid(), nombre, activo:true }]);
    }

    // CRUD Empresas
    crearEmpresa(e: Omit<Empresa, 'id'|'activo'> & { activo?: boolean }) {
        this._empresas.update(arr => [...arr, { id: uid(), activo: e.activo ?? true, ...e }]);
    }

    toggleEmpresaActiva(id: string, value: boolean) {
        this._empresas.update(arr => arr.map(e => e.id === id ? { ...e, activo:value } : e));
    }

    // Asignaciones
    crearAsignacion(a: Omit<Asignacion, 'id'|'estado'|'fechaAsignacion'> & { fechaAsignacion?: string, estado?: EstadoAsignacion }) {
        const registro: Asignacion = { id: uid(), estado: a.estado ?? 'Pendiente', fechaAsignacion: a.fechaAsignacion ?? hoyISO(), ...a };
        this._asignaciones.update(arr => [...arr, registro]);
    }

    cambiarEstadoAsignacion(id: string, nuevo: EstadoAsignacion) {
        this._asignaciones.update(arr => arr.map(a => a.id === id ? { ...a, estado:nuevo } : a));
    }

    eliminarAsignacion(id: string) {
        this._asignaciones.update(arr => arr.filter(a => a.id !== id));
    }

    // PIR sugerencias
    sugerirPIR(q: string) {
        return this._pirsAbiertos().filter(p => p.toLowerCase().includes(q.toLowerCase()));
    }
}
