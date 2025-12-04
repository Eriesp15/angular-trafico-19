import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

type EntregaModo = 'aeropuerto' | 'domicilio' | null;

@Component({
    selector: 'app-cerrado',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
    templateUrl: './closing-receipt.component.html',
    styleUrls: ['./closing-receipt.component.scss'],
})
export class ClosingReceiptComponent  {

    cerrado = false; // 🔥 <--- NUEVO: controla vista editable/no editable

    // Datos simulados
    seguimiento = {
        tipoExpediente: 'DPR',
        numeroPir: 'CBBO1315449',
        fechaReclamo: '2025-06-28',
        nombres: 'Juan Andres Lopez Herbas',
        direccionOriginal: 'Av. Aroma #532 Zona Central'
    };

    // Formulario
    form = {
        fechaEntrega: new Date().toISOString().slice(0, 10),
        cantidadEquipajes: null as number | null,
        entregaModo: null as EntregaModo,
        direccion: '',
        ci: '',
        aclaracion: '',
        observaciones: '',
        notaCierre: ''
    };

    archivosSubidos: File[] = [];

    modalCierreAbierto = false;

    ngOnInit() {
        this.form.direccion = this.seguimiento.direccionOriginal;
    }

    seleccionarArchivos(event: Event) {
        if (this.cerrado) return; // bloqueo
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.archivosSubidos = [
                ...this.archivosSubidos,
                ...Array.from(input.files)
            ];
        }
    }

    abrirModalCierre() {
        if (this.archivosSubidos.length === 0) {
            alert('Debe subir al menos un documento antes de cerrar.');
            return;
        }
        this.modalCierreAbierto = true;
    }

    cerrarModal() {
        this.modalCierreAbierto = false;
    }

    confirmarCierre() {
        this.form.notaCierre =
            'Se firmó el recibo de cierre del reclamo del equipaje.';

        this.cerrado = true; // 🔥 BLOQUEA LA VISTA

        this.modalCierreAbierto = false;

        alert('El cierre del reclamo ha sido registrado.');
    }

    abrirArchivo(file: File) {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
    }

    print() {
        window.print();
    }
}
