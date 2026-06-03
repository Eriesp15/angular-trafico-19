import { Component, OnInit, inject } from '@angular/core';
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
    Entregado = 'Entregado',
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
    styleUrls: ['./supplier.component.scss'],
})
export class SupplierComponent implements OnInit {
    private companiesApi = inject(ApiCompaniesService);

    constructor() {
        document.addEventListener('click', () => {
            this.menuTipoAbierto = null;
        });
    }

    detenerPropagacion(event: Event): void {
        event.stopPropagation();
    }

    vista: 'lista' | 'detalle' = 'lista';

    companies: Company[] = [];
    serviceTypes: ServiceType[] = [];

    // Temporal hasta tener backend de assignments
    asignaciones: Asignacion[] = [];
    empresaSel: Company | null = null;

    loading = false;

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
    availableUsers: { id: string; name: string; email: string; phone?: string }[] = [];
    selectedPersonnelId = '';
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
            this.companiesApi.updateServiceType(this.editarTipoSeleccionado.id, {
                name: nombre,
            }).subscribe({
                next: () => {
                    this.nuevoTipo = '';
                    this.editarTipoSeleccionado = null;
                    this.modalTipo = false;
                    this.cargarTodo();
                },
                error: (err) => {
                    console.error('Error actualizando tipo', err);

                    if (err.status === 409) {
                        this.tipoError = 'Ya existe otro tipo de servicio con ese nombre.';
                        return;
                    }

                    this.tipoError = 'No se pudo actualizar el tipo.';
                },
            });
        } else {
            this.companiesApi.createServiceType({
                name: nombre,
                isActive: true,
            }).subscribe({
                next: () => {
                    this.nuevoTipo = '';
                    this.modalTipo = false;
                    this.cargarTodo();
                },
                error: (err) => {
                    console.error('Error creando tipo', err);

                    if (err.status === 409) {
                        this.tipoError = 'Ya existe un tipo de servicio con ese nombre.';
                        return;
                    }

                    this.tipoError = 'No se pudo crear el tipo.';
                },
            });
        }
    }

    editarTipo(tipo: ServiceType): void {
        this.limpiarErroresTipo();
        this.editarTipoSeleccionado = tipo;
        this.nuevoTipo = tipo.name;
        this.modalTipo = true;
        this.menuTipoAbierto = null;
    }

    cambiarEstadoTipo(tipo: ServiceType): void {
        this.companiesApi.updateServiceTypeStatus(tipo.id, !tipo.isActive).subscribe({
            next: () => this.cargarTodo(),
            error: (err) => console.error('Error cambiando estado tipo', err),
        });
    }

    // =========================
    // EMPRESAS
    // =========================
    abrirCrearEmpresa(serviceTypeId: string): void {
        this.limpiarErroresEmpresa();

        this.formEmpresa = {
            serviceTypeId,
            name: '',
            phone: '',
            email: '',
            address: '',
            businessName: '',
        };

        this.editarEmpresaData = null;
        this.modalCrear = true;
    }

    editarEmpresa(company: Company): void {
        this.limpiarErroresEmpresa();

        this.editarEmpresaData = company;

        this.formEmpresa = {
            serviceTypeId: company.serviceTypeId,
            name: company.name,
            phone: company.phone,
            email: company.email,
            address: company.address,
            businessName: company.businessName,
        };

        this.modalCrear = true;
    }

    resetFormEmpresa(): void {
        this.formEmpresa = {
            serviceTypeId: '',
            name: '',
            phone: '',
            email: '',
            address: '',
            businessName: '',
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
        this.selectedPersonnelId = '';
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
        if (!this.modalUsersEmpresa || !this.selectedPersonnelId) return;

        this.companiesApi.addCompanyUser(this.modalUsersEmpresa.id, this.selectedPersonnelId).subscribe({
            next: () => {
                this.selectedPersonnelId = '';
                this.userSearch = '';
                this.cargarUsuariosEmpresa(this.modalUsersEmpresa!.id);
                this.cargarUsuariosDisponibles(this.modalUsersEmpresa!.id);
            },
            error: (err) => {
                console.error('Error agregando usuario', err);
            },
        });
    }

    eliminarUsuario(personnelId: string): void {
        if (!this.modalUsersEmpresa) return;

        this.companiesApi.removeCompanyUser(this.modalUsersEmpresa.id, personnelId).subscribe({
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

    volver(): void {
        this.empresaSel = null;
        this.vista = 'lista';
    }

    cambiarEstado(company: Company): void {
        this.companiesApi
            .updateCompanyStatus(company.id, !company.isActive)
            .subscribe({
                next: () => this.cargarTodo(),
                error: (err) => console.error('Error cambiando estado empresa', err),
            });
    }

    getEmpresasPorTipo(serviceTypeId: string): Company[] {
        return this.companies.filter(
            (company) => company.serviceTypeId === serviceTypeId
        );
    }

    // =========================
    // ASIGNACIONES
    // =========================
    // Temporal: sigue local hasta tener backend de CompanyAssignment
    get pirYaAsignadosPorTipo(): string[] {
        if (!this.empresaAsignar) return [];

        const serviceTypeId = this.empresaAsignar.serviceTypeId;

        return this.asignaciones
            .filter(
                (a) =>
                    this.companies.find((e) => e.id === a.empresaId)?.serviceTypeId ===
                    serviceTypeId
            )
            .map((a) => a.pir);
    }

    get pirFiltrado(): string[] {
        return this.pirLista
            .filter((p) => p.toUpperCase().includes(this.pirBuscar.toUpperCase()))
            .filter((p) => !this.pirYaAsignadosPorTipo.includes(p))
            .filter((p) => !this.pirSeleccionados.includes(p));
    }

    abrirAsignar(company: Company): void {
        this.empresaAsignar = company;
        this.pirSeleccionados = [];
        this.pirBuscar = '';

        const nombreTipo =
            company.serviceType?.name?.toLowerCase() || '';

        // SOLO para empresas de reparación
        if (nombreTipo.includes('repar')) {
            this.fechaEntrega = this.getFechaHabilMas5();
        } else {
            this.fechaEntrega = '';
        }

        this.modalAsignar = true;
    }

    cerrarAsignar(): void {
        this.modalAsignar = false;
        this.pirSeleccionados = [];
        this.pirBuscar = '';
        this.fechaEntrega = '';
        this.empresaAsignar = null;
    }

    getFechaHabilMas5(): string {
        const fecha = new Date();
        let dias = 0;

        while (dias < 5) {
            fecha.setDate(fecha.getDate() + 1);

            const dia = fecha.getDay();

            // 0 domingo, 6 sábado
            if (dia !== 0 && dia !== 6) {
                dias++;
            }
        }

        return fecha.toISOString().slice(0, 10);
    }

    addPIR(pir: string): void {
        if (!this.pirSeleccionados.includes(pir)) {
            this.pirSeleccionados.push(pir);
        }
    }

    removePIR(pir: string): void {
        this.pirSeleccionados = this.pirSeleccionados.filter((x) => x !== pir);
    }

    guardarAsignaciones(): void {
        if (!this.empresaAsignar) return;

        const nuevas: Asignacion[] = this.pirSeleccionados.map((pir) => ({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            pir,
            empresaId: this.empresaAsignar!.id,
            fechaAsignacion: new Date().toISOString().slice(0, 10),
            fechaEntrega: this.fechaEntrega || null,
            estado: EstadoAsignacion.Pendiente,
        }));

        this.asignaciones.push(...nuevas);
        this.cerrarAsignar();
    }
}
