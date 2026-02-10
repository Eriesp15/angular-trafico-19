import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
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
import { firstValueFrom, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import {
    FollowService,
    FollowEntryDto,
    ClaimViewDto,
    UpsertFollowEntryDto
} from 'app/modules/baggage/services/follow.service';

import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

type Canal = 'whatsapp' | 'email' | 'nota';

type SeguimientoRow = {
    id?: string; // ✅ id del FollowEntry en BD (clave para autosave)
    fecha: string; // DD-MM-YYYY (solo UI)
    hora: string;  // HH:mm (solo UI)
    encargado: string;
    info: string;
    canal?: Canal;

    locked?: boolean;
    to?: string;

    createdAt?: string;
    updatedAt?: string;
    confirmedAt?: string;

    __saving?: boolean; // UI flag
};

type LlamadaRow = {
    id?: string;
    fecha: string;
    hora: string;
    celularCorreo: string;
    aQuien: string;
    observaciones: string;

    locked?: boolean;
    createdAt?: string;
    updatedAt?: string;
    confirmedAt?: string;

    __saving?: boolean;
    obsTouched?: boolean;
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
                <div style="font-weight:600;margin-bottom:6px;">Mensaje:</div>
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
    close(ok: boolean) { this.ref.close(ok); }
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
export class FollowComponent implements OnInit, OnDestroy {
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
    pirNumber = '';

    // ✅ cola de autosave (seguimientos)
    private saveSeguimiento$ = new Subject<SeguimientoRow>();
    // ✅ cola de autosave (llamadas)
    private saveLlamada$ = new Subject<LlamadaRow>();
    private destroy$ = new Subject<void>();

    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        private followService: FollowService,
        private dialog: MatDialog,
        private snack: MatSnackBar
    ) {}

    async ngOnInit(): Promise<void> {
        // Usuario autenticado
        this.userService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe((user: User) => {
                this.currentUserName = (user as any)?.name || (user as any)?.email || '';
            });

        // ✅ configurar autosave con debounce
        this.saveSeguimiento$
            .pipe(
                debounceTime(700),
                distinctUntilChanged((a, b) => JSON.stringify(this.rowToDraftDto(a)) === JSON.stringify(this.rowToDraftDto(b))),
                takeUntil(this.destroy$)
            )
            .subscribe((row) => this.autosaveSeguimiento(row));

        this.saveLlamada$
            .pipe(
                debounceTime(700),
                distinctUntilChanged((a, b) => JSON.stringify(this.callToDraftDto(a)) === JSON.stringify(this.callToDraftDto(b))),
                takeUntil(this.destroy$)
            )
            .subscribe((row) => this.autosaveLlamada(row));

        // PIR
        this.pirNumber = this.route.snapshot.paramMap.get('pir') ?? '';
        if (!this.pirNumber) {
            this.snack.open('Falta el PIR en la URL.', 'Cerrar', { duration: 3000 });
            return;
        }

        await this.loadFromBackend(this.pirNumber);

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private async loadFromBackend(pir: string): Promise<void> {
        this.loading = true;

        try {
            const response: ClaimViewDto = await firstValueFrom(this.followService.getClaimViewByPir(pir));

            // expediente
            this.expediente = {
                expediente: response.pirNumber,
                tipo: response.claimType,
                nombres: response.pasajero ?? `${response.passengerLastName} ${response.passengerName}`,
                celular: (response.temporaryPhone || response.permanentPhone || '') as string,
                correo: '', // si luego agregas email al backend lo conectas
            };

            const entries = response.follow?.entries ?? response.claim?.follow?.entries ?? [];
            const sorted = [...entries].sort((a, b) => new Date(a.eventAt).getTime() - new Date(b.eventAt).getTime());

            this.seguimientos = sorted
                .filter((e) => e.channel !== 'CALL')
                .map((e) => this.toSeguimientoRow(e));

            this.llamadas = sorted
                .filter((e) => e.channel === 'CALL')
                .map((e) => this.toLlamadaRow(e));

            // si viene vacío, deja 1 fila
            if (this.seguimientos.length === 0) {
                this.seguimientos = [
                    { fecha: this.todayDDMMYYYY(), hora: this.nowHM(), encargado: this.currentUserName, info: '', locked: false, canal: 'nota' },
                ];
            }
            if (this.llamadas.length === 0) {
                this.llamadas = [
                    { fecha: this.todayDDMMYYYY(), hora: this.nowHM(), celularCorreo: '', aQuien: '', observaciones: '', locked: false },
                ];
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
            id: e.id,
            fecha,
            hora,
            encargado: e.performedByName ?? this.currentUserName,
            info: e.message ?? '',
            canal: this.backendChannelToCanal(e.channel),
            locked: e.status !== 'PENDING',
            to: e.contact ?? undefined,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
            confirmedAt: e.confirmedAt,
        };
    }

    private toLlamadaRow(e: FollowEntryDto): LlamadaRow {
        const { fecha, hora } = this.isoToFechaHora(e.eventAt);

        return {
            id: e.id,
            fecha,
            hora,
            celularCorreo: e.contact ?? '',
            aQuien: '',
            observaciones: e.message ?? '',
            locked: e.status !== 'PENDING',
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
            confirmedAt: e.confirmedAt,
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

    private canalToBackendChannel(c: Canal): 'NOTE' | 'WHATSAPP' | 'EMAIL' {
        if (c === 'whatsapp') return 'WHATSAPP';
        if (c === 'email') return 'EMAIL';
        return 'NOTE';
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

    // ------------------ AUTOSAVE HOOKS (se llaman desde HTML) ------------------

    onSeguimientoChange(row: SeguimientoRow): void {
        if (row.locked) return;
        // auto-encargado si está vacío
        if (!row.encargado) row.encargado = this.currentUserName;
        this.saveSeguimiento$.next(row);
    }

    onLlamadaChange(row: LlamadaRow): void {
        if (row.locked) return;
        this.saveLlamada$.next(row);
    }

    // ------------------ AUTOSAVE IMPLEMENTATION ------------------

    private rowToDraftDto(s: SeguimientoRow): UpsertFollowEntryDto {
        const iso = this.ddmmyyyyHMToIso(s.fecha, s.hora);
        const canal: Canal = s.canal ?? 'nota';

        return {
            kind: 'COMMUNICATION',
            channel: this.canalToBackendChannel(canal),
            message: (s.info || '').trim(),
            eventAt: iso,
            performedByName: (s.encargado || this.currentUserName || '').trim(),
            contact: canal === 'nota' ? undefined : this.getDestinoFromCanal(canal),
            title: null as any,
            followUpAt: undefined,
        };
    }

    private callToDraftDto(c: LlamadaRow): UpsertFollowEntryDto {
        const iso = this.ddmmyyyyHMToIso(c.fecha, c.hora);
        const msg = (c.observaciones || '').trim() || this.generateObs(c.aQuien);

        return {
            kind: 'COMMUNICATION',
            channel: 'CALL',
            message: msg,
            eventAt: iso,
            performedByName: this.currentUserName,
            contact: (c.celularCorreo || '').trim() || undefined,
            title: null as any,
            followUpAt: undefined,
        };
    }

    // ======================
// AUTOSAVE (DRAFT)
// ======================
    private async autosaveSeguimiento(row: any): Promise<void> {
        try {
            // arma el DTO que espera tu backend
            const dto = {
                kind: 'COMMUNICATION' as const,
                channel:
                    row.canal === 'whatsapp'
                        ? ('WHATSAPP' as const)
                        : row.canal === 'email'
                            ? ('EMAIL' as const)
                            : ('NOTE' as const),
                message: (row.info || '').trim(),
                eventAt: this.toIso(row.fecha, row.hora),
                performedByName: (row.encargado || this.currentUserName || '').trim(),
                contact: row.canal === 'whatsapp' ? this.expediente.celular : row.canal === 'email' ? this.expediente.correo : undefined,
                title: null,
                followUpAt: null,
            };

            // ✅ si no hay nada, no guardamos (evita basura)
            const hasSomething =
                (dto.message && dto.message.length > 0) ||
                (row.canal != null) ||
                (dto.performedByName && dto.performedByName.length > 0);

            if (!hasSomething) return;

            // ✅ si todavía no existe en BD => CREATE DRAFT
            if (!row.id) {
                const resp = await firstValueFrom(
                    this.followService.createDraft(this.expediente.expediente, dto as any)
                );

                // resp ES FollowEntryDto
                row.id = resp.id;
                row.createdAt = (resp as any).createdAt;   // si tu DTO lo incluye
                row.updatedAt = (resp as any).updatedAt;   // si tu DTO lo incluye
                return;
            }
            // ✅ si ya existe => UPDATE DRAFT
            const upd = await firstValueFrom(
                this.followService.updateDraft(row.id, dto as any)
            );

            // upd ES FollowEntryDto
            row.updatedAt = (upd as any).updatedAt || row.updatedAt;

        } catch (e: any) {
            console.error('AUTOSAVE ERROR =>', e);
            console.error('AUTOSAVE ERROR STATUS =>', e?.status);
            console.error('AUTOSAVE ERROR BODY =>', e?.error);
            this.snack.open(
                e?.error?.message || e?.error?.error || 'No se pudo autosalvar el seguimiento (draft).',
                'Cerrar',
                { duration: 3500 }
            );
        }
    }


    private async autosaveLlamada(row: LlamadaRow): Promise<void> {
        const dto = this.callToDraftDto(row);
        if (!dto.message) return;

        try {
            row.__saving = true;

            if (!row.id) {

                const created = await firstValueFrom(this.followService.createDraft(this.pirNumber, dto));
                row.id = created.id;
                row.createdAt = created.createdAt;
                row.updatedAt = created.updatedAt;
            } else {
                const updated = await firstValueFrom(this.followService.updateDraft(row.id, dto));
                row.updatedAt = updated.updatedAt;
            }
        } catch (e: any) {
            console.error(e);
            this.snack.open('No se pudo autosalvar la llamada (draft).', 'Cerrar', { duration: 2500 });
        } finally {
            row.__saving = false;
        }
    }
    private toIso(fechaDDMMYYYY: string, horaHHmm: string): string {
        // "09-02-2026" + "12:30" -> ISO
        const [dd, mm, yyyy] = (fechaDDMMYYYY || '').split('-').map(x => +x);
        const [hh, mi] = (horaHHmm || '').split(':').map(x => +x);
        const d = new Date(yyyy || 1970, (mm || 1) - 1, dd || 1, hh || 0, mi || 0, 0);
        return d.toISOString();
    }

    // ------------------ ADD/REMOVE ------------------

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

    async removeSeguimientoRow(i: number): Promise<void> {
        const row = this.seguimientos[i];
        // si ya existe draft en BD y no está locked -> borrar draft
        if (row?.id && !row.locked) {
            try { await firstValueFrom(this.followService.deleteDraft(row.id)); } catch {}
        }
        this.seguimientos = this.seguimientos.filter((_, idx) => idx !== i);
    }

    async removeLlamadaRow(i: number): Promise<void> {
        const row = this.llamadas[i];
        if (row?.id && !row.locked) {
            try { await firstValueFrom(this.followService.deleteDraft(row.id)); } catch {}
        }
        this.llamadas = this.llamadas.filter((_, idx) => idx !== i);
    }

    trackByIndex(i: number): number {
        return i;
    }

    // ------------------ INPUT FORMATTERS ------------------

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
            yNum = this.clamp(yNum, 1900, 2099);
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

    // ------------------ CANAL / CONFIRM ------------------

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

        this.onSeguimientoChange(s); // ✅ autosave
    }
    private async autosaveRow(row: any): Promise<void> {
        try {
            // No autosave si está bloqueado
            if (row.locked) return;

            // No autosave si no hay mensaje
            if (!row.info || !row.info.trim()) return;

            // 🔥 AQUÍ VA TU DTO
            const dto = {
                kind: 'COMMUNICATION' as const,
                channel:
                    row.canal === 'whatsapp' ? 'WHATSAPP' :
                        row.canal === 'email' ? 'EMAIL' :
                            row.canal === 'nota' ? 'NOTE' : 'NOTE',
                message: (row.info || '').trim(),
                eventAt: new Date().toISOString(),
                performedByName: (row.encargado || this.currentUserName || '—').trim(),
                contact:
                    row.canal === 'whatsapp' ? (this.expediente.celular || null) :
                        row.canal === 'email' ? (this.expediente.correo || null) :
                            null,
            };

            // ✅ Si NO existe id => crear draft
            if (!row.id) {
                const resp = await firstValueFrom(this.followService.createDraft(this.pirNumber, dto));
                row.id = (resp as any)?.id;        // lo que devuelve tu backend
                row.createdAt = (resp as any)?.createdAt ?? row.createdAt;
                row.updatedAt = (resp as any)?.updatedAt ?? row.updatedAt;
                return;
            }

            // ✅ Si ya existe id => actualizar draft
            const resp2 = await firstValueFrom(this.followService.updateDraft(row.id, dto));
            row.updatedAt = (resp2 as any)?.updatedAt ?? row.updatedAt;

        } catch (e: any) {
            console.error('AUTOSAVE ERROR =>', e);
            console.error('AUTOSAVE ERROR STATUS =>', e?.status);
            console.error('AUTOSAVE ERROR BODY =>', e?.error);

            this.snack.open(
                e?.error?.message || e?.error?.error || 'No se pudo autosalvar el seguimiento (draft).',
                'Cerrar',
                { duration: 3500 }
            );
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

    private getDestinoFromCanal(canal: Canal): string | undefined {
        if (canal === 'whatsapp') return this.expediente.celular;
        if (canal === 'email') return this.expediente.correo;
        return undefined;
    }

    private extractQuotedOrAll(text: string): string {
        if (!text) return '';
        const m = text.match(/"([^"]+)"/);
        return m ? m[1] : text;
    }

    async confirmRow(i: number): Promise<void> {
        const s = this.seguimientos[i];
        if (!s || !s.canal) return;

        // ✅ asegura que exista draft en BD antes de confirmar
        if (!s.id) {
            await this.autosaveSeguimiento(s);
            if (!s.id) {
                this.snack.open('Primero escribe un mensaje para guardar el borrador.', 'Cerrar', { duration: 2500 });
                return;
            }
        }

        const message = this.extractQuotedOrAll(s.info).trim();
        const to = this.getDestinoFromCanal(s.canal);

        const dlg = this.dialog.open(ConfirmSendDialogComponent, {
            width: '560px',
            data: { canal: s.canal, to, message },
        });

        const ok = await firstValueFrom(dlg.afterClosed());
        if (!ok) return;

        try {
            // 1) enviar (si aplica)
            if (s.canal === 'whatsapp') {
                if (!to) throw new Error('No hay número de celular del pasajero.');
                await firstValueFrom(this.followService.sendWhatsApp({ to, message }));
                // 2) marcar confirm SENT en BD
                const res = await firstValueFrom(this.followService.confirm(s.id!, 'SENT', { contact: to }));
                s.confirmedAt = res.confirmedAt;
                s.updatedAt = res.updatedAt;
            } else if (s.canal === 'email') {
                if (!to) throw new Error('No hay correo del pasajero.');
                const subject = `Seguimiento de reclamo ${this.expediente.tipo}-${this.expediente.expediente}`;
                await firstValueFrom(this.followService.sendEmail({ to, subject, message }));
                const res = await firstValueFrom(this.followService.confirm(s.id!, 'SENT', { contact: to }));
                s.confirmedAt = res.confirmedAt;
                s.updatedAt = res.updatedAt;
            } else {
                // nota: solo confirm SAVED en BD
                const res = await firstValueFrom(this.followService.confirm(s.id!, 'SAVED', {}));
                s.confirmedAt = res.confirmedAt;
                s.updatedAt = res.updatedAt;
            }

            s.locked = true;
            s.to = to;

            this.snack.open(s.canal === 'nota' ? 'Nota guardada en BD.' : 'Mensaje enviado y confirmado en BD.', 'OK', { duration: 2500 });
        } catch (err: any) {
            console.error(err);
            this.snack.open(err?.error?.message || err?.message || 'No se pudo confirmar.', 'Cerrar', { duration: 3500 });
        }
    }

    async confirmLlamada(i: number): Promise<void> {
        const c = this.llamadas[i];
        if (!c) return;

        // draft first
        if (!c.id) {
            await this.autosaveLlamada(c);
            if (!c.id) {
                this.snack.open('Completa observaciones para guardar borrador.', 'Cerrar', { duration: 2500 });
                return;
            }
        }

        const mensaje = (c.observaciones || '').trim() || this.generateObs(c.aQuien);

        const dlg = this.dialog.open(ConfirmSendDialogComponent, {
            width: '560px',
            data: { canal: 'nota', message: mensaje },
        });

        const ok = await firstValueFrom(dlg.afterClosed());
        if (!ok) return;

        try {
            const res = await firstValueFrom(this.followService.confirm(c.id!, 'SAVED', { contact: c.celularCorreo || undefined }));
            c.locked = true;
            c.updatedAt = res.updatedAt;
            c.confirmedAt = res.confirmedAt;
            this.snack.open('Registro de llamada guardado y confirmado en BD.', 'OK', { duration: 2500 });
        } catch (e) {
            this.snack.open('No se pudo confirmar la llamada.', 'Cerrar', { duration: 2500 });
        }
    }

    // ------------------ TEXT HELPERS ------------------

    onAQuienInput(c: LlamadaRow): void {
        if (!c) return;

        const auto = this.generateObs(c.aQuien);
        const current = (c.observaciones || '').trim();
        const lastAuto = (c.autoObs || '').trim();

        if (!c.obsTouched || current === lastAuto || current === '') {
            c.observaciones = auto;
        }
        c.autoObs = auto;

        this.onLlamadaChange(c); // ✅ autosave
    }

    onObservacionesInput(c: LlamadaRow): void {
        c.obsTouched = true;
        this.onLlamadaChange(c); // ✅ autosave
    }

    canConfirmLlamada(c: LlamadaRow): boolean {
        if (!c || c.locked) return false;
        return !!((c.aQuien && c.aQuien.trim()) || (c.observaciones && c.observaciones.trim()));
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

    // ✅ mostrar timestamps en UI
    formatIso(iso?: string): string {
        if (!iso) return '—';
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
    }

    // ------------------ DATE UTILS ------------------

    private ddmmyyyyHMToIso(fecha: string, hora: string): string {
        // fecha: DD-MM-YYYY, hora: HH:mm
        const [dd, mm, yyyy] = (fecha || '').split('-');
        const [hh, mi] = (hora || '').split(':');

        const d = new Date(
            Number(yyyy || 1970),
            Number(mm || 1) - 1,
            Number(dd || 1),
            Number(hh || 0),
            Number(mi || 0),
            0,
            0
        );
        return d.toISOString();
    }
    trackByRow(i: number, row: any): string {
        // si ya viene de BD, usa el id real
        if (row?.id) return row.id;

        // si aún no existe en BD, crea un id temporal estable
        if (!row.__tmpId) row.__tmpId = `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}-${i}`;
        return row.__tmpId;
    }


}
