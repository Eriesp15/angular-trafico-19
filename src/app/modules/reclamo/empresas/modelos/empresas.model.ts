export type TipoEmpresa = 'Transporte' | 'Reparación' | 'Limpieza';

export interface Tipo {
    id: string;
    nombre: TipoEmpresa | string;
    activo: boolean;
}

export interface Empresa {
    id: string;
    tipoId: string;
    nombre: string;
    telefono: string;
    email: string;
    razonSocial: string;
    direccion: string;
    activo: boolean;
}

export type EstadoAsignacion = 'Pendiente' | 'Entregado';

export interface Asignacion {
    id: string;
    empresaId: string;
    tipoReclamo: 'DPR' | 'AHL' | 'PIL' | 'OHD';
    pir: string; // PIR00....
    pasajero: string;
    fechaAsignacion: string; // ISO yyyy-MM-dd
    fechaEntrega?: string;   // ISO
    estado: EstadoAsignacion;
}
