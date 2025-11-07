import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import type { PIR } from "../../models/pir.model"

@Component({
  selector: "app-view-claim",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./view-claim.component.html",
  styleUrl: "./view-claim.component.scss",
})
export class ViewClaimComponent implements OnInit {
  pir: PIR | null = null
  loading = true
  claimId: string | null = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.paramMap.get("id")
    if (this.claimId) {
      this.loadClaim()
    }
  }

  private loadClaim(): void {
    // TODO: Llamar al servicio para obtener el PIR
    this.loading = false
  }

  editClaim(): void {
    // TODO: Navegar a editar
  }

  deleteClaim(): void {
    if (confirm("¿Está seguro de que desea eliminar este reclamo?")) {
      // TODO: Llamar al servicio para eliminar
      this.router.navigate(["/baggage/claim"])
    }
  }

  downloadPDF(): void {
    // TODO: Generar y descargar PDF
  }

  printClaim(): void {
    window.print()
  }

  backToList(): void {
    this.router.navigate(["/baggage/claim"])
  }
}
