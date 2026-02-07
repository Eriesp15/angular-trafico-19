import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import  { HttpClient } from "@angular/common/http"
import {  ClaimType, getClaimTypeConfig,  ClaimTypeConfig } from "../../models/claim-type-config.model"

@Component({
  selector: "app-view-claim",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: "./view-claim.component.html",
  styleUrls: ["./view-claim.component.scss"],
})
export class ViewClaimComponent implements OnInit {
  claimId = "";
  pirData: any = null;
  antiguedadDias = 0;

  // URL base del backend
  private readonly apiUrl = "http://localhost:3700/api/v1/claims/view";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
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
    this.router.navigate(["/baggage/follow"])
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
}
