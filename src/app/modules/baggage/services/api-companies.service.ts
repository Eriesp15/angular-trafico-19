import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceType {
    id: string;
    name: string;
    isActive: boolean;
}

export interface Company {
    id: string;
    name: string;
    businessName: string;
    phone: string;
    email: string;
    address: string;
    isActive: boolean;
    serviceTypeId: string;
    serviceType?: ServiceType;
}

@Injectable({
    providedIn: 'root',
})
export class ApiCompaniesService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:3700/api/v1/companies';

    getServiceTypes(active?: boolean): Observable<ServiceType[]> {
        let params = new HttpParams();

        if (active !== undefined) {
            params = params.set('active', active);
        }

        return this.http.get<ServiceType[]>(`${this.baseUrl}/service-types`, { params });
    }

    createServiceType(body: { name: string; isActive?: boolean }): Observable<ServiceType> {
        return this.http.post<ServiceType>(`${this.baseUrl}/service-types`, body);
    }

    updateServiceType(
        id: string,
        body: { name?: string; isActive?: boolean }
    ): Observable<ServiceType> {
        return this.http.patch<ServiceType>(`${this.baseUrl}/service-types/${id}`, body);
    }

    updateServiceTypeStatus(id: string, isActive: boolean): Observable<ServiceType> {
        return this.http.patch<ServiceType>(
            `${this.baseUrl}/service-types/${id}/status`,
            { isActive }
        );
    }

    getCompanies(active?: boolean, serviceTypeId?: string): Observable<Company[]> {
        let params = new HttpParams();

        if (active !== undefined) {
            params = params.set('active', active);
        }

        if (serviceTypeId) {
            params = params.set('serviceTypeId', serviceTypeId);
        }

        return this.http.get<Company[]>(this.baseUrl, { params });
    }

    getCompanyById(id: string): Observable<Company> {
        return this.http.get<Company>(`${this.baseUrl}/${id}`);
    }

    createCompany(body: {
        name: string;
        businessName: string;
        phone: string;
        email: string;
        address: string;
        serviceTypeId: string;
        isActive?: boolean;
    }): Observable<Company> {
        return this.http.post<Company>(this.baseUrl, body);
    }

    updateCompany(
        id: string,
        body: {
            name?: string;
            businessName?: string;
            phone?: string;
            email?: string;
            address?: string;
            serviceTypeId?: string;
            isActive?: boolean;
        }
    ): Observable<Company> {
        return this.http.patch<Company>(`${this.baseUrl}/${id}`, body);
    }

    updateCompanyStatus(id: string, isActive: boolean): Observable<Company> {
        return this.http.patch<Company>(`${this.baseUrl}/${id}/status`, { isActive });
    }
}
