import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export type NotifyWhatsAppReq = { to: string; message: string };
export type NotifyEmailReq = { to: string; subject: string; message: string };

export type FollowEntryDto = {
    id: string;
    kind: 'ACTIVITY' | 'COMMUNICATION';
    channel: 'NOTE' | 'WHATSAPP' | 'EMAIL' | 'CALL';
    title?: string | null;
    message: string;
    eventAt: string;
    performedByName?: string | null;
    contact?: string | null;
    followUpAt?: string | null;
    status: 'SAVED' | 'SENT' | 'PENDING';
    createdAt: string;
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

@Injectable({ providedIn: 'root' })
export class FollowService {
    private api = 'http://localhost:3700/api/v1';

    constructor(private http: HttpClient) {}

    getClaimViewByPir(pir: string): Observable<ClaimViewDto> {
        return this.http.get<ClaimViewDto>(`${this.api}/claims/view/${pir}`);
    }
    //  WhatsApp
    sendWhatsApp(body: NotifyWhatsAppReq): Observable<{ ok: boolean; sid?: string }> {
        return this.http.post<{ ok: boolean; sid?: string }>(`${this.api}/notify/whatsapp`, body);
    }

    //  Email
    sendEmail(body: NotifyEmailReq): Observable<{ ok: boolean; messageId?: string }> {
        return this.http.post<{ ok: boolean; messageId?: string }>(`${this.api}/notify/email`, body);
    }
}
