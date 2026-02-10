import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type FollowEntryDto = {
    id: string;

    kind: 'ACTIVITY' | 'COMMUNICATION';
    channel: 'NOTE' | 'WHATSAPP' | 'EMAIL' | 'CALL';

    title?: string | null;
    message: string;

    eventAt: string; // ISO
    performedByName?: string | null;

    contact?: string | null;
    followUpAt?: string | null;

    status: 'SAVED' | 'SENT' | 'PENDING';

    createdAt: string;
    updatedAt?: string;
    confirmedAt?: string;
};

export type ClaimViewDto = {
    pirNumber: string;
    claimType: string;
    passengerLastName: string;
    passengerName: string;
    pasajero?: string;

    permanentPhone?: string | null;
    temporaryPhone?: string | null;

    follow?: { entries: FollowEntryDto[] };
    claim?: { follow?: { entries: FollowEntryDto[] } };

    claimStatus?: string;
};

export type UpsertFollowEntryDto = {
    kind: 'ACTIVITY' | 'COMMUNICATION';
    channel: 'NOTE' | 'WHATSAPP' | 'EMAIL' | 'CALL';
    message: string;
    eventAt: string; // ISO
    performedByName?: string;
    contact?: string; // phone/email
    title?: string;
    followUpAt?: string; // ISO
};

export type ConfirmFollowEntryDto = {
    contact?: string;
};

@Injectable({ providedIn: 'root' })
export class FollowService {
    private api = 'http://localhost:3700/api/v1';

    constructor(private http: HttpClient) {}

    getClaimViewByPir(pir: string): Observable<ClaimViewDto> {
        return this.http.get<ClaimViewDto>(`${this.api}/claims/view/${pir}`);
    }

    // ===========================
    // ✅ AUTOSAVE (DRAFT)
    // ===========================

    createDraft(pirNumber: string, body: any): Observable<any> {
        return this.http.post<any>(`${this.api}/follow/${pirNumber}/draft`, body);
    }

    updateDraft(entryId: string, body: any): Observable<any> {
        return this.http.patch<any>(`${this.api}/follow/draft/${entryId}`, body);
    }

    deleteDraft(entryId: string): Observable<any> {
        return this.http.delete(`${this.api}/follow/draft/${entryId}`);
    }

    confirm(entryId: string, status: 'SENT' | 'SAVED', dto: ConfirmFollowEntryDto): Observable<FollowEntryDto> {
        return this.http.post<FollowEntryDto>(`${this.api}/follow/confirm/${entryId}/${status}`, dto);
    }

    // ===========================
    // ✅ NOTIFY (Twilio/Email)
    // (Ya te funciona en Swagger)
    // ===========================

    sendWhatsApp(body: { to: string; message: string }): Observable<any> {
        return this.http.post(`${this.api}/notify/whatsapp`, body);
    }

    sendEmail(body: { to: string; subject: string; message: string }): Observable<any> {
        return this.http.post(`${this.api}/notify/email`, body);
    }
}
