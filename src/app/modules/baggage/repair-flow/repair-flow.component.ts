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
            pendingTitle: 'Pendiente',
            currentTitle: 'Pendiente de asignación',
            completedTitle: 'Pendiente',
            desc: 'Aún no se asignó a una empresa reparadora',
            action: null,
        },
        {
            key: 'ASSIGNED',
            pendingTitle: 'Asignar equipaje a empresa reparadora',
            currentTitle: 'Equipaje asignado a empresa reparadora',
            completedTitle: 'Equipaje asignado a empresa reparadora',
            desc: 'Seleccionar la empresa que realizará la reparación',
            action: 'ASSIGN_REPAIR_COMPANY',
        },
        {
            key: 'DELIVERED',
            pendingTitle: 'Entregar equipaje a empresa reparadora',
            currentTitle: 'Equipaje entregado a empresa reparadora',
            completedTitle: 'Equipaje entregado a empresa reparadora',
            desc: 'Registrar entrega física del equipaje a la reparadora asinada',
            action: 'DELIVER_TO_REPAIR_COMPANY',
        },
        {
            key: 'RETURNED',
            pendingTitle: 'Recibir equipaje desde reparadora',
            currentTitle: 'Equipaje recibido desde reparadora',
            completedTitle: 'Equipaje recibido desde reparadora',
            desc: 'Registrar recepción del equipaje reparado o irreparable',
            action: 'RECEIVE_FROM_REPAIR_COMPANY',
        },
        {
            key: 'RESOLVED',
            pendingTitle: 'Resultado final',
            currentTitle: 'Resultado final registrado',
            completedTitle: 'Resultado final registrado',
            desc: 'El resultado se define al recibir el equipaje desde la reparadora',
            action: 'RECEIVE_FROM_REPAIR_COMPANY',
        },
    ];
    shouldShowStepDesc(step: any): boolean {
        // Si el paso ya fue completado, no mostrar descripción
        if (this.isStepCompleted(step.key)) {
            return false;
        }

        // Si es el estado actual, tampoco mostrar descripción
        if (this.repairStep === step.key) {
            return false;
        }

        // Los pasos pendientes/siguientes sí muestran descripción
        return !!step.desc;
    }
    getFinalResultText(): string {
        const repairStatus = this.claim?.claim?.repairStatus || this.claim?.repairStatus;

        if (repairStatus === 'REPAIRED') {
            return 'Equipaje marcado como REPARADO';
        }

        if (repairStatus === 'IRREPARABLE') {
            return 'Equipaje marcado como IRREPARABLE';
        }

        return 'Resultado final';
    }
    isRepairFinishedAsRepaired(): boolean {
        const repairStatus =
            this.claim?.claim?.repairStatus ||
            this.claim?.repairStatus;

        return repairStatus === 'REPAIRED';
    }
    getStepTitle(step: any): string {
        if (step.key === 'RESOLVED' && this.repairStep === 'RESOLVED') {
            return this.getFinalResultText();
        }
        if (this.isStepCompleted(step.key)) {
            return step.completedTitle || step.title;
        }

        if (this.repairStep === step.key) {
            return step.currentTitle || step.title;
        }

        if (this.isNextStep(step.key)) {
            return step.pendingTitle || step.title;
        }

        return step.pendingTitle || step.title;
    }
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
    private getFollowEntries(): any[] {
        const entriesFromRoot = this.claim?.follow?.entries || [];
        const entriesFromClaim = this.claim?.claim?.follow?.entries || [];
        const entriesFromTimeline = this.timeline || [];

        return [
            ...entriesFromRoot,
            ...entriesFromClaim,
            ...entriesFromTimeline,
        ];
    }

    private getEntryMetadata(entry: any): any {
        if (!entry?.metadata) return {};

        if (typeof entry.metadata === 'string') {
            try {
                return JSON.parse(entry.metadata);
            } catch {
                return {};
            }
        }

        return entry.metadata;
    }

    private getEntryFormData(entry: any): any {
        const metadata = this.getEntryMetadata(entry);
        return metadata?.formData || metadata?.data || metadata || {};
    }

    private findRepairEntryByAction(actionName: string): any {
        return this.getFollowEntries().find((entry: any) => {
            const formData = this.getEntryFormData(entry);
            const message = String(entry?.message || entry?.description || '').toLowerCase();

            if (actionName === 'ASSIGN_REPAIR_COMPANY') {
                return (
                    formData?.repairCompanyName ||
                    formData?.repairCompanyId ||
                    message.includes('se asignó el equipaje a la empresa reparadora')
                );
            }

            if (actionName === 'DELIVER_TO_REPAIR_COMPANY') {
                return (
                    formData?.deliveryDate ||
                    formData?.estimatedReturnDate ||
                    message.includes('se entregó el equipaje a la reparadora')
                );
            }

            if (actionName === 'RECEIVE_FROM_REPAIR_COMPANY') {
                return (
                    formData?.receivedDate ||
                    formData?.repairResult ||
                    message.includes('se recibió el equipaje desde la reparadora')
                );
            }

            return false;
        });
    }

    getAssignedRepairCompanyText(): string {
        const entry = this.findRepairEntryByAction('ASSIGN_REPAIR_COMPANY');
        const formData = this.getEntryFormData(entry);

        return (
            formData?.repairCompanyName ||
            formData?.repairCompanyText ||
            formData?.companyName ||
            formData?.repairCompany?.name ||
            formData?.repairCompany?.businessName ||
            (formData?.repairCompanyId ? `ID: ${formData.repairCompanyId}` : 'Sin empresa asignada')
        );
    }

    getRepairDeliveryDate(): string {
        const entry = this.findRepairEntryByAction('DELIVER_TO_REPAIR_COMPANY');
        const formData = this.getEntryFormData(entry);

        return this.formatRepairDateTime(formData?.deliveryDate);
    }

    getEstimatedReturnDate(): string {
        const entry = this.findRepairEntryByAction('DELIVER_TO_REPAIR_COMPANY');
        const formData = this.getEntryFormData(entry);

        return this.formatRepairDateTime(formData?.estimatedReturnDate);
    }

    getRepairReceivedDate(): string {
        const entry = this.findRepairEntryByAction('RECEIVE_FROM_REPAIR_COMPANY');
        const formData = this.getEntryFormData(entry);

        return this.formatRepairDateTime(formData?.receivedDate);
    }

    getStepDetails(step: any): { label: string; value: string }[] {
        if (step.key === 'ASSIGNED') {
            const companyName = this.getAssignedRepairCompanyText();

            if (companyName && companyName !== 'Sin empresa asignada') {
                return [
                    { label: 'Empresa', value: companyName },
                ];
            }
        }

        if (step.key === 'DELIVERED') {
            const deliveryDate = this.getRepairDeliveryDate();
            const estimatedReturnDate = this.getEstimatedReturnDate();

            const details: { label: string; value: string }[] = [];

            if (deliveryDate !== '-') {
                details.push({ label: 'Fecha de entrega', value: deliveryDate });
            }

            if (estimatedReturnDate !== '-') {
                details.push({ label: 'Fecha estimada de devolución', value: estimatedReturnDate });
            }

            return details;
        }

        if (step.key === 'RETURNED') {
            const receivedDate = this.getRepairReceivedDate();

            if (receivedDate !== '-') {
                return [
                    { label: 'Fecha de recepción', value: receivedDate },
                ];
            }
        }

        return [];
    }

    private formatRepairDateTime(value: any): string {
        if (!value) return '-';

        const textValue = String(value);

        // Si viene solo fecha: 2026-05-12
        if (/^\d{4}-\d{2}-\d{2}$/.test(textValue)) {
            const [year, month, day] = textValue.split('-');
            return `${day}/${month}/${year}`;
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return textValue.replace('T', ' ');
        }

        return date.toLocaleString('es-BO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
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
            this.repairStep = 'RETURNED';
            return;
        }

        if (repairStatus === 'REPAIRED' || repairStatus === 'IRREPARABLE') {
            this.repairStep = 'RESOLVED';
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
            'RESOLVED',
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
        return ['PENDING', 'ASSIGNED', 'DELIVERED', 'RETURNED', 'RESOLVED'];
    }

    isNextStep(step: string): boolean {
        const order = this.getRepairOrder();
        const currentIndex = order.indexOf(this.repairStep);

        return order[currentIndex + 1] === step;
    }
    canExecuteStep(step: any): boolean {
        // Flujo normal: solo el siguiente paso abre modal
        if (step?.action && this.isNextStep(step.key)) {
            return true;
        }

        // Permitir corregir resultado final
        if (
            step?.key === 'RESOLVED' &&
            this.repairStep === 'RESOLVED' &&
            step?.action === 'RECEIVE_FROM_REPAIR_COMPANY'
        ) {
            return true;
        }

        return false;
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
