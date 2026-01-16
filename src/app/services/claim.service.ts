import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  private apiUrl = 'http://localhost:3700/api/v1/claims'; 

  constructor(private http: HttpClient) {}

  getClaims(status?: string): Observable<any> {
    let params = new HttpParams();

    if (status && status !== 'ALL') {
      params = params.set('status', status);
    }

    return this.http.get(`${this.apiUrl}/list`, { params });
  }

  createClaim(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
