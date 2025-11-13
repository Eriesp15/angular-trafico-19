import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-compensation",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, FormsModule],
  templateUrl: "./compensation.component.html",
  styleUrls: ["./compensation.component.scss"],
})
export class CompensationComponent implements OnInit {
  claimId = ""

  pesoRecibido = ""
  pesoEntregado = ""
  precioPorKilo = ""

  diferenciaPeso = 0
  totalIndemnizar = 0

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
  }

  calcularIndemnizacion(): void {
    const recibido = Number.parseFloat(this.pesoRecibido) || 0
    const entregado = Number.parseFloat(this.pesoEntregado) || 0
    const precio = Number.parseFloat(this.precioPorKilo) || 0

    this.diferenciaPeso = recibido - entregado
    this.totalIndemnizar = this.diferenciaPeso * precio
  }

  aceptarIndemnizacion(): void {
    console.log("[v0] Indemnización aceptada:", {
      claimId: this.claimId,
      pesoRecibido: this.pesoRecibido,
      pesoEntregado: this.pesoEntregado,
      precioPorKilo: this.precioPorKilo,
      totalIndemnizar: this.totalIndemnizar,
    })
    this.router.navigate(["/baggage/claim/view", this.claimId])
  }

  cancelar(): void {
    this.router.navigate(["/baggage/claim/view", this.claimId])
  }
}
