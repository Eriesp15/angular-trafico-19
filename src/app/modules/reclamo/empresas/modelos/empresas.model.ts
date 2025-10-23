export enum EstadoAsignacion {
    Pendiente = 'Pendiente',
    Entregado = 'Entregado',
}

export interface Tipo {
    id: string;
    nombre: string;
    activo: boolean; // <- lo pide tu servicio
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

export interface Asignacion {
    id: string;
    empresaId: string;
    tipoReclamo: 'DPR' | 'AHL' | 'PIL' | 'OHD';
    pir: string;
    pasajero: string;
    fechaAsignacion: string; // ISO yyyy-MM-dd
    fechaEntrega?: string;   // ISO yyyy-MM-dd
    estado: EstadoAsignacion;
}
