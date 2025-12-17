import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ApiClaimService {
    private api = 'http://localhost:3700/api/v1';

    constructor(private http: HttpClient) {}

    getClaimByPir(pir: string): Observable<any> {
        return this.http.get(`${this.api}/claims/view/${pir}`);
    }

    getClaimsList(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/claims/list`);
    }


    getTimeline(id: number): Observable<any> {
        return this.http.get(`${this.api}/claims/${id}/timeline`);
    }

    uploadDocuments(id: number, files: File[]): Observable<any> {
        const form = new FormData();
        files.forEach(f => form.append('files', f));
        return this.http.post(`${this.api}/claim-document/${id}`, form);
    }

    addLog(claimId: number, body: any): Observable<any> {
        return this.http.post(`${this.api}/claim-log`, body);
    }

    closeClaim(pir: string, body: any) {
        return this.http.post(`${this.api}/claims/${pir}/close`, body);
    }
}
