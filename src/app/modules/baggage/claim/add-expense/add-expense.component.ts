import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { FormsModule } from "@angular/forms"

interface TipoGasto {
  id: string
  nombre: string
  descripcion: string
  icon: string
  habilitado: boolean
  requiereCalculo?: boolean
}

@Component({
  selector: "app-add-expense",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, FormsModule],
  templateUrl: "./add-expense.component.html",
  styleUrls: ["./add-expense.component.scss"],
})
export class AddExpenseComponent implements OnInit {
  claimId = ""
  tipoReclamo = "PILFERED" // es falso xd

  tiposGasto: TipoGasto[] = [
    {
      id: "primera_necesidad",
      nombre: "Gastos de primera necesidad",
      descripcion: "Artículos esenciales como ropa, higiene personal, etc.",
      icon: "shopping_bag",
      habilitado: true,
    },
    {
      id: "transporte",
      nombre: "Gasto de transporte",
      descripcion: "Gastos de traslado relacionados al reclamo",
      icon: "directions_car",
      habilitado: true,
    },
    {
      id: "indemnizacion",
      nombre: "Gasto de indemnización",
      descripcion: "Indemnización por diferencia de peso (solo para reclamos Pilfered)",
      icon: "paid",
      habilitado: false,
      requiereCalculo: true,
    },
    {
      id: "otro",
      nombre: "Otro",
      descripcion: "Especificar descripción y monto del gasto",
      icon: "more_horiz",
      habilitado: true,
    },
  ]

  gastoSeleccionado: TipoGasto | null = null

  // Campos para gastos generales
  descripcionGasto = ""
  montoGasto: number | null = null

  // Campos para indemnización (cálculo por peso)
  pesoRecibido: number | null = null
  pesoEntregado: number | null = null
  precioPorKilo: number | null = null
  diferenciaPeso = 0
  totalIndemnizar = 0

  // Estado de confirmación
  mostrarConfirmacion = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    this.actualizarHabilitacionGastos()
  }

  actualizarHabilitacionGastos(): void {
    // Habilitar indemnización solo si el reclamo es tipo Pilfered
    const gastoIndemnizacion = this.tiposGasto.find((g) => g.id === "indemnizacion")
    if (gastoIndemnizacion) {
      gastoIndemnizacion.habilitado = this.tipoReclamo.toUpperCase() === "PILFERED"
    }
  }

  seleccionarTipoGasto(tipo: TipoGasto): void {
    if (!tipo.habilitado) return
    this.gastoSeleccionado = tipo
    this.limpiarFormulario()
  }

  limpiarFormulario(): void {
    this.descripcionGasto = ""
    this.montoGasto = null
    this.pesoRecibido = null
    this.pesoEntregado = null
    this.precioPorKilo = null
    this.diferenciaPeso = 0
    this.totalIndemnizar = 0
    this.mostrarConfirmacion = false
  }

  calcularIndemnizacion(): void {
    const recibido = this.pesoRecibido || 0
    const entregado = this.pesoEntregado || 0
    const precio = this.precioPorKilo || 0

    this.diferenciaPeso = recibido - entregado
    this.totalIndemnizar = this.diferenciaPeso * precio
  }

  obtenerMontoTotal(): number {
    if (this.gastoSeleccionado?.id === "indemnizacion") {
      return this.totalIndemnizar
    }
    return this.montoGasto || 0
  }

  formularioValido(): boolean {
    if (!this.gastoSeleccionado) return false

    if (this.gastoSeleccionado.id === "indemnizacion") {
      return !!(this.pesoRecibido && this.pesoEntregado && this.precioPorKilo && this.totalIndemnizar > 0)
    }

    if (this.gastoSeleccionado.id === "otro") {
      return !!(this.descripcionGasto.trim() && this.montoGasto && this.montoGasto > 0)
    }

    return !!(this.montoGasto && this.montoGasto > 0)
  }

  aceptar(): void {
    if (this.formularioValido()) {
      this.mostrarConfirmacion = true
    }
  }

  confirmarGasto(): void {
    const gastoData = {
      claimId: this.claimId,
      tipoGasto: this.gastoSeleccionado?.id,
      nombreGasto: this.gastoSeleccionado?.nombre,
      descripcion: this.gastoSeleccionado?.id === "otro" ? this.descripcionGasto : this.gastoSeleccionado?.descripcion,
      monto: this.obtenerMontoTotal(),
      ...(this.gastoSeleccionado?.id === "indemnizacion" && {
        pesoRecibido: this.pesoRecibido,
        pesoEntregado: this.pesoEntregado,
        precioPorKilo: this.precioPorKilo,
        diferenciaPeso: this.diferenciaPeso,
      }),
    }

    console.log("[v0] Gasto registrado:", gastoData)
    this.router.navigate([`/baggage/claim/view/${this.claimId}`])
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacion = false
  }

  cancelar(): void {
    this.router.navigate([`/baggage/claim/view/${this.claimId}`])
  }

  volverSeleccion(): void {
    this.gastoSeleccionado = null
    this.limpiarFormulario()
  }
}
