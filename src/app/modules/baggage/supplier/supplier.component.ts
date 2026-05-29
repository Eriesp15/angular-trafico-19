import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListSupplierComponent } from './list-supplier/list-supplier.component';
import {
    ApiCompaniesService,
    Company,
    CompanyUser,
    ServiceType,
} from '../services/api-companies.service';

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

    modalTipo = false;
    nuevoTipo = '';
    editarTipoSeleccionado: ServiceType | null = null;

    modalCrear = false;

    formEmpresa = {
        serviceTypeId: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        businessName: '',
    };

    editarEmpresaData: Company | null = null;

    // User management
    modalUsers = false;
    modalUsersEmpresa: Company | null = null;
    companyUsers: CompanyUser[] = [];
    availableUsers: { id: string; name: string; email: string; role: string; phone?: string }[] = [];
    selectedUserId = '';
    userLoading = false;
    userSearch = '';

    // New user form
    newUserName = '';
    newUserEmail = '';
    newUserPhone = '';
    userCreateError = '';

    modalAsignar = false;
    empresaAsignar: Company | null = null;

    pirBuscar = '';
    pirSeleccionados: string[] = [];
    fechaEntrega = '';

    pirLista: string[] = [
        'CBBO1315449',
        'CBBO1315450',
        'CBBO1315451',
        'LPZ778899',
        'VVI112233',
        'VVI889900',
    ];

    tipoError = '';

    empresaError = '';
    empresaFieldErrors = {
        serviceTypeId: '',
        name: '',
        businessName: '',
        phone: '',
        email: '',
        address: '',
    };

    ngOnInit(): void {
        this.cargarTodo();
    }

    cargarTodo(): void {
        this.loading = true;

        this.companiesApi.getServiceTypes().subscribe({
            next: (types: ServiceType[]) => {
                this.serviceTypes = types;

                this.companiesApi.getCompanies().subscribe({
                    next: (companies: Company[]) => {
                        this.companies = companies;
                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('Error cargando companies', err);
                        this.loading = false;
                    },
                });
            },
            error: (err) => {
                console.error('Error cargando service types', err);
                this.loading = false;
            },
        });
    }

    toggleMenuTipo(tipoId: string): void {
        this.menuTipoAbierto = this.menuTipoAbierto === tipoId ? null : tipoId;
    }

    limpiarErroresTipo(): void {
        this.tipoError = '';
    }

    limpiarErroresEmpresa(): void {
        this.empresaError = '';
        this.empresaFieldErrors = {
            serviceTypeId: '',
            name: '',
            businessName: '',
            phone: '',
            email: '',
            address: '',
        };
    }

    // =========================
    // TIPOS DE SERVICIO
    // =========================
    agregarTipo(): void {
        const nombre = this.nuevoTipo.trim();
        this.limpiarErroresTipo();

        if (!nombre) {
            this.tipoError = 'Debes ingresar un nombre para el tipo.';
            return;
        }

        const yaExiste = this.serviceTypes.some(
            (t) =>
                t.name.trim().toLowerCase() === nombre.toLowerCase() &&
                (!this.editarTipoSeleccionado || t.id !== this.editarTipoSeleccionado.id)
        );

        if (yaExiste) {
            this.tipoError = 'Ya existe un tipo de servicio con ese nombre.';
            return;
        }

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
    }

    resetFormEmpresa(): void {
        this.formEmpresa = {
            tipo: '',
            nombre: '',
            telefono: '',
            email: '',
            direccion: '',
            razon: ''
        };
        this.editarEmpresaData = null;
        this.modalCrear = false;
        this.limpiarErroresEmpresa();
    }

    abrirModalUsuarios(company: Company): void {
        this.modalUsersEmpresa = company;
        this.modalUsers = true;
        this.companyUsers = [];
        this.availableUsers = [];
        this.selectedUserId = '';
        this.userSearch = '';
        this.newUserName = '';
        this.newUserEmail = '';
        this.newUserPhone = '';
        this.userCreateError = '';
        this.cargarUsuariosEmpresa(company.id);
        this.cargarUsuariosDisponibles(company.id);
    }

    cerrarModalUsuarios(): void {
        this.modalUsers = false;
        this.modalUsersEmpresa = null;
        this.cargarTodo();
    }

    cargarUsuariosEmpresa(companyId: string): void {
        this.userLoading = true;

        this.companiesApi.getCompanyUsers(companyId).subscribe({
            next: (users) => {
                this.companyUsers = users;
                this.userLoading = false;
            },
            error: (err) => {
                console.error('Error cargando usuarios', err);
                this.userLoading = false;
            },
        });
    }

    cargarUsuariosDisponibles(companyId: string): void {
        this.companiesApi.getAvailableUsers(companyId).subscribe({
            next: (users) => {
                this.availableUsers = users;
            },
            error: (err) => {
                console.error('Error cargando usuarios disponibles', err);
            },
        });
    }

    get filteredAvailableUsers() {
        if (!this.userSearch.trim()) return this.availableUsers;
        const term = this.userSearch.toLowerCase();
        return this.availableUsers.filter(
            (u) =>
                u.name.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term)
        );
    }

    agregarUsuario(): void {
        if (!this.modalUsersEmpresa || !this.selectedUserId) return;

        this.companiesApi.addCompanyUser(this.modalUsersEmpresa.id, this.selectedUserId).subscribe({
            next: () => {
                this.selectedUserId = '';
                this.userSearch = '';
                this.cargarUsuariosEmpresa(this.modalUsersEmpresa!.id);
                this.cargarUsuariosDisponibles(this.modalUsersEmpresa!.id);
            },
            error: (err) => {
                console.error('Error agregando usuario', err);
            },
        });
    }

    eliminarUsuario(userId: string): void {
        if (!this.modalUsersEmpresa) return;

        this.companiesApi.removeCompanyUser(this.modalUsersEmpresa.id, userId).subscribe({
            next: () => {
                this.cargarUsuariosEmpresa(this.modalUsersEmpresa!.id);
                this.cargarUsuariosDisponibles(this.modalUsersEmpresa!.id);
            },
            error: (err) => {
                console.error('Error eliminando usuario', err);
            },
        });
    }

    crearUsuario(): void {
        this.userCreateError = '';

        const name = this.newUserName.trim();
        const email = this.newUserEmail.trim();
        const phone = this.newUserPhone.trim();

        if (!name || !email) {
            this.userCreateError = 'Nombre y correo son obligatorios.';
            return;
        }

        if (!this.modalUsersEmpresa) return;

        this.companiesApi.createCompanyUser(this.modalUsersEmpresa.id, {
            name,
            email,
            phone: phone || undefined,
        }).subscribe({
            next: () => {
                this.newUserName = '';
                this.newUserEmail = '';
                this.newUserPhone = '';
                this.cargarUsuariosEmpresa(this.modalUsersEmpresa!.id);
                this.cargarUsuariosDisponibles(this.modalUsersEmpresa!.id);
            },
            error: (err) => {
                if (err.status === 400 || err.status === 409) {
                    const msg = err.error?.message || 'Error al crear usuario.';
                    this.userCreateError = Array.isArray(msg) ? msg[0] : msg;
                } else {
                    this.userCreateError = 'No se pudo crear el usuario.';
                }
            },
        });
    }

    getNombreTipoSeleccionado(): string {
        const tipo = this.serviceTypes.find(
            (t) => t.id === this.formEmpresa.serviceTypeId
        );

        return tipo?.name ?? '';
    }

    verDetalle(company: Company): void {
        this.empresaSel = company;
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
