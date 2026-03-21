import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItem } from '@erp/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-tracking-sheet',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './tracking-sheet.component.html',
  styleUrls: ['./tracking-sheet.component.scss']
})
export class TrackingSheetComponent implements OnInit {
  data: any = null;
  loading = true;
  error = false;
  activeTab: 'activities' | 'communications' = 'activities';
  openMeta: string | null = null;
  openComm: string | null = null;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Lista de Reclamos', url: '/baggage/claim/list' },
    { label: 'Visualizar Reclamo', url: 'baggage/claim/view/'},
    { label: 'Hoja de seguimiento'} // Sin URL 
  ];
  private api = 'http://localhost:3700/api/v1';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`${this.api}/tracking-sheet/claim/${id}`).subscribe({
      next: (res: any) => {
        this.data = res;
        this.loading = false;
        // Actualiza el breadcrumb con el claimId real
        this.breadcrumbItems = [
          { label: 'Lista de Reclamos', url: '/baggage/claim/list' },
          { label: 'Visualizar Reclamo' },
          { label: `${id}`},
          { label: 'Hoja de seguimiento'}
        ];
        this.breadcrumbItems[1].url = `/baggage/claim/view/${id}`;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  metaEntries(meta: any): [string, any][] {
    return meta ? Object.entries(meta) : [];
  }

  formatDate(d: string) {
    return new Date(d).toLocaleString('es-ES');
  }

  translate(type: string) {
    const map: Record<string, string> = {
      CREATED: 'Creado', UPDATED: 'Actualizado', STATUS_CHANGE: 'Cambio de estado',
      DOCUMENT_UPLOADED: 'Documento subido', APPROVED: 'Aprobado', REJECTED: 'Rechazado',
      CLOSED: 'Cerrado', NOTE: 'Nota', ASSIGNED: 'Asignado', REVIEWED: 'Revisado',
      EMAIL: 'Correo', PHONE: 'Teléfono', SMS: 'SMS', IN_PERSON: 'En persona',
      LETTER: 'Carta', OTHER: 'Otro',
    };
    return map[type] ?? type;
  }
}