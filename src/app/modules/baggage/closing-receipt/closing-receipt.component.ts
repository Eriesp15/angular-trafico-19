import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef,
    HostListener,
    DoCheck,
    OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiClaimService } from '../services/api-claim.service';

type EntregaModo = 'aeropuerto' | 'domicilio' | null;

@Component({
    selector: 'app-closing-receipt',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
    templateUrl: './closing-receipt.component.html',
    styleUrls: ['./closing-receipt.component.scss'],
})
export class ClosingReceiptComponent
    implements OnInit, AfterViewInit, DoCheck, OnDestroy
{
    private readonly apiUrl = 'http://localhost:3700/api/v1';
    private readonly fileBaseUrl = 'http://localhost:3700';
    private readonly documentType = 'DELIVERY_RECEIPT';
    @ViewChild('signatureCanvas')
    signatureCanvasRef!: ElementRef<HTMLCanvasElement>;

    private signaturePadCanvas!: HTMLCanvasElement;
    private signatureCtx!: CanvasRenderingContext2D | null;
    private isDrawing = false;

    private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
    private lastSnapshot = '';
    private loadingInitialData = true;
    private savingDraft = false;

    cerrado = false;
    pir!: string;

    // firma nueva dibujada por el usuario
    firmaBase64: string | null = null;

    // firma que debe verse en el canvas
    firmaVistaSrc: string | null = null;

    // si ya hay firma guardada, no se dibuja encima
    firmaBloqueada = false;

    guardandoBorrador = false;

    seguimiento: {
        numeroPir: string;
        nombres: string;
        fechaReclamo: string;
    } | null = null;

    form = {
        fechaEntrega: new Date().toISOString().slice(0, 10),
        cantidadEquipajes: 1,
        entregaModo: 'aeropuerto' as EntregaModo,
        deliveryAddressType: '',
        direccion: '',
        ci: '',
        aclaracion: '',
        observaciones: '',
    };

    archivosSubidos: any[] = [];
    archivosPendientes: File[] = [];
    modalCierreAbierto = false;
    subiendoArchivos = false;
    cargandoArchivos = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private claimApi: ApiClaimService,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        const pirParam = this.route.snapshot.paramMap.get('pir');

        if (!pirParam) {
            alert('No se encontró el número PIR.');
            this.router.navigate(['/']);
            return;
        }

        this.pir = pirParam;
        void this.cargarInicial();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (this.firmaVistaSrc) {
                this.programarRestauracionFirma();
            } else {
                this.inicializarCanvasFirmaConReintento();
            }
        }, 80);
    }

    ngDoCheck(): void {
        if (this.loadingInitialData || this.cerrado || !this.pir) {
            return;
        }

        const snapshot = this.obtenerSnapshot();

        if (snapshot !== this.lastSnapshot) {
            this.lastSnapshot = snapshot;
            this.programarGuardado();
        }
    }

    ngOnDestroy(): void {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
    }

    @HostListener('window:resize')
    onResize(): void {
        if (!this.signatureCanvasRef) {
            return;
        }

        setTimeout(() => {
            if (this.firmaVistaSrc) {
                this.programarRestauracionFirma();
            } else {
                this.inicializarCanvasFirmaConReintento();
            }
        }, 100);
    }

    private async cargarInicial(): Promise<void> {
        await Promise.all([this.cargarDatosDelReclamo(), this.cargarArchivos()]);
        this.lastSnapshot = this.obtenerSnapshot();
        this.loadingInitialData = false;

        if (this.firmaVistaSrc) {
            this.programarRestauracionFirma();
        }
    }

    private obtenerSnapshot(): string {
        return JSON.stringify({
            fechaEntrega: this.form.fechaEntrega,
            cantidadEquipajes: this.form.cantidadEquipajes,
            entregaModo: this.form.entregaModo,
            deliveryAddressType: this.form.deliveryAddressType,
            direccion: this.form.direccion,
            ci: this.form.ci,
            aclaracion: this.form.aclaracion,
            observaciones: this.form.observaciones,
            firmaBase64: this.firmaBase64,
        });
    }

    private programarGuardado(): void {
        if (this.cerrado) {
            return;
        }

        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        this.autoSaveTimer = setTimeout(() => {
            void this.guardarBorrador();
        }, 800);
    }

    private async guardarBorrador(): Promise<void> {
        if (this.cerrado || this.loadingInitialData || !this.pir || this.savingDraft) {
            return;
        }

        try {
            this.savingDraft = true;
            this.guardandoBorrador = true;

            const payload = {
                fechaEntrega: this.form.fechaEntrega,
                cantidadEquipajes: this.form.cantidadEquipajes ?? 1,
                entregaModo: this.form.entregaModo ?? 'aeropuerto',
                direccion: this.form.entregaModo === 'domicilio' ? this.form.direccion : '',
                ci: this.form.ci,
                aclaracion: this.form.aclaracion,
                observaciones: this.form.observaciones,
                firmaBase64: this.firmaBase64,
            };

            await firstValueFrom(
                this.http.patch(`${this.apiUrl}/claims/draft/${this.pir}`, payload)
            );
        } catch (error) {
            console.error('Error al guardar borrador:', error);
        } finally {
            this.savingDraft = false;
            this.guardandoBorrador = false;
        }
    }

    async cargarDatosDelReclamo(): Promise<void> {
        try {
            const data = await firstValueFrom(this.claimApi.getClaimByPir(this.pir));

            this.seguimiento = {
                numeroPir: data.pirNumber,
                nombres: data.pasajero,
                fechaReclamo: data.createdAt,
            };

            this.cerrado = data.claimStatus === 'CLOSED';

            if (data.closingReceipt) {
                this.form.fechaEntrega = data.closingReceipt.date
                    ? new Date(data.closingReceipt.date).toISOString().slice(0, 10)
                    : this.form.fechaEntrega;

                this.form.cantidadEquipajes = data.closingReceipt.quantity ?? 1;
                this.form.entregaModo = data.closingReceipt.deliveryMode ?? 'aeropuerto';
                this.form.direccion = data.closingReceipt.address ?? '';
                this.form.ci = data.closingReceipt.ci ?? '';
                this.form.aclaracion = data.closingReceipt.clarification ?? '';
                this.form.observaciones = data.closingReceipt.observations ?? '';

                if (data.closingReceipt.signaturePath) {
                    if (this.cerrado) {
                        this.firmaVistaSrc = `${this.fileBaseUrl}/${data.closingReceipt.signaturePath}`;
                        this.firmaBase64 = null;
                        this.firmaBloqueada = true;
                    } else {
                        const firmaDataUrl = await this.cargarFirmaGuardadaComoDataUrl(
                            data.closingReceipt.signaturePath
                        );

                        if (firmaDataUrl) {
                            this.firmaVistaSrc = firmaDataUrl;
                            this.firmaBase64 = null;
                            this.firmaBloqueada = true;
                            this.programarRestauracionFirma();
                        }
                    }
                } else {
                    this.firmaVistaSrc = null;
                    this.firmaBase64 = null;
                    this.firmaBloqueada = false;
                }
            }

            const entries = data.claim?.follow?.entries ?? [];
            const deliverEntry = [...entries].reverse().find((e: any) =>
                e.metadata?.deliveryAddressType || e.metadata?.pickedUpBy
            );

            if (deliverEntry?.metadata) {
                const meta = deliverEntry.metadata;

                if (meta.pickedUpBy) {
                    this.form.entregaModo = 'aeropuerto';
                } else if (meta.deliveryAddressType) {
                    this.form.entregaModo = 'domicilio';
                    this.form.deliveryAddressType = meta.deliveryAddressType;
                    this.form.direccion = meta.deliveryAddress || '';
                }
            }
        } catch (error) {
            console.error('Error al cargar datos del reclamo:', error);
            alert('No se pudieron cargar los datos del reclamo.');
        }
    }

    private programarRestauracionFirma(): void {
        setTimeout(() => {
            this.inicializarCanvasFirmaConReintento(12);
        }, 150);
    }

    private async cargarFirmaGuardadaComoDataUrl(
        relativePath: string
    ): Promise<string | null> {
        try {
            const blob = await firstValueFrom(
                this.http.get(`${this.fileBaseUrl}/${relativePath}`, {
                    responseType: 'blob',
                })
            );

            return await this.blobToDataUrl(blob);
        } catch (error) {
            console.error('Error al cargar firma guardada:', error);
            return null;
        }
    }

    private blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;

            reader.readAsDataURL(blob);
        });
    }

    async cargarArchivos(): Promise<void> {
        this.cargandoArchivos = true;

        try {
            this.archivosSubidos = await firstValueFrom(
                this.http.get<any[]>(
                    `${this.apiUrl}/documents/${this.pir}?documentType=${this.documentType}`
                )
            );
        } catch (error) {
            console.error('Error al cargar archivos:', error);
            this.archivosSubidos = [];
        } finally {
            this.cargandoArchivos = false;
        }
    }

    seleccionarArchivos(event: Event): void {
        if (this.cerrado) {
            return;
        }

        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            return;
        }

        this.archivosPendientes = Array.from(input.files);
        void this.subirArchivos();

        input.value = '';
    }

    async subirArchivos(): Promise<void> {
        if (this.cerrado || !this.archivosPendientes.length) {
            return;
        }

        this.subiendoArchivos = true;

        const formData = new FormData();
        formData.append('documentType', this.documentType);
        formData.append('description', 'Documentos del recibo de cierre');

        this.archivosPendientes.forEach((file) => {
            formData.append('files', file);
        });

        try {
            await firstValueFrom(
                this.http.post(`${this.apiUrl}/documents/upload/${this.pir}`, formData)
            );

            this.archivosPendientes = [];
            await this.cargarArchivos();
            alert('Archivos subidos correctamente.');
        } catch (error) {
            console.error('Error al subir archivos:', error);

            const httpError = error as HttpErrorResponse;
            const backendMessage =
                httpError?.error?.message || 'Hubo un problema al subir los archivos';

            alert(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage);
        } finally {
            this.subiendoArchivos = false;
        }
    }

    async eliminarArchivo(id: string): Promise<void> {
        if (this.cerrado) {
            return;
        }

        const confirmado = confirm('¿Desea eliminar este archivo?');

        if (!confirmado) {
            return;
        }

        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/documents/${id}`));
            await this.cargarArchivos();
            alert('Archivo eliminado correctamente.');
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            alert('No se pudo eliminar el archivo.');
        }
    }

    abrirModalCierre(): void {
        if (this.cerrado) {
            return;
        }

        if (this.archivosSubidos.length === 0) {
            alert('Debe subir al menos un documento antes de cerrar.');
            return;
        }

        this.modalCierreAbierto = true;

        setTimeout(() => {
            if (this.firmaVistaSrc) {
                this.programarRestauracionFirma();
            } else {
                this.inicializarCanvasFirmaConReintento();
            }
        }, 100);
    }

    async confirmarCierre(): Promise<void> {
        if (this.cerrado) {
            return;
        }

        try {
            const payload = {
                fechaEntrega: this.form.fechaEntrega,
                cantidadEquipajes: this.form.cantidadEquipajes ?? 1,
                entregaModo: this.form.entregaModo ?? 'aeropuerto',
                direccion: this.form.entregaModo === 'domicilio' ? this.form.direccion : '',
                ci: this.form.ci,
                aclaracion: this.form.aclaracion,
                observaciones: this.form.observaciones,
                firmaBase64: this.firmaBase64,
            };

            await firstValueFrom(
                this.http.post(`${this.apiUrl}/claims/close/${this.pir}`, payload)
            );

            this.modalCierreAbierto = false;
            this.cerrado = true;

            this.router.navigate(['/baggage/claim/view', this.pir], {
                state: { successMessage: '✔ Reclamo cerrado correctamente.' },
            });
        } catch (error) {
            console.error('Error al cerrar reclamo:', error);

            const httpError = error as HttpErrorResponse;
            const backendMessage =
                httpError?.error?.message || 'No se pudo cerrar el reclamo.';

            alert(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage);
        }
    }

    print(): void {
        window.print();
    }

    getFileUrl(archivo: any): string {
        return `http://localhost:3700/${archivo.fileLocation}`;
    }

    getPdfPreviewUrl(archivo: any): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
            `http://localhost:3700/${archivo.fileLocation}`
        );
    }

    esImagen(archivo: any): boolean {
        const fileType = (archivo.fileType || '').toLowerCase();
        const fileName = (archivo.fileName || '').toLowerCase();

        return (
            fileType.startsWith('image/') ||
            fileName.endsWith('.png') ||
            fileName.endsWith('.jpg') ||
            fileName.endsWith('.jpeg') ||
            fileName.endsWith('.webp')
        );
    }

    esPdf(archivo: any): boolean {
        const fileType = (archivo.fileType || '').toLowerCase();
        const fileName = (archivo.fileName || '').toLowerCase();

        return fileType === 'application/pdf' || fileName.endsWith('.pdf');
    }

    private inicializarCanvasFirmaConReintento(intentos = 12): void {
        if (!this.signatureCanvasRef) {
            return;
        }

        const canvas = this.signatureCanvasRef.nativeElement;
        const rect = canvas.getBoundingClientRect();

        if ((rect.width === 0 || rect.height === 0) && intentos > 0) {
            setTimeout(() => {
                this.inicializarCanvasFirmaConReintento(intentos - 1);
            }, 140);
            return;
        }

        this.inicializarCanvasFirma();

        if (this.firmaVistaSrc) {
            setTimeout(() => {
                if (this.firmaVistaSrc) {
                    this.restaurarFirma(this.firmaVistaSrc);
                }
            }, 120);
        }
    }

    inicializarCanvasFirma(): void {
        if (!this.signatureCanvasRef) {
            return;
        }

        this.signaturePadCanvas = this.signatureCanvasRef.nativeElement;
        this.signatureCtx = this.signaturePadCanvas.getContext('2d');

        if (!this.signatureCtx) {
            return;
        }

        const rect = this.signaturePadCanvas.getBoundingClientRect();
        const width = Math.max(Math.floor(rect.width), 300);
        const height = Math.max(Math.floor(rect.height), 180);

        this.signaturePadCanvas.width = width;
        this.signaturePadCanvas.height = height;

        this.signatureCtx.lineWidth = 2;
        this.signatureCtx.lineCap = 'round';
        this.signatureCtx.lineJoin = 'round';

        this.signaturePadCanvas.onmousedown = (event) => this.iniciarDibujoMouse(event);
        this.signaturePadCanvas.onmousemove = (event) => this.dibujarMouse(event);
        this.signaturePadCanvas.onmouseup = () => this.finalizarDibujo();
        this.signaturePadCanvas.onmouseleave = () => this.finalizarDibujo();

        this.signaturePadCanvas.ontouchstart = (event) => this.iniciarDibujoTouch(event);
        this.signaturePadCanvas.ontouchmove = (event) => this.dibujarTouch(event);
        this.signaturePadCanvas.ontouchend = () => this.finalizarDibujo();
    }

    private getCanvasCoordinates(clientX: number, clientY: number) {
        const rect = this.signaturePadCanvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    }

    private avisarFirmaBloqueada(): void {
        alert('La firma ya existe. Limpie la firma y vuelva a firmar.');
    }

    iniciarDibujoMouse(event: MouseEvent): void {
        if (this.cerrado || !this.signatureCtx) {
            return;
        }

        if (this.firmaBloqueada) {
            this.avisarFirmaBloqueada();
            return;
        }

        this.isDrawing = true;
        const { x, y } = this.getCanvasCoordinates(event.clientX, event.clientY);
        this.signatureCtx.beginPath();
        this.signatureCtx.moveTo(x, y);
    }

    dibujarMouse(event: MouseEvent): void {
        if (!this.isDrawing || this.cerrado || this.firmaBloqueada || !this.signatureCtx) {
            return;
        }

        const { x, y } = this.getCanvasCoordinates(event.clientX, event.clientY);
        this.signatureCtx.lineTo(x, y);
        this.signatureCtx.stroke();
    }

    iniciarDibujoTouch(event: TouchEvent): void {
        if (this.cerrado || !this.signatureCtx) {
            return;
        }

        if (this.firmaBloqueada) {
            this.avisarFirmaBloqueada();
            return;
        }

        event.preventDefault();
        const touch = event.touches[0];

        if (!touch) {
            return;
        }

        this.isDrawing = true;
        const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
        this.signatureCtx.beginPath();
        this.signatureCtx.moveTo(x, y);
    }

    dibujarTouch(event: TouchEvent): void {
        if (!this.isDrawing || this.cerrado || this.firmaBloqueada || !this.signatureCtx) {
            return;
        }

        event.preventDefault();
        const touch = event.touches[0];

        if (!touch) {
            return;
        }

        const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
        this.signatureCtx.lineTo(x, y);
        this.signatureCtx.stroke();
    }

    finalizarDibujo(): void {
        if (!this.isDrawing) {
            return;
        }

        this.isDrawing = false;
        this.guardarFirmaBase64();

        if (this.firmaBase64) {
            this.firmaVistaSrc = this.firmaBase64;
            this.firmaBloqueada = false;
        }
    }

    guardarFirmaBase64(): void {
        if (!this.signaturePadCanvas) {
            return;
        }

        try {
            this.firmaBase64 = this.signaturePadCanvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error al exportar la firma:', error);
            alert('Debe borrar la firma actual y volver a firmar.');
        }
    }

    limpiarFirma(): void {
        if (!this.signatureCtx || !this.signaturePadCanvas || this.cerrado) {
            return;
        }

        this.signatureCtx.clearRect(
            0,
            0,
            this.signaturePadCanvas.width,
            this.signaturePadCanvas.height
        );

        this.firmaBase64 = null;
        this.firmaVistaSrc = null;
        this.firmaBloqueada = false;
    }

    restaurarFirma(src: string): void {
        if (!this.signatureCtx || !this.signaturePadCanvas) {
            return;
        }

        const image = new Image();

        image.onload = () => {
            this.signatureCtx?.clearRect(
                0,
                0,
                this.signaturePadCanvas.width,
                this.signaturePadCanvas.height
            );

            this.signatureCtx?.drawImage(
                image,
                0,
                0,
                this.signaturePadCanvas.width,
                this.signaturePadCanvas.height
            );
        };

        image.onerror = () => {
            console.error('No se pudo restaurar la firma en el canvas.');
        };

        image.src = src;
    }
}
