import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClaimStatusService {
  
  private readonly statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    TRANSFERRED: 'Transferido',
    SEARCHING: 'En búsqueda',
    REPAIRING: 'En reparación',
    COMPENSATED: 'Indemnizado',
    LOST: 'Perdido',
    FOUND: 'Encontrado',
    REPAIRED: 'Reparado',
    RECEIVED: 'Recibido',
    DELIVERED: 'Entregado',
    CLOSED: 'Cerrado',
  };

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

}