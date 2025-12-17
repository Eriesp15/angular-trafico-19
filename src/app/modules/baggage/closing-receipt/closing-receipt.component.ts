import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
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

    // Estado
    cerrado = false;

    // PIR desde la ruta
    pir!: string;

    // Datos mostrados en la vista
    seguimiento: {
        numeroPir: string;
        nombres: string;
        fechaReclamo: string;
    } | null = null;

    // Formulario
    form = {
        fechaEntrega: new Date().toISOString().slice(0, 10),
        cantidadEquipajes: null as number | null,
        entregaModo: null as EntregaModo,
        direccion: '',
        ci: '',
        aclaracion: '',
        observaciones: '',
    };

    archivosSubidos: File[] = [];
    modalCierreAbierto = false;

    constructor(
        private route: ActivatedRoute,
        private claimApi: ApiClaimService
    ) {}

    ngOnInit(): void {
        // 🔑 PIR viene de la URL
        this.pir = this.route.snapshot.paramMap.get('pir')!;
        this.cargarDatosDelReclamo();
    }

    cargarDatosDelReclamo(): void {
        this.claimApi.getClaimByPir(this.pir).subscribe(data => {

            console.log('DATA BACKEND:', data);

            this.seguimiento = {
                numeroPir: data.pirNumber,
                nombres: data.pasajero,
                fechaReclamo: data.createdAt,
            };

            // 🔒 El backend no devuelve estado → asumimos editable
            this.cerrado = false;
        });
    }

    seleccionarArchivos(event: Event): void {
        if (this.cerrado) return;

        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.archivosSubidos.push(...Array.from(input.files));
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
        this.modalCierreAbierto = false;
        this.cerrado = true;

        alert('✔ Recibo de cierre registrado (modo demostración).');
    }

    abrirArchivo(file: File): void {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
    }

    print(): void {
        window.print();
    }
}
