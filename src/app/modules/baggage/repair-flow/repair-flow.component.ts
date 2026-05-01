import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ActionWizardComponent } from '../claim/action-wizard/action-wizard.component';
import { ActionWizardService } from '../claim/action-wizard/action-wizard.service';
import { ClaimFlowService } from '../services/claim-flow.service';
import { DerivarButtonComponent } from '../derivar-button/derivar-button.component';

import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector: 'app-repair-flow',
    standalone: true,
    imports: [CommonModule, ActionWizardComponent, DerivarButtonComponent],
    templateUrl: './repair-flow.component.html',
    styleUrls: ['./repair-flow.component.scss'],
})
export class RepairFlowComponent implements OnInit, OnDestroy {
    pirNumber = '';
    claim: any = null;
    timeline: any[] = [];
    loading = false;
    errorMessage = '';

    repairStep = 'PENDING';
    repairDocument: any = null;


    uploadingDocument = false;
    deletingDocument = false;

    localPreviewUrl: string | null = null;
    localPreviewType: 'image' | 'pdf' | null = null;
    localPreviewName = '';

    currentUserName = '';
    private destroy$ = new Subject<void>();

    steps = [
        {
            key: 'PENDING',
            title: 'Pendiente',
            desc: 'Aún no se asignó a una empresa reparadora',
            action: null,
        },
        {
            key: 'ASSIGNED',
            title: 'Asignado',
            desc: 'Asignar empresa reparadora',
            action: 'ASSIGN_REPAIR_COMPANY',
        },
        {
            key: 'DELIVERED',
            title: 'Entregado',
            desc: 'Entregar equipaje a reparadora',
            action: 'DELIVER_TO_REPAIR_COMPANY',
        },
        {
            key: 'RETURNED',
            title: 'Devuelto',
            desc: 'Recibir equipaje desde reparadora',
            action: 'RECEIVE_FROM_REPAIR_COMPANY',
        },
        {
            key: 'DOCUMENT_UPLOADED',
            title: 'Informe subido',
            desc: 'Subir informe de reparación',
            action: null,
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private wizardService: ActionWizardService,
        private claimFlowService: ClaimFlowService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.userService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe((user: User) => {
                this.currentUserName =
                    (user as any)?.name ||
                    (user as any)?.email ||
                    '';
            });

        this.pirNumber = this.route.snapshot.paramMap.get('pirNumber') || '';

        if (this.pirNumber) {
            this.loadClaim();
        } else {
            this.errorMessage = 'No se recibió el número de PIR.';
        }

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadClaim(): void {
        this.loading = true;
        this.errorMessage = '';

        this.claimFlowService.getClaimByPir(this.pirNumber).subscribe({
            next: (response) => {
                this.claim = response;
                this.timeline = response?.follow?.entries || [];
                this.sortTimeline();
                this.loadRepairDocuments();
            },
            error: (error) => {
                console.error('Error cargando claim:', error);
                this.errorMessage = 'No se pudo cargar el reclamo.';
                this.loading = false;
            },
        });
    }

    loadRepairDocuments(): void {
        this.claimFlowService.getDocumentsByPir(this.pirNumber).subscribe({
            next: (response) => {
                const documents = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : [];

                if (this.claim) {
                    this.claim.documents = documents;
                }

                this.detectRepairDocument();
                this.calculateRepairStep();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error cargando documentos:', error);
                this.detectRepairDocument();
                this.calculateRepairStep();
                this.loading = false;
            },
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
            loggedUserName: this.currentUserName,
            registeredBy: this.currentUserName,
            todayFlightDate: this.getTodayDateTimeLocal(),
            estimatedReturnDateDefault: this.getDatePlusDaysLocal(5),
            sendWhatsappDefault: 'Sí',
        };

        this.wizardService.open(actionKey, enrichedPirData, () => this.loadClaim());
    }



    getTodayDateTimeLocal(): string {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    }

    getDatePlusDaysLocal(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() + days);

        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);

        return localDate.toISOString().slice(0, 10);
    }

    getPassengerFullName(): string {
        const name = this.claim?.pir?.passengerName || this.claim?.passengerName || '';
        const lastName = this.claim?.pir?.passengerLastName || this.claim?.passengerLastName || '';
        const fullName = `${name} ${lastName}`.trim();

        return fullName || this.claim?.pasajero || '-';
    }

    getDamageOrReason(): string {
        const lossReason = this.claim?.pir?.lossReason || this.claim?.lossReason;
        if (lossReason) return lossReason;

        const damageDetails = this.claim?.pir?.damageDetails || this.claim?.damageDetails;
        if (Array.isArray(damageDetails) && damageDetails.length > 0) {
            const firstDetail = damageDetails[0];

            if (typeof firstDetail === 'string') {
                return firstDetail;
            }

            return (
                firstDetail?.damageType ||
                firstDetail?.description ||
                firstDetail?.detail ||
                '-'
            );
        }

        return '-';
    }
    getClaimStatus(): string {
        return this.claim?.claim?.claimStatus || this.claim?.claimStatus || '-';
    }

    getOpenedStation(): string {
        return this.claim?.claim?.openedStation || this.claim?.originatorAirport || this.claim?.airportText || '-';
    }

    getCurrentStation(): string {
        return this.claim?.claim?.currentStation || this.claim?.claim?.openedStation || this.claim?.airportText || '-';
    }

    getResponsibleStation(): string {
        return this.claim?.claim?.responsibleStation || this.claim?.claim?.openedStation || this.claim?.airportText || '-';
    }

    calculateRepairStep(): void {
        const repairStatus = this.claim?.claim?.repairStatus || this.claim?.repairStatus;
        if (repairStatus === 'ASSIGNED') {
            this.repairStep = 'ASSIGNED';
            return;
        }

        if (repairStatus === 'DELIVERED') {
            this.repairStep = 'DELIVERED';
            return;
        }

        if (repairStatus === 'RETURNED') {
            this.repairStep = 'RETURNED';
            return;
        }

        if (repairStatus === 'REPORT_UPLOADED') {
            this.repairStep = 'DOCUMENT_UPLOADED';
            return;
        }

        if (repairStatus === 'REPAIRED' || repairStatus === 'IRREPARABLE') {
            this.repairStep = 'DOCUMENT_UPLOADED';
            return;
        }

        this.repairStep = 'PENDING';
    }

    isStepCompleted(step: string): boolean {
        const order = [
            'PENDING',
            'ASSIGNED',
            'DELIVERED',
            'RETURNED',
            'DOCUMENT_UPLOADED',
        ];

        return order.indexOf(step) < order.indexOf(this.repairStep);
    }

    detectRepairDocument(): void {
        const documents = this.claim?.documents || [];

        this.repairDocument =
            documents.find((doc: any) => doc?.documentType === 'REPAIR') || null;
    }

    triggerFileInput(fileInput: HTMLInputElement): void {
        if (this.uploadingDocument || this.claim?.claimStatus === 'CLOSED') {
            return;
        }

        fileInput.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            this.errorMessage = 'Solo se permiten PDF o imágenes.';
            input.value = '';
            return;
        }

        this.errorMessage = '';
        this.buildLocalPreview(file);
        this.uploadRepairDocument(file, input);
    }

