import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ClaimFlowService {
    private claimsUrl = 'http://localhost:3700/api/v1/claims';
    private documentsUrl = 'http://localhost:3700/api/v1/documents';

    constructor(private http: HttpClient) {}

    getClaimByPir(pirNumber: string): Observable<any> {
        return this.http.get<any>(`${this.claimsUrl}/view/${pirNumber}`);
    }

    getDocumentsByPir(pirNumber: string): Observable<any> {
        return this.http.get<any>(`${this.documentsUrl}/${pirNumber}`);
    }

    uploadDocument(pirNumber: string, formData: FormData): Observable<any> {
        return this.http.post<any>(`${this.documentsUrl}/upload/${pirNumber}`, formData);
    }

    deleteDocument(documentId: string): Observable<any> {
        return this.http.delete<any>(`${this.documentsUrl}/${documentId}`);
    }
}
