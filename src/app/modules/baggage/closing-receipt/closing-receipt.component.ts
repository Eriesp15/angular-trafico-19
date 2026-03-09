import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiClaimService } from '../services/api-claim.service';

type EntregaModo = 'aeropuerto' | 'domicilio' | null;

@Component({
    selector: 'app-closing-receipt',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
    templateUrl: './closing-receipt.component.html',
    styleUrls: ['./closing-receipt.component.scss'],
})
export class ClosingReceiptComponent implements OnInit {
    cerrado = false;
    pir!: string;

    seguimiento: {
        numeroPir: string;
        nombres: string;
        fechaReclamo: string;
    } | null = null;

    form = {
        fechaEntrega: new Date().toISOString().slice(0, 10),
        cantidadEquipajes: null as number | null,
        entregaModo: null as EntregaModo,
        direccion: '',
        ci: '',
        aclaracion: '',
        observaciones: '',
    };

    // ✅ archivos ya guardados en backend/BD
    archivosSubidos: any[] = [];

    // ✅ archivos seleccionados pero todavía no subidos
    archivosPendientes: File[] = [];

    modalCierreAbierto = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private claimApi: ApiClaimService
    ) {}

    ngOnInit(): void {
        this.pir = this.route.snapshot.paramMap.get('pir')!;
        this.cargarDatosDelReclamo();
        this.cargarArchivos();
    }

    cargarDatosDelReclamo(): void {
        this.claimApi.getClaimByPir(this.pir).subscribe((data) => {
            this.seguimiento = {
                numeroPir: data.pirNumber,
                nombres: data.pasajero,
                fechaReclamo: data.createdAt,
            };
            this.cerrado = false;
        });
    }

    async cargarArchivos(): Promise<void> {
        try {
            this.archivosSubidos = await firstValueFrom(
                this.http.get<any[]>(
                    `/api/v1/documents/${this.pir}?documentType=CLOSING_RECEIPT`
                )
            );
        } catch (error) {
            console.error('Error al cargar archivos:', error);
        }
    }

    seleccionarArchivos(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        this.archivosPendientes = Array.from(input.files);
    }

    async subirArchivos(): Promise<void> {
        if (this.archivosPendientes.length === 0) {
            alert('Por favor, seleccione al menos un archivo.');
            return;
        }

        const formData = new FormData();

        this.archivosPendientes.forEach((file) => {
            formData.append('files', file);
        });

        formData.append('documentType', 'CLOSING_RECEIPT');
        formData.append('description', 'Documentos del recibo de cierre');

        try {
            await firstValueFrom(
                this.http.post(`/api/v1/documents/upload/${this.pir}`, formData)
            );

            alert('✔ Archivos subidos exitosamente');
            this.archivosPendientes = [];
            await this.cargarArchivos();
        } catch (error) {
            console.error('Error al subir archivos:', error);
            alert('Hubo un problema al subir los archivos');
        }
    }

    async eliminarArchivo(id: string): Promise<void> {
        try {
            await firstValueFrom(this.http.delete(`/api/v1/documents/${id}`));
            this.archivosSubidos = this.archivosSubidos.filter((file) => file.id !== id);
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            alert('No se pudo eliminar el archivo');
        }
    }

    abrirModalCierre(): void {
        if (this.archivosSubidos.length === 0) {
            alert('Debe subir al menos un documento antes de cerrar.');
            return;
        }
        this.modalCierreAbierto = true;
    }

    confirmarCierre(): void {
        const confirmacion = confirm('¿Está seguro de que desea confirmar el cierre?');
        if (confirmacion) {
            this.modalCierreAbierto = false;
            this.cerrado = true;
            alert('✔ Recibo de cierre registrado.');
            this.router.navigate([`/visualizacion-pir/${this.pir}`]);
        }
    }

    print(): void {
        window.print();
    }
}
