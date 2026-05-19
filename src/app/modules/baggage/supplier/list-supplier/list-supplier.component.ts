import {
    Component,
    Input,
    Output,
    EventEmitter,
    inject,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Asignacion, EstadoAsignacion } from '../supplier.component';
import { ApiCompaniesService, Company } from '../../services/api-companies.service';

import { ActionWizardComponent } from '../../claim/action-wizard/action-wizard.component';
import { ActionWizardService } from '../../claim/action-wizard/action-wizard.service';

import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector: 'app-list-supplier',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        ActionWizardComponent,
    ],
    templateUrl: './list-supplier.component.html',
    styleUrls: ['./list-supplier.component.scss'],
})
export class ListSupplierComponent implements OnInit, OnDestroy {
    @Input() empresa!: Company;
    @Input() asignaciones: Asignacion[] = [];

    @Output() volver = new EventEmitter<void>();
    @Output() refrescar = new EventEmitter<void>();

    private companiesApi = inject(ApiCompaniesService);
    private wizardService = inject(ActionWizardService);
    private userService = inject(UserService);

    private destroy$ = new Subject<void>();

    EstadoAsignacion = EstadoAsignacion;
    currentUserName = '';

    editando: { [id: string]: boolean } = {};
    backup: { [id: string]: Asignacion } = {};

    ngOnInit(): void {
        this.userService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe((user: User) => {
                this.currentUserName =
                    (user as any)?.name ||
                    (user as any)?.email ||
                    '';
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get asignacionesEmpresa(): Asignacion[] {
        if (!this.empresa) return [];

        return this.asignaciones.filter(
            (a) => a.empresaId === this.empresa.id
        );
    }

    // ============================
    // ACTION WIZARD - REPARACIÓN
    // ============================
    abrirWizardEntrega(a: Asignacion): void {
        if (a.fechaEntrega) {
            alert('Este PIR ya fue entregado a la reparadora.');
            return;
        }

        this.wizardService.open(
            'DELIVER_TO_REPAIR_COMPANY',
            this.buildPirDataForWizard(a),
            () => {
                this.refrescar.emit();
            }
        );
    }

    abrirWizardRecepcion(a: Asignacion): void {
        if (!a.fechaEntrega) {
            alert('Primero debes entregar el equipaje a la reparadora.');
            return;
        }

        if (a.fechaRecepcion) {
            alert('Este PIR ya fue recibido desde la reparadora.');
            return;
        }

        this.wizardService.open(
            'RECEIVE_FROM_REPAIR_COMPANY',
            this.buildPirDataForWizard(a),
            () => {
                this.refrescar.emit();
            }
        );
    }

    private buildPirDataForWizard(a: Asignacion): any {
        const claimData = (a as any).claimData || {};
        const pirData = claimData?.pir || {};

        const pirId =
            (a as any).pirId ||
            pirData?.id ||
            claimData?.pirId ||
            null;

        const claimId =
            (a as any).claimId ||
            claimData?.id ||
            null;

        return {
            ...claimData,
            ...pirData,

            id: pirId,
            pirId,
            claimId,

            pirNumber: a.pir || pirData?.pirNumber,
            passengerName: pirData?.passengerName,
            passengerLastName: pirData?.passengerLastName,
            claimType: pirData?.claimType,

            claim: claimData,

            loggedUserName: this.currentUserName,
            registeredBy: this.currentUserName,
            todayFlightDate: this.getNowDateTimeLocal(),
            estimatedReturnDateDefault: this.getDatePlusDaysLocal(5),
            sendWhatsappDefault: 'Sí',
        };
    }

    private getNowDateTimeLocal(): string {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }

    private getDatePlusDaysLocal(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() + days);

        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 10);
    }

    // ============================
    // EDICIÓN LOCAL
    // ============================
    editarFila(a: Asignacion): void {
        this.editando[a.id] = true;
        this.backup[a.id] = { ...a };
    }

    cancelarEdicion(a: Asignacion): void {
        const b = this.backup[a.id];

        if (b) {
            a.fechaAsignacion = b.fechaAsignacion;
            a.fechaEntrega = b.fechaEntrega;
            a.fechaRecepcion = b.fechaRecepcion;
            a.estado = b.estado;
        }

        this.editando[a.id] = false;
    }

    guardarFila(a: Asignacion): void {
        this.editando[a.id] = false;
        delete this.backup[a.id];
    }

    // ============================
    // ELIMINAR ASIGNACIÓN
    // ============================
    eliminar(a: Asignacion): void {
        if (a.fechaEntrega) {
            alert('No se puede eliminar una asignación que ya fue entregada a reparadora.');
            return;
        }

        if (!confirm(`¿Eliminar la asignación del PIR ${a.pir}?`)) return;

        this.companiesApi.deleteCompanyAssignment(a.id).subscribe({
            next: () => {
                this.asignaciones = this.asignaciones.filter(
                    (x) => x.id !== a.id
                );

                this.refrescar.emit();
            },
            error: (err) => {
                console.error('Error eliminando asignación', err);

                if (err.status === 409) {
                    alert('No se puede eliminar una asignación que ya fue entregada.');
                    return;
                }

                alert('No se pudo eliminar la asignación.');
            },
        });
    }

    // ============================
    // IMPRIMIR
    // ============================
    imprimir(): void {
        window.print();
    }

    descargarPDF(): void {
        const contenido =
            document.querySelector('.detalle-container')?.innerHTML ?? '';

        const ventana = window.open('', '_blank', 'width=800,height=600');

        if (!ventana) return;

        ventana.document.write(`
            <html>
            <head>
                <title>Asignaciones - ${this.empresa.name}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    th, td {
                        border: 1px solid black;
                        padding: 6px;
                        text-align: center;
                    }

                    h2 {
                        margin-bottom: 15px;
                    }
                </style>
            </head>
            <body>
                <h2>Asignaciones — ${this.empresa.name}</h2>
                ${contenido}
            </body>
            </html>
        `);

        ventana.document.close();
        ventana.print();
    }
}
