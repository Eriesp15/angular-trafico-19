import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RepairLogisticsService {
    private baseUrl = 'http://localhost:3700/api/v1';

    constructor(private http: HttpClient) {}

    getClaimFlowDataById(id: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/claims/flow/${id}`);
    }

    getRepairCompanies(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/companies?serviceType=REPAIR`);
    }

    saveAction(payload: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/pir/action`, payload);
    }

    saveActionMultipart(formData: FormData): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/pir/action`, formData);
    }
}
