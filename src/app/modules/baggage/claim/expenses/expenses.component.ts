import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"

interface Gasto {
  id: string
  descripcion: string
  concepto: string
  monto: number
}

@Component({
  selector: "app-expenses",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: "./expenses.component.html",
  styleUrls: ["./expenses.component.scss"],
})
export class ExpensesComponent implements OnInit {
  claimId = ""

  gastos: Gasto[] = [
    {
      id: "1",
      descripcion: "Indemnización por daño en equipaje",
      concepto: "Indemnización",
      monto: 245.5,
    },
    {
      id: "2",
      descripcion: "Compra de maleta de reemplazo",
      concepto: "Compra de Maleta",
      monto: 189.99,
    },
    {
      id: "3",
      descripcion: "Gastos de envío de equipaje reparado",
      concepto: "Gastos en Envío",
      monto: 45.0,
    },
    {
      id: "4",
      descripcion: "Alojamiento pasajero extranjero (2 noches)",
      concepto: "Gastos Extras",
      monto: 300.0,
    },
    {
      id: "5",
      descripcion: "Alimentación durante la espera",
      concepto: "Gastos Extras",
      monto: 75.5,
    },
  ]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
  }

  get totalIndemnizacion(): number {
    return this.gastos.filter((g) => g.concepto === "Indemnización").reduce((sum, g) => sum + g.monto, 0)
  }

  get totalCompramMaleta(): number {
    return this.gastos.filter((g) => g.concepto === "Compra de Maleta").reduce((sum, g) => sum + g.monto, 0)
  }

  get totalGastosEnvio(): number {
    return this.gastos.filter((g) => g.concepto === "Gastos en Envío").reduce((sum, g) => sum + g.monto, 0)
  }

  get totalGastosExtras(): number {
    return this.gastos.filter((g) => g.concepto === "Gastos Extras").reduce((sum, g) => sum + g.monto, 0)
  }

  get totalGastos(): number {
    return this.gastos.reduce((sum, g) => sum + g.monto, 0)
  }

  volver(): void {
    this.router.navigate(["/baggage/claim/view", this.claimId])
  }
}
