import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { FollowService, FollowEntryDto, ClaimViewDto } from 'app/modules/baggage/services/follow.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

type Canal = 'whatsapp' | 'email' | 'nota';

type SeguimientoRow = {
    fecha: string; // DD-MM-YYYY
    hora: string; // HH:mm
    encargado: string;
    info: string;
    canal?: Canal;
    locked?: boolean;
    sentAt?: string;
    to?: string;
};

type LlamadaRow = {
    fecha: string; // DD-MM-YYYY
    hora: string; // HH:mm
    celularCorreo: string;
    aQuien: string;
    observaciones: string;
    locked?: boolean;
    obsTouched?: boolean;
    sentAt?: string;
    autoObs?: string;
};

@Component({
    selector: 'confirm-send-dialog',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, MatDividerModule],
    template: `
    <h2 mat-dialog-title style="display:flex;align-items:center;gap:8px">
      <mat-icon>{{ data.canal === 'whatsapp' ? 'sms' : (data.canal === 'email' ? 'mail' : 'event_note') }}</mat-icon>
      {{ data.canal === 'nota' ? 'Confirmar guardado de nota' : 'Confirmar envío' }}
    </h2>

    <div mat-dialog-content>
      <div *ngIf="data.canal !== 'nota'" style="margin-bottom:8px">
        <div><strong>Destino:</strong> {{ data.to }}</div>
        <div><strong>Canal:</strong> {{ data.canal | uppercase }}</div>
      </div>

      <mat-divider></mat-divider>

      <div style="margin-top:12px">
        <div style="font-weight:600;margin-bottom:6px;">Mensaje a enviar/guardar:</div>
        <pre style="white-space:pre-wrap;margin:0">{{ data.message }}</pre>
      </div>
    </div>

    <div mat-dialog-actions style="justify-content:flex-end">
      <button mat-button (click)="close(false)">Cancelar</button>
      <button mat-flat-button color="primary" (click)="close(true)">
        {{ data.canal === 'nota' ? 'Guardar' : 'Enviar' }}
      </button>
    </div>
  `,
})
export class ConfirmSendDialogComponent {
    constructor(
        private ref: MatDialogRef<ConfirmSendDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { canal: Canal; to?: string; message: string }
    ) {}
    close(ok: boolean) {
        this.ref.close(ok);
    }
}

@Component({
    selector: 'app-seguimiento',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatDialogModule,
        MatButtonToggleModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatChipsModule,
    ],
    templateUrl: './follow.component.html',
    styleUrl: './follow.component.scss',
})
export class FollowComponent implements OnInit {
    loading = false;

    expediente = {
        expediente: '',
        tipo: '',
        nombres: '',
        celular: '',
        correo: '',
    };

    seguimientos: SeguimientoRow[] = [];
    llamadas: LlamadaRow[] = [];

