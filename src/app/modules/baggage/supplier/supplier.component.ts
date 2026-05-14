import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListSupplierComponent } from './list-supplier/list-supplier.component';
import {
    ApiCompaniesService,
    Company,
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
            this.menuEmpresaAbierto = null;
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
    menuEmpresaAbierto: Company | null = null;

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

    toggleMenuEmpresa(company: Company): void {
        this.menuEmpresaAbierto =
            this.menuEmpresaAbierto?.id === company.id ? null : company;
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
        this.menuEmpresaAbierto = null;
    }

    guardarEmpresa(): void {
        const body = {
            serviceTypeId: this.formEmpresa.serviceTypeId.trim(),
            name: this.formEmpresa.name.trim(),
            phone: this.formEmpresa.phone.trim(),
            email: this.formEmpresa.email.trim(),
            address: this.formEmpresa.address.trim(),
            businessName: this.formEmpresa.businessName.trim(),
        };

        this.limpiarErroresEmpresa();

        let hayErrores = false;

        if (!body.serviceTypeId) {
            this.empresaFieldErrors.serviceTypeId = 'No se encontró el tipo seleccionado.';
            hayErrores = true;
        }

        if (!body.name) {
            this.empresaFieldErrors.name = 'Debes ingresar el nombre de la empresa.';
            hayErrores = true;
        }

        if (!body.businessName) {
            this.empresaFieldErrors.businessName = 'Debes ingresar la razón social.';
            hayErrores = true;
        }

        if (!body.phone) {
            this.empresaFieldErrors.phone = 'Debes ingresar el teléfono.';
            hayErrores = true;
        }

        if (!body.email) {
            this.empresaFieldErrors.email = 'Debes ingresar el email.';
            hayErrores = true;
        }

        if (!body.address) {
            this.empresaFieldErrors.address = 'Debes ingresar la dirección.';
            hayErrores = true;
        }

        if (hayErrores) return;

        if (this.editarEmpresaData) {
            this.companiesApi.updateCompany(this.editarEmpresaData.id, body).subscribe({
                next: () => {
                    this.resetFormEmpresa();
                    this.cargarTodo();
                },
                error: (err) => {
                    console.error('Error actualizando empresa', err);

                    if (err.status === 409) {
                        this.empresaError = 'Ya existe una empresa con ese nombre para ese tipo.';
                        return;
                    }

                    this.empresaError = 'No se pudo actualizar la empresa.';
                },
            });
        } else {
            this.companiesApi.createCompany({
                ...body,
                isActive: true,
            }).subscribe({
                next: () => {
                    this.resetFormEmpresa();
                    this.cargarTodo();
                },
                error: (err) => {
                    console.error('Error creando empresa', err);

                    if (err.status === 409) {
                        this.empresaError = 'Ya existe una empresa con ese nombre para ese tipo.';
                        return;
                    }

                    this.empresaError = 'No se pudo registrar la empresa.';
                },
            });
        }
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
        this.fechaEntrega = '';
        this.modalAsignar = true;
    }

    cerrarAsignar(): void {
        this.modalAsignar = false;
        this.pirSeleccionados = [];
        this.pirBuscar = '';
        this.fechaEntrega = '';
        this.empresaAsignar = null;
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
