import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

type SeguimientoRow = {
    fecha: string;   // DD-MM-YYYY
    hora: string;    // HH:mm
    encargado: string;
    info: string;
};

type LlamadaRow = {
    fecha: string;   // DD-MM-YYYY
    hora: string;    // HH:mm
    celularCorreo: string;
    aQuien: string;
    observaciones: string;
};

@Component({
    selector: 'app-seguimiento',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
    ],
    templateUrl: './seguimiento.component.html',
    styleUrl: './seguimiento.component.scss',
})
export class SeguimientoComponent {
    expediente = {
        expediente: '71818',
        tipo: 'DPR',
        nombres: 'Juan Andres Lopez Herbas',
        celular: '63878701',
        correo: 'juanLopez@gmail.com',
    };

    // Demo inicial (ahora DD-MM-YYYY)
    seguimientos: SeguimientoRow[] = [
        {
            fecha: '15-01-2024',
            hora: '14:15',
            encargado: 'Velasco',
            info:
                'Se indica que debe traer maleta dañada, una ves lo deje la reposicion demora de 10 a 15 dias habiles.',
        },
        {
            fecha: '16-01-2024',
            hora: '15:26',
            encargado: 'Montaño',
            info: 'se ingreso formulario de contenido de equipaje',
        },
    ];

    llamadas: LlamadaRow[] = [
        {
            fecha: '15-01-2024',
            hora: '14:15',
            celularCorreo: '65252145',
            aQuien: 'juan pablo Laime',
            observaciones: '',
        },
        {
            fecha: '16-01-2024',
            hora: '15:26',
            celularCorreo: '65252145',
            aQuien: 'Maria',
            observaciones: '',
        },

    ];
    print(): void {
        window.print();
    }
    // ---------- helpers de fecha/hora ----------
    private clamp(n: number, min: number, max: number): number {
        if (Number.isNaN(n)) return min;
        return Math.min(Math.max(n, min), max);
    }

    private isLeap(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    private daysInMonth(month: number, year: number): number {
        if (month === 2) return this.isLeap(year) ? 29 : 28;
        return [4, 6, 9, 11].includes(month) ? 30 : 31;
    }

    private todayDDMMYYYY(): string {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const y = d.getFullYear();
        return `${dd}-${mm}-${y}`;
    }

    private nowHM(): string {
        const d = new Date();
        const h = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${mi}`;
    }

    // ---------- agregar / eliminar ----------
    addSeguimientoRow(): void {
        this.seguimientos = [
            ...this.seguimientos,
            { fecha: this.todayDDMMYYYY(), hora: this.nowHM(), encargado: '', info: '' },
        ];
    }

    addLlamadaRow(): void {
        this.llamadas = [
            ...this.llamadas,
            {
                fecha: this.todayDDMMYYYY(),
                hora: this.nowHM(),
                celularCorreo: '',
                aQuien: '',
                observaciones: '',
            },
        ];
    }

    removeSeguimientoRow(i: number): void {
        this.seguimientos = this.seguimientos.filter((_, idx) => idx !== i);
    }

    removeLlamadaRow(i: number): void {
        this.llamadas = this.llamadas.filter((_, idx) => idx !== i);
    }

    trackByIndex(_: number): number {
        return _;
    }

    // ---------- enmascarado + validación de FECHA (DD-MM-YYYY, año <= 2025) ----------
    onDateInput(e: Event, obj: any, field: 'fecha'): void {
        const input = e.target as HTMLInputElement;
        const digits = input.value.replace(/\D+/g, '').slice(0, 8); // DDM MYYYY
        let dRaw = digits.slice(0, 2);
        let mRaw = digits.slice(2, 4);
        let yRaw = digits.slice(4, 8);

        // Clamp progresivo
        if (dRaw.length === 2) dRaw = String(this.clamp(+dRaw, 1, 31)).padStart(2, '0');
        if (mRaw.length === 2) mRaw = String(this.clamp(+mRaw, 1, 12)).padStart(2, '0');
        if (yRaw.length > 0) {
            let yNum = +yRaw;
            // rango razonable 1900..2025
            yNum = this.clamp(yNum, 1900, 2025);
            yRaw = String(yNum).padStart(4, '0').slice(0, 4);
        }

        // Si ya hay mes y año completos, ajustar día al mes real
        if (dRaw.length === 2 && mRaw.length === 2 && yRaw.length === 4) {
            const maxDay = this.daysInMonth(+mRaw, +yRaw);
            dRaw = String(this.clamp(+dRaw, 1, maxDay)).padStart(2, '0');
        }

        // Armar salida con guiones
        let out = dRaw;
        if (mRaw) out += `-${mRaw}`;
        if (yRaw) out += `-${yRaw}`;

        obj[field] = out;
        input.value = out;
    }

    // ---------- enmascarado + validación de HORA (HH:mm, 00..23 / 00..59) ----------
    onTimeInput(e: Event, obj: any, field: 'hora'): void {
        const input = e.target as HTMLInputElement;
        const digits = input.value.replace(/\D+/g, '').slice(0, 4); // HHMM
        let hRaw = digits.slice(0, 2);
        let mRaw = digits.slice(2, 4);

        if (hRaw.length === 2) hRaw = String(this.clamp(+hRaw, 0, 23)).padStart(2, '0');
        if (mRaw.length === 2) mRaw = String(this.clamp(+mRaw, 0, 59)).padStart(2, '0');

        let out = hRaw;
        if (mRaw) out += `:${mRaw}`;

        obj[field] = out;
        input.value = out;
    }
}
