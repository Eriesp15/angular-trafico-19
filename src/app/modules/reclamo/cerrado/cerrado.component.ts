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
    // 🧾 Datos simulados del reclamo
    seguimiento = {
        tipoExpediente: 'DPR',
        numeroPir: 'CBBO1315449',
        fechaReclamo: '2025-06-28',
        nombres: 'Juan Andres Lopez Herbas',
    };

    // 🔹 Variables principales
    entregaModo: EntregaLugar = null;
    direccion: string = '';
    archivoSubido: File | null = null;

    // 📋 Formulario general (firma, aclaración, observaciones)
    form = {
        fechaEntrega: new Date().toISOString().slice(0, 10),
        cantidadEquipajes: null as number | null,
        ci: '',
        aclaracion: '',
        observaciones: '',
    };

    // 📞 WhatsApp del área de reclamos (modifícalo según BoA)
    telefonoReclamos = '71234567';

    // 💬 Modal y mensaje de WhatsApp
    modalAbierto = false;
    mensajeWhatsApp = '';
    copiado = false;

    // 🟢 Abrir modal con mensaje prellenado
    abrirModalMensaje() {
        if (!this.entregaModo) {
            alert('Seleccione el modo de entrega');
            return;
        }

        if (this.entregaModo === 'domicilio' && !this.direccion.trim()) {
            alert('Ingrese la dirección de entrega');
            return;
        }

        this.mensajeWhatsApp =
            `✈️ *Confirmación de entrega de equipaje*\n\n` +
            `Reclamo: ${this.seguimiento.numeroPir}\n` +
            `Pasajero: ${this.seguimiento.nombres}\n` +
            (this.entregaModo === 'domicilio'
                ? `Entrega a domicilio: ${this.direccion}`
                : `Entrega en aeropuerto.`) +
            `\n\nPor favor confirmar la recepción.`;

        this.modalAbierto = true;
    }

    cerrarModal() {
        this.modalAbierto = false;
        this.copiado = false;
    }

    copiarMensaje() {
        navigator.clipboard.writeText(this.mensajeWhatsApp);
        this.copiado = true;
        setTimeout(() => (this.copiado = false), 2000);
    }

    abrirWhatsApp() {
        const telefono = this.telefonoReclamos.replace(/\D/g, '');
        const enlace = `https://wa.me/591${telefono}?text=${encodeURIComponent(this.mensajeWhatsApp)}`;
        window.open(enlace, '_blank');
        this.modalAbierto = false;
    }

    subirComprobante(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.archivoSubido = input.files[0];
            console.log('Archivo cargado:', this.archivoSubido.name);
        }
    }

    // 🖨️ Método para imprimir la hoja
    print(): void {
        window.print();
    }
}
