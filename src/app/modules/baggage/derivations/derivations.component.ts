import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ActionWizardComponent } from '../claim/action-wizard/action-wizard.component';
import { ActionWizardService } from '../claim/action-wizard/action-wizard.service';
import { ClaimFlowService } from '../services/claim-flow.service';

@Component({
    selector: 'app-derivations',
    standalone: true,
    imports: [CommonModule, ActionWizardComponent],
    templateUrl: './derivations.component.html',
    styleUrls: ['./derivations.component.scss']
})
export class DerivationsComponent implements OnInit {
    pirNumber = '';
    claim: any = null;
    timeline: any[] = [];
    loading = false;
    errorMessage = '';

    currentUserName = '';

    constructor(
        private route: ActivatedRoute,
        private wizardService: ActionWizardService,
        private claimFlowService: ClaimFlowService
    ) {}

    ngOnInit(): void {
        this.pirNumber = this.route.snapshot.paramMap.get('pirNumber') || '';

        // Reemplazar esta línea por la misma lógica usada en tu otro componente
        this.currentUserName = 'admin';

        if (this.pirNumber) {
            this.loadClaim();
        } else {
            this.errorMessage = 'No se recibió el número de PIR.';
        }
    }

    loadClaim(): void {
        this.loading = true;
        this.errorMessage = '';

        this.claimFlowService.getClaimByPir(this.pirNumber).subscribe({
            next: (response) => {
                this.claim = {
                    ...response,
                    pirId:
                        response?.pirId ||
                        response?.traceRoute?.pirId ||
                        response?.bagDescriptions?.[0]?.pirId ||
                        null
                };

                this.timeline = response?.follow?.entries || [];
                this.sortTimeline();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error cargando claim:', error);
                this.errorMessage = 'No se pudo cargar el reclamo.';
                this.loading = false;
            }
        });
    }

    sortTimeline(): void {
        this.timeline = [...this.timeline].sort((a, b) => {
            const dateA = new Date(a.eventAt || a.createdAt).getTime();
            const dateB = new Date(b.eventAt || b.createdAt).getTime();
            return dateB - dateA;
        });
    }

    openAction(actionKey: string): void {
        if (!this.claim) return;

        const enrichedPirData = {
            ...this.claim,
            currentOffice: this.getCurrentOffice(),
            loggedUserName: this.currentUserName,
            registeredBy: this.currentUserName,
            todayFlightDate: this.getTodayDateTimeLocal()
        };

        this.wizardService.open(
            actionKey,
            enrichedPirData,
            () => this.loadClaim()
        );
    }

    getCurrentOffice(): string {
        return 'CBB - Cochabamba';
    }

    getTodayDateTimeLocal(): string {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    }

    getChannelLabel(channel: string): string {
        switch (channel) {
            case 'NOTE':
                return 'Nota';
            case 'CALL':
                return 'Llamada';
            case 'EMAIL':
                return 'Correo';
            case 'WHATSAPP':
                return 'WhatsApp';
            default:
                return channel || '-';
        }
    }

    getKindLabel(kind: string): string {
        switch (kind) {
            case 'ACTIVITY':
                return 'Actividad';
            case 'COMMUNICATION':
                return 'Comunicación';
            default:
                return kind || '-';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'SAVED':
                return 'Guardado';
            case 'SENT':
                return 'Enviado';
            case 'PENDING':
                return 'Pendiente';
            default:
                return status || '-';
        }
    }
}
