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
export interface AvailableClaim {
    id: string;
    claimStatus: string;
    repairStatus?: string;
    createdAt: string;
    currentStation?: string;
    pir?: {
        id: string;
        pirNumber: string;
        claimType: string;
        passengerName?: string;
        passengerLastName?: string;
    };
}
export interface CompanyAssignment {
    id: string;
    companyId: string;
    claimId: string;
    serviceTypeId: string;
    assignmentDate: string;
    deliveryDate?: string | null;
    status: string;
    notes?: string | null;
    returnDate?: string | null;

    company?: Company;
    serviceType?: ServiceType;
    claim?: {
        id: string;
        claimStatus: string;
        repairStatus?: string;
        currentStation?: string;
        pir?: {
            id: string;
            pirNumber: string;
            claimType: string;
            passengerName?: string;
            passengerLastName?: string;
        };
    };
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
    getAvailableClaimsForCompany(serviceTypeId: string): Observable<AvailableClaim[]> {
        return this.http.get<AvailableClaim[]>(
            `${this.baseUrl}/available-claims/${serviceTypeId}`
        );
    }
    createCompanyAssignment(body: {
        companyId: string;
        claimId: string;
        deliveryDate?: string | null;
        notes?: string;
    }): Observable<CompanyAssignment> {
        return this.http.post<CompanyAssignment>(
            `${this.baseUrl}/assignments`,
            body
        );
    }
    getAssignmentsByCompany(companyId: string): Observable<CompanyAssignment[]> {
        return this.http.get<CompanyAssignment[]>(
            `${this.baseUrl}/${companyId}/assignments`
        );
    }
    deliverToRepairCompany(
        assignmentId: string,
        deliveryDate?: string
    ): Observable<CompanyAssignment> {
        return this.http.patch<CompanyAssignment>(
            `${this.baseUrl}/assignments/${assignmentId}/deliver-to-repair`,
            { deliveryDate }
        );
    }
    deleteCompanyAssignment(assignmentId: string): Observable<{ message: string; assignmentId: string }> {
        return this.http.delete<{ message: string; assignmentId: string }>(
            `${this.baseUrl}/assignments/${assignmentId}`
        );
    }
    receiveFromRepairCompany(
        assignmentId: string,
        returnDate?: string
    ): Observable<CompanyAssignment> {
        return this.http.patch<CompanyAssignment>(
            `${this.baseUrl}/assignments/${assignmentId}/receive-from-repair`,
            { returnDate }
        );
    }
    getRepairAssignmentByPir(pirNumber: string): Observable<CompanyAssignment | null> {
        return this.http.get<CompanyAssignment | null>(
            `${this.baseUrl}/assignments/by-pir/${pirNumber}`
        );
    }
}