    currentUserName = '';

    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        private followService: FollowService,
        private dialog: MatDialog,
        private snack: MatSnackBar
    ) {}

    async ngOnInit(): Promise<void> {
        // ✅ Usuario autenticado (para precargar "Encargado")
        this.userService.user$.subscribe((user: User) => {
            // si tu User no tiene "name", cambia por la propiedad real (ej: firstName/lastName)
            this.currentUserName = (user as any)?.name || (user as any)?.email || '';
        });

        // PIR
        const pir = this.route.snapshot.paramMap.get('pir') ?? '';
        if (!pir) {
            this.snack.open('Falta el PIR en la URL.', 'Cerrar', { duration: 3000 });
            return;
        }

        await this.loadFromBackend(pir);
    }

    private async loadFromBackend(pir: string): Promise<void> {
        this.loading = true;

        try {
            const response: ClaimViewDto = await firstValueFrom(this.followService.getClaimViewByPir(pir));
            console.log('CLAIM VIEW RESPONSE =>', response);

            // expediente
            this.expediente = {
                expediente: response.pirNumber,
                tipo: response.claimType,
                nombres: response.pasajero ?? `${response.passengerLastName} ${response.passengerName}`,
                celular: (response.temporaryPhone || response.permanentPhone || '') as string,
                correo: '', // ⚠️ tu backend no lo manda todavía (por eso sale vacío)
            };

            const entries = response.follow?.entries ?? response.claim?.follow?.entries ?? [];
            const sorted = [...entries].sort((a, b) => new Date(a.eventAt).getTime() - new Date(b.eventAt).getTime());

            this.seguimientos = sorted
                .filter((e) => e.channel !== 'CALL')
                .map((e) => {
                    const row = this.toSeguimientoRow(e);
                    if (!row.encargado) row.encargado = this.currentUserName;
                    return row;
                });

            this.llamadas = sorted.filter((e) => e.channel === 'CALL').map((e) => this.toLlamadaRow(e));

            // si viene vacío, deja 1 fila
            if (this.seguimientos.length === 0) {
                this.seguimientos = [
                    { fecha: this.todayDDMMYYYY(), hora: this.nowHM(), encargado: this.currentUserName, info: '', locked: false, canal: 'nota' },
                ];
            }
            if (this.llamadas.length === 0) {
                this.llamadas = [{ fecha: this.todayDDMMYYYY(), hora: this.nowHM(), celularCorreo: '', aQuien: '', observaciones: '', locked: false }];
            }
        } catch (err) {
            console.error(err);
            this.snack.open('No se pudo cargar el seguimiento. Verifica el PIR o el backend.', 'Cerrar', { duration: 3500 });
        } finally {
            this.loading = false;
        }
    }

    // ------------------ MAPPERS ------------------

    private toSeguimientoRow(e: FollowEntryDto): SeguimientoRow {
        const { fecha, hora } = this.isoToFechaHora(e.eventAt);

        return {
            fecha,
            hora,
            encargado: e.performedByName ?? '',
            info: e.message ?? '',
            canal: this.backendChannelToCanal(e.channel),
            locked: e.status !== 'PENDING',
            sentAt: e.createdAt,
            to: e.contact ?? undefined,
        };
    }

    private toLlamadaRow(e: FollowEntryDto): LlamadaRow {
        const { fecha, hora } = this.isoToFechaHora(e.eventAt);

        return {
            fecha,
            hora,
            celularCorreo: e.contact ?? '',
            aQuien: '',
            observaciones: e.message ?? '',
            locked: e.status !== 'PENDING',
            sentAt: e.createdAt,
            obsTouched: true,
            autoObs: '',
        };
    }

    private backendChannelToCanal(ch: 'NOTE' | 'WHATSAPP' | 'EMAIL' | 'CALL'): Canal | undefined {
        if (ch === 'WHATSAPP') return 'whatsapp';
        if (ch === 'EMAIL') return 'email';
        if (ch === 'NOTE') return 'nota';
        return undefined;
    }

    private isoToFechaHora(iso: string): { fecha: string; hora: string } {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return { fecha: `${dd}-${mm}-${yyyy}`, hora: `${hh}:${mi}` };
    }

    // ------------------ UI HELPERS ------------------

    print(): void {
        window.print();
    }

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

    addSeguimientoRow(): void {
        this.seguimientos = [
            ...this.seguimientos,
            { fecha: this.todayDDMMYYYY(), hora: this.nowHM(), encargado: this.currentUserName, info: '', locked: false, canal: 'nota' },
        ];
    }

    addLlamadaRow(): void {
        const base: LlamadaRow = {
            fecha: this.todayDDMMYYYY(),
            hora: this.nowHM(),
            celularCorreo: '',
            aQuien: '',
            observaciones: this.generateObs(''),
            locked: false,
            obsTouched: false,
            autoObs: this.generateObs(''),
        };
        this.llamadas = [...this.llamadas, base];
    }

    removeSeguimientoRow(i: number): void {
        this.seguimientos = this.seguimientos.filter((_, idx) => idx !== i);
    }

    removeLlamadaRow(i: number): void {
        this.llamadas = this.llamadas.filter((_, idx) => idx !== i);
    }

    trackByIndex(i: number): number {
        return i;
    }

    onDateInput(e: Event, obj: any, field: 'fecha'): void {
        const input = e.target as HTMLInputElement;
        const digits = input.value.replace(/\D+/g, '').slice(0, 8);
        let dRaw = digits.slice(0, 2);
        let mRaw = digits.slice(2, 4);
        let yRaw = digits.slice(4, 8);

        if (dRaw.length === 2) dRaw = String(this.clamp(+dRaw, 1, 31)).padStart(2, '0');
        if (mRaw.length === 2) mRaw = String(this.clamp(+mRaw, 1, 12)).padStart(2, '0');
        if (yRaw.length > 0) {
            let yNum = +yRaw;
            yNum = this.clamp(yNum, 1900, 2025);
            yRaw = String(yNum).padStart(4, '0').slice(0, 4);
        }

        if (dRaw.length === 2 && mRaw.length === 2 && yRaw.length === 4) {
            const maxDay = this.daysInMonth(+mRaw, +yRaw);
            dRaw = String(this.clamp(+dRaw, 1, maxDay)).padStart(2, '0');
        }

        let out = dRaw;
        if (mRaw) out += `-${mRaw}`;
        if (yRaw) out += `-${yRaw}`;

        obj[field] = out;
        input.value = out;
    }

    onTimeInput(e: Event, obj: any, field: 'hora'): void {
        const input = e.target as HTMLInputElement;
        const digits = input.value.replace(/\D+/g, '').slice(0, 4);
        let hRaw = digits.slice(0, 2);
        let mRaw = digits.slice(2, 4);

        if (hRaw.length === 2) hRaw = String(this.clamp(+hRaw, 0, 23)).padStart(2, '0');
        if (mRaw.length === 2) mRaw = String(this.clamp(+mRaw, 0, 59)).padStart(2, '0');

        let out = hRaw;
        if (mRaw) out += `:${mRaw}`;

        obj[field] = out;
        input.value = out;
    }

    onCanalChange(s: SeguimientoRow): void {
        if (!s?.canal) return;

        const nombre = this.expediente.nombres;
        const exp = `${this.expediente.tipo}-${this.expediente.expediente}`;

        if (s.canal === 'whatsapp' || s.canal === 'email') {
            s.info =
                `Se le envió mensaje con el siguiente contenido: ` +
                `"Señor/a ${nombre}, le hablamos por el reclamo de su maleta (Exp. ${exp}). ` +
                `Se le informa que . Que tenga un buen día."`;
        } else {
            s.info = `Atención en oficina: Se brindó información al pasajero ${nombre} respecto a su reclamo (Exp. ${exp}). Detalle:  .`;
        }
    }

    canConfirm(s: SeguimientoRow): boolean {
        if (!s || s.locked) return false;
        if (!s.canal) return false;

        const msg = this.extractQuotedOrAll(s.info).trim();
        if (!msg) return false;

        if (s.canal === 'whatsapp') return !!this.expediente.celular;
        if (s.canal === 'email') return !!this.expediente.correo;
        return true;
    }

    statusLabel(s: SeguimientoRow): string {
        if (!s.locked) return '';
        if (s.canal === 'whatsapp') return 'Enviado por WhatsApp';
        if (s.canal === 'email') return 'Enviado por Email';
        return 'Guardado (nota)';
    }

    private getDestino(s: SeguimientoRow): string | undefined {
        if (s.canal === 'whatsapp') return this.expediente.celular;
        if (s.canal === 'email') return this.expediente.correo;
        return undefined;
    }

    private extractQuotedOrAll(text: string): string {
        if (!text) return '';
        const m = text.match(/"([^"]+)"/);
        return m ? m[1] : text;
    }

    // ✅ AQUI ESTÁ EL CAMBIO CLAVE: ENVÍA AL BACKEND REAL (/notify/whatsapp y /notify/email)
    async confirmRow(i: number): Promise<void> {
        const s = this.seguimientos[i];
        if (!s || !s.canal) return;

        const message = this.extractQuotedOrAll(s.info).trim();
        const to = this.getDestino(s);

        const dlg = this.dialog.open(ConfirmSendDialogComponent, {
            width: '560px',
            data: { canal: s.canal, to, message },
        });

        const ok = await firstValueFrom(dlg.afterClosed());
        if (!ok) return;

        try {
            if (s.canal === 'whatsapp') {
                if (!to) throw new Error('No hay número de celular del pasajero.');
                await firstValueFrom(this.followService.sendWhatsApp({ to, message }));
            } else if (s.canal === 'email') {
                if (!to) throw new Error('No hay correo del pasajero.');
                const subject = `Seguimiento de reclamo de equipaje ${this.expediente.tipo}-${this.expediente.expediente}`;
                await firstValueFrom(this.followService.sendEmail({ to, subject, message }));
            } else {
                // nota: por ahora solo local
            }

            s.locked = true;
            s.sentAt = new Date().toISOString();
            s.to = to;

            this.snack.open(s.canal === 'nota' ? 'Nota guardada.' : 'Mensaje enviado y fila bloqueada.', 'OK', { duration: 2500 });
        } catch (err: any) {
            console.error(err);
            this.snack.open(err?.error?.message || err?.message || 'No se pudo completar la acción.', 'Cerrar', { duration: 3500 });
        }
    }

    onAQuienInput(c: LlamadaRow): void {
        if (!c) return;

        const auto = this.generateObs(c.aQuien);
        const current = (c.observaciones || '').trim();
        const lastAuto = (c.autoObs || '').trim();

        if (!c.obsTouched || current === lastAuto || current === '') {
            c.observaciones = auto;
        }
        c.autoObs = auto;
    }

    onObservacionesInput(c: LlamadaRow): void {
        if (!c) return;
        c.obsTouched = true;
    }

    canConfirmLlamada(c: LlamadaRow): boolean {
        if (!c || c.locked) return false;
        return !!((c.aQuien && c.aQuien.trim()) || (c.observaciones && c.observaciones.trim()));
    }

    async confirmLlamada(i: number): Promise<void> {
        const c = this.llamadas[i];
        if (!c) return;

        const nombre = (c.aQuien || '').trim();
        const mensaje = c.observaciones && c.observaciones.trim() ? c.observaciones.trim() : nombre ? `Se hizo una llamada al ${nombre}.` : 'Se registró una llamada.';

        const dlg = this.dialog.open(ConfirmSendDialogComponent, {
            width: '560px',
            data: { canal: 'nota', message: mensaje },
        });

        const ok = await firstValueFrom(dlg.afterClosed());
        if (!ok) return;

        c.locked = true;
        c.sentAt = new Date().toISOString();
        this.snack.open('Registro de llamada guardado y bloqueado.', 'OK', { duration: 2500 });
    }

    private generateObs(aQuien: string): string {
        const nombre = (aQuien || '').trim();
        return nombre ? `Se hizo una llamada al ${nombre}.` : 'Se registró una llamada.';
    }

    autoGrow(ev: Event): void {
        const el = ev.target as HTMLTextAreaElement;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }
}
