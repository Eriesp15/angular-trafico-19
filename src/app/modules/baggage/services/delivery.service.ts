import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces
export interface PassengerInfo {
  claimId: string;
  pirNumber: string;
  passengerName: string;
  email: string;
  direccion: string;
  telefono: string;
  deliveryInstructions: string;
  claimStatus: string;
}

export interface DeliveryRequest {
  pirNumber: string;
  tipo: 'domicilio' | 'aeropuerto';
  direccion?: string;
  telefono?: string;
  referencia?: string;
  aeropuerto?: string;
}

export interface DeliveryResponse {
  success: boolean;
  message: string;
  data: {
    claimId: string;
    pirNumber: string;
    passengerName: string;
    deliveryType: string;
    deliveryDetails: any;
    newStatus: string;
    deliveryDate: string;
  };
}

export interface DeliveryHistory {
  claimId: string;
  pirNumber: string;
  currentStatus: string;
  deliveries: Array<{
    id: string;
    deliveryDate: string;
    notes: string;
    createdAt: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = 'http://localhost:3700/api/v1/delivery';

  constructor(private http: HttpClient) {}

  /**
   * Obtener información del pasajero para prellenar el formulario
   * @param pirNumber - Número de PIR (ej: VVI2024001234)
   */
  getPassengerInfo(pirNumber: string): Observable<PassengerInfo> {
    return this.http
      .get<PassengerInfo>(`${this.apiUrl}/passenger-info/${pirNumber}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Registrar una entrega
   * @param deliveryData - Datos de la entrega
   */
  makeDelivery(deliveryData: DeliveryRequest): Observable<DeliveryResponse> {
    return this.http
      .post<DeliveryResponse>(`${this.apiUrl}/make-delivery`, deliveryData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener historial de entregas de un claim
   * @param pirNumber - Número de PIR
   */
  getDeliveryHistory(pirNumber: string): Observable<DeliveryHistory> {
    return this.http
      .get<DeliveryHistory>(`${this.apiUrl}/history/${pirNumber}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('Error en DeliveryService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}