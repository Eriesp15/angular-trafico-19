import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import  { HttpClient } from "@angular/common/http"
import { BreadcrumbComponent, BreadcrumbItem } from '@erp/components/breadcrumb/breadcrumb.component';
import { MatDialogModule, MatDialog } from "@angular/material/dialog"

@Component({
  selector: "app-view-claim",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, BreadcrumbComponent, MatDialogModule],
  templateUrl: "./view-claim.component.html",
  styleUrls: ["./view-claim.component.scss"],
})
export class ViewClaimComponent implements OnInit {
  claimId = "";
  pirData: any = null;
  antiguedadDias = 0;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Lista de Reclamos', url: '/baggage/claim/list' },
    { label: 'Visualizar Reclamo' } // Sin URL = no clickeable (página actual)
  ];

  // World Tracer fields
  worldTracerCodigo = ""
  worldTracerEstado = ""
  worldTracerDescripcion = ""

  // URL base del backend
  private readonly apiUrl = "http://localhost:3700/api/v1/claims/view";



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    if (this.claimId) {
      this.loadClaim(this.claimId)
    }
  }

  // Cargar un PIR desde el backend
  private loadClaim(pirNumber: string): void {
    this.http.get<any>(`${this.apiUrl}/${pirNumber}`).subscribe({
      next: (data) => {
        console.log("Datos del backend PIR:", data)
        this.pirData = data;
        this.calcularAntiguedad();
        this.breadcrumbItems = [
          { label: 'Lista de Reclamos', url: '/baggage/claim/list' },
          { label: 'Visualizar Reclamo' },
          { label: this.pirData?.pirNumber || '' }
        ];

        console.log("PIR cargado:", this.pirData)
        console.log("tipo de reclamo:", this.pirData.claimType)
      },
      error: (err) => {
        console.error("Error cargando PIR:", err)
      },
    })
  }

  private calcularAntiguedad(): void {
    if (!this.pirData?.createdAt) {
      this.antiguedadDias = 0;
      return;
    }

    const fechaCreacion = new Date(this.pirData.createdAt);
    const ahora = new Date();
    const diferenciaMilisegundos = ahora.getTime() - fechaCreacion.getTime();
    
    // Calcular días
    this.antiguedadDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  }

  verHojaSeguimiento(): void {
    this.router.navigate(["/baggage/claim/follow", this.claimId])
  }

  verFormularioContenido(): void {
    this.router.navigate([`/baggage/claim/content/${this.claimId}`])
  }

  realizarEntrega(): void {
    this.router.navigate([`/baggage/claim/make-delivery/${this.claimId}`])
  }

  indemnizar(): void {
    this.router.navigate(["/baggage/claim/add-expense", this.claimId], {
      queryParams: { tipo: 'DPR' },
    })
  }

  cerrarReclamo(): void {
    this.router.navigate([`/baggage/claim/closing-receipt/${this.claimId}`])
  }

  verGastos(): void {
    this.router.navigate(["/baggage/claim/expenses", this.claimId])
  }

  follow(): void {
    this.router.navigate(["/baggage/claim/follow", this.claimId])
  }

  contactoEstaciones(): void {
    this.router.navigate(["/baggage/claim/station-contact", this.claimId])
  }

  isAHL(): boolean {
    return this.pirData?.claimType === 'AHL';
  }
  isPILFERED(): boolean {
    return this.pirData?.claimType === 'PILFERED';
  }
  enviarAReparacion(): void {
    import("../send-to-repair/send-to-repair-dialog.component").then(({ SendToRepairDialogComponent }) => {
      this.dialog.open(SendToRepairDialogComponent, {
        width: "800px",
        data: {
          pirNumber: this.pirData?.informacionAdicional?.pirNumber,
          pasajero: this.pirData?.pasajero,
          equipaje: this.pirData?.equipaje,
          reclamo: this.pirData?.reclamo,
        },
      })
    })
  }

}
