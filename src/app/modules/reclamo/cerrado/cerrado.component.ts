import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

type EntregaLugar = 'aeropuerto' | 'domicilio' | null;

@Component({
    selector: 'app-cerrado',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatRadioModule],
    templateUrl: './cerrado.component.html',
    styleUrls: ['./cerrado.component.scss'],
})
export class CerradoComponent {
    // Cabecera (puedes reemplazar por datos reales cuando conectes el back/mock)
    seguimiento = {
        tipoExpediente: 'DPR',
        numeroPir: 'CBBO1315449',
        fechaReclamo: '2025-06-28',
        nombres: 'Juan Andres Lopez Herbas',
    };

    // Formulario principal
    form = {
        fechaEntrega: new Date().toISOString().slice(0, 10), // yyyy-MM-dd (editable)
        cantidadEquipajes: null as number | null,
        entregaEn: null as EntregaLugar,
        direccion: '',
        ci: '',
        aclaracion: '',
        observaciones: '',
    };

    print(): void {
        window.print();
    }
}
