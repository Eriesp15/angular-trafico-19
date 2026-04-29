import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExpenseItem {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  claimId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseListResponse {
  claimId: string;
  total: number;
  items: ExpenseItem[];
}

export interface CreateExpensePayload {
  title: string;
  cost: number;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly apiUrl = 'http://localhost:3700/api/v1/expenses';

  constructor(private readonly http: HttpClient) {}

  getByPir(pirNumber: string): Observable<ExpenseListResponse> {
    return this.http.get<ExpenseListResponse>(`${this.apiUrl}/claim/${pirNumber}`);
  }

  createByPir(pirNumber: string, payload: CreateExpensePayload): Observable<ExpenseItem> {
    return this.http.post<ExpenseItem>(`${this.apiUrl}/claim/${pirNumber}`, payload);
  }
}
