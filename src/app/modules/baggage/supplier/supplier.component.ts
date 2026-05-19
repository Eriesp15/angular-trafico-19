import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ListSupplierComponent } from './list-supplier/list-supplier.component';
import {
    ApiCompaniesService,
    Company,
    ServiceType,
    AvailableClaim,
    CompanyAssignment,
} from '../services/api-companies.service';

export enum EstadoAsignacion {
    Pendiente = 'Pendiente',
    Entregado = 'Entregado',
    Recibido = 'Recibido',
}

export interface Asignacion {
    id: string;
    empresaId: string;
    pir: string;
    pasajero?: string;
    pirId?: string;
    claimId?: string;
    claimData?: any;
    fechaAsignacion: string;
    fechaEntrega: string | null;
    fechaRecepcion: string | null;
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

    pirLista: string[] = [];
    reclamosDisponibles: AvailableClaim[] = [];
    cargandoPirs = false;

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
        this.cargarAsignacionesEmpresa(company.id);
    }
    cargarAsignacionesEmpresa(companyId: string): void {
        this.companiesApi.getAssignmentsByCompany(companyId).subscribe({
            next: (assignments: CompanyAssignment[]) => {
                this.asignaciones = assignments.map((a) => ({
                    id: a.id,
                    empresaId: a.companyId,
                    pir: a.claim?.pir?.pirNumber ?? '',
                    pasajero: [
                        a.claim?.pir?.passengerName,
                        a.claim?.pir?.passengerLastName,
                    ]
                        .filter(Boolean)
                        .join(' '),
                    pirId: a.claim?.pir?.id,
                    claimId: a.claim?.id,
                    claimData: a.claim,
                    fechaAsignacion: a.assignmentDate?.slice(0, 10),
                    fechaEntrega: a.deliveryDate ? a.deliveryDate.slice(0, 10) : null,
                    fechaRecepcion: a.returnDate ? a.returnDate.slice(0, 10) : null,
                    estado:
                        a.status === 'RECEIVED'
                            ? EstadoAsignacion.Recibido
                            : a.status === 'DELIVERED'
                                ? EstadoAsignacion.Entregado
                                : EstadoAsignacion.Pendiente,
                }));
            },
            error: (err) => {
                console.error('Error cargando asignaciones de empresa', err);
                this.asignaciones = [];
            },
        });
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
        this.pirLista = [];
        this.reclamosDisponibles = [];
        this.fechaEntrega = '';

        this.modalAsignar = true;
        this.cargarPirsDisponibles(company.serviceTypeId);
    }
    cargarPirsDisponibles(serviceTypeId: string): void {
        this.cargandoPirs = true;

        this.companiesApi.getAvailableClaimsForCompany(serviceTypeId).subscribe({
            next: (claims) => {
                this.reclamosDisponibles = claims;

                this.pirLista = claims
                    .map((claim) => claim.pir?.pirNumber)
                    .filter((pir): pir is string => !!pir);

                this.cargandoPirs = false;
            },
            error: (err) => {
                console.error('Error cargando PIR disponibles', err);
                this.pirLista = [];
                this.reclamosDisponibles = [];
                this.cargandoPirs = false;
            },
        });
    }
    getClaimByPir(pir: string): AvailableClaim | undefined {
        return this.reclamosDisponibles.find(
            (claim) => claim.pir?.pirNumber === pir
        );
    }

    getPirLabel(pir: string): string {
        const claim = this.getClaimByPir(pir);
        const datosPir = claim?.pir;

        const pasajero = [
            datosPir?.passengerName,
            datosPir?.passengerLastName,
        ]
            .filter(Boolean)
            .join(' ');

        return [
            pir,
            pasajero,
            datosPir?.claimType,
            claim?.claimStatus,
        ]
            .filter(Boolean)
            .join(' — ');
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

        if (this.pirSeleccionados.length === 0) {
            return;
        }

        const claimsSeleccionados = this.pirSeleccionados
            .map((pir) => this.getClaimByPir(pir))
            .filter((claim): claim is AvailableClaim => !!claim);

        const requests = claimsSeleccionados.map((claim) =>
            this.companiesApi.createCompanyAssignment({
                companyId: this.empresaAsignar!.id,
                claimId: claim.id,
                deliveryDate: null,
                notes: 'Asignación desde módulo empresas',
            })
        );

        forkJoin(requests).subscribe({
            next: () => {
                const nuevas: Asignacion[] = claimsSeleccionados.map((claim) => ({
                    id: claim.id,
                    pir: claim.pir?.pirNumber ?? '',
                    empresaId: this.empresaAsignar!.id,
                    fechaAsignacion: new Date().toISOString().slice(0, 10),
                    fechaEntrega: null,
                    fechaRecepcion: null,
                    estado: EstadoAsignacion.Pendiente,
                }));

                this.asignaciones.push(...nuevas);

                this.cerrarAsignar();
            },
            error: (err) => {
                console.error('Error guardando asignaciones', err);

                if (err.status === 409) {
                    alert('Uno de los PIR ya fue asignado a una empresa de este mismo tipo.');
                    return;
                }

                alert('No se pudo guardar la asignación.');
            },
        });
    }
}
