import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActionWizardComponent } from '../claim/action-wizard/action-wizard.component';
import { ActionWizardService } from '../claim/action-wizard/action-wizard.service';
import { ClaimFlowService } from '../services/claim-flow.service';

@Component({
    selector: 'app-repair-flow',
    standalone: true,
    imports: [CommonModule, ActionWizardComponent],
    templateUrl: './repair-flow.component.html',
    styleUrls: ['./repair-flow.component.scss']
})
export class RepairFlowComponent implements OnInit {
    pirNumber = '';
    claim: any = null;
    timeline: any[] = [];
    loading = false;
    errorMessage = '';

    repairStep = 'ASSIGNED';
    repairDocument: any = null;

    uploadingDocument = false;
    deletingDocument = false;

    // preview local
    localPreviewUrl: string | null = null;
    localPreviewType: 'image' | 'pdf' | null = null;
    localPreviewName = '';

    steps = [
        { key: 'ASSIGNED', title: 'Asignado', desc: 'Se asignó a empresa reparadora' },
        { key: 'DELIVERED', title: 'Entregado', desc: 'Equipaje entregado a reparadora' },
        { key: 'IN_REPAIR', title: 'En reparadora', desc: 'La reparadora está trabajando el equipaje' },
        { key: 'RETURNED', title: 'Devuelto', desc: 'La reparadora devolvió el equipaje a oficina' },
        { key: 'DOCUMENT_UPLOADED', title: 'Informe subido', desc: 'Se cargó el documento de reparación' },
        { key: 'RESOLVED', title: 'Resultado definido', desc: 'Se marcó reparado o irreparable' }
    ];

    constructor(
        private route: ActivatedRoute,
        private wizardService: ActionWizardService,
        private claimFlowService: ClaimFlowService,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this.pirNumber = this.route.snapshot.paramMap.get('pirNumber') || '';

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
                this.claim = response;
                this.timeline = response?.follow?.entries || [];
                this.sortTimeline();
                this.loadRepairDocuments();
            },
            error: (error) => {
                console.error('Error cargando claim:', error);
                this.errorMessage = 'No se pudo cargar el reclamo.';
                this.loading = false;
            }
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

        this.wizardService.open(
            actionKey,
            this.claim,
            () => this.loadClaim()
        );
    }

    calculateRepairStep(): void {
        const messages = this.timeline.map(item =>
            String(item?.message || '').toLowerCase()
        );

        const hasAssigned = messages.some(msg =>
            msg.includes('asignó el equipaje a la empresa reparadora')
        );

        const hasDelivered = messages.some(msg =>
            msg.includes('se entregó el equipaje a la reparadora')
        );

        const hasReceived = messages.some(msg =>
            msg.includes('se recibió el equipaje desde la reparadora')
        );

        const hasIrreparable = messages.some(msg =>
            msg.includes('irreparabilidad') || msg.includes('irreparable')
        );

        const hasRepaired = this.claim?.claimStatus === 'REPAIRED';

        if (hasIrreparable || hasRepaired) {
            this.repairStep = 'RESOLVED';
            return;
        }

        if (this.repairDocument && hasReceived) {
            this.repairStep = 'DOCUMENT_UPLOADED';
            return;
        }

        if (hasReceived) {
            this.repairStep = 'RETURNED';
            return;
        }

        if (hasDelivered) {
            this.repairStep = 'IN_REPAIR';
            return;
        }

        if (hasAssigned) {
            this.repairStep = 'ASSIGNED';
            return;
        }

        this.repairStep = 'ASSIGNED';
    }

    isStepCompleted(step: string): boolean {
        const order = [
            'ASSIGNED',
            'DELIVERED',
            'IN_REPAIR',
            'RETURNED',
            'DOCUMENT_UPLOADED',
            'RESOLVED'
        ];

        return order.indexOf(step) < order.indexOf(this.repairStep);
    }

    detectRepairDocument(): void {
        const documents = this.claim?.documents || [];

        this.repairDocument =
            documents.find((doc: any) => doc?.documentType === 'REPAIR') || null;
    }

    triggerFileInput(fileInput: HTMLInputElement): void {
        if (this.uploadingDocument || this.claim?.claimStatus === 'CLOSED') return;
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
            'image/webp'
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

        // primero manda estos campos
        formData.append('documentType', 'REPAIR');
        formData.append('description', 'Informe de reparadora');

        // al final manda el archivo
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
                console.log('error body:', error?.error);
                this.errorMessage = error?.error?.message || 'No se pudo subir el documento.';
                this.uploadingDocument = false;
                input.value = '';
            }
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

        const confirmed = window.confirm('¿Seguro que deseas eliminar este documento?');
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
            }
        });
    }

    markAsRepaired(): void {
        if (!this.repairDocument) {
            this.errorMessage = 'Primero debes subir el informe de la reparadora.';
            return;
        }

        this.openAction('MARK_AS_REPAIRED');
    }
}