    buildLocalPreview(file: File): void {
        this.localPreviewName = file.name;

        if (file.type === 'application/pdf') {
            this.localPreviewType = 'pdf';
            this.localPreviewUrl = URL.createObjectURL(file);
            return;
        }

        if (file.type.startsWith('image/')) {
            this.localPreviewType = 'image';
            this.localPreviewUrl = URL.createObjectURL(file);
            return;
        }

        this.localPreviewType = null;
        this.localPreviewUrl = null;
    }

    uploadRepairDocument(file: File, input: HTMLInputElement): void {
        if (!this.pirNumber) return;

        const formData = new FormData();
        formData.append('documentType', 'REPAIR');
        formData.append('description', 'Informe de reparadora');
        formData.append('files', file);

        this.uploadingDocument = true;
        this.errorMessage = '';

        this.claimFlowService.uploadDocument(this.pirNumber, formData).subscribe({
            next: () => {
                this.uploadingDocument = false;
                input.value = '';
                this.loadClaim();
            },
            error: (error) => {
                console.error('Error subiendo documento:', error);
                this.errorMessage =
                    error?.error?.message || 'No se pudo subir el documento.';
                this.uploadingDocument = false;
                input.value = '';
            },
        });
    }

    previewDocument(doc: any): void {
        const url = this.getDocumentUrl(doc);

        if (!url) {
            this.errorMessage = 'No se encontró la ruta del documento.';
            return;
        }

        window.open(url, '_blank');
    }

    getDocumentUrl(doc: any): string {
        if (!doc) return '';

        if (doc.fileLocation?.startsWith('http')) return doc.fileLocation;
        if (doc.url?.startsWith('http')) return doc.url;
        if (doc.fileUrl?.startsWith('http')) return doc.fileUrl;

        if (doc.fileLocation) {
            return `http://localhost:3700/${String(doc.fileLocation).replace(/^\/+/, '')}`;
        }

        return '';
    }

    isImageDocument(doc: any): boolean {
        const type = String(doc?.fileType || '').toLowerCase();
        return type.startsWith('image/');
    }

    isPdfDocument(doc: any): boolean {
        const type = String(doc?.fileType || '').toLowerCase();
        return type === 'application/pdf';
    }

    removeDocument(doc: any): void {
        if (!doc?.id || this.claim?.claimStatus === 'CLOSED') return;

        const confirmed = window.confirm(
            '¿Seguro que deseas eliminar este documento?'
        );
        if (!confirmed) return;

        this.deletingDocument = true;
        this.errorMessage = '';

        this.claimFlowService.deleteDocument(doc.id).subscribe({
            next: () => {
                this.deletingDocument = false;
                this.repairDocument = null;
                this.localPreviewUrl = null;
                this.localPreviewType = null;
                this.localPreviewName = '';
                this.loadClaim();
            },
            error: (error) => {
                console.error('Error eliminando documento:', error);
                this.errorMessage = 'No se pudo eliminar el documento.';
                this.deletingDocument = false;
            },
        });

    }
    getRepairOrder(): string[] {
        return ['PENDING', 'ASSIGNED', 'DELIVERED', 'RETURNED', 'DOCUMENT_UPLOADED'];
    }

    isNextStep(step: string): boolean {
        const order = this.getRepairOrder();
        const currentIndex = order.indexOf(this.repairStep);

        return order[currentIndex + 1] === step;
    }
    canExecuteStep(step: any): boolean {
        return this.isNextStep(step.key);
    }

    onStepClick(step: any): void {
        if (!this.canExecuteStep(step)) return;
        if (!step?.action) return;

        this.openAction(step.action);
    }

    onUploadStepClick(fileInput: HTMLInputElement): void {
        if (!this.canExecuteStep({ key: 'DOCUMENT_UPLOADED' })) return;

        this.triggerFileInput(fileInput);
    }
}
