import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { FormsModule } from "@angular/forms"
import {  ClaimType, getClaimTypeConfig, isExpenseAllowed } from "../../models/claim-type-config.model"

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
  tipoReclamo: ClaimType = "AHL"
  claimConfig = getClaimTypeConfig(this.tipoReclamo)

  tiposGastoBase: TipoGasto[] = [
    {
      id: "primera_necesidad",
      nombre: "Gastos de Primera Necesidad",
      descripcion: "Artículos esenciales como ropa, higiene personal, etc. (Solo para equipaje faltante)",
      icon: "shopping_bag",
      habilitado: true,
    },
    {
      id: "transporte",
      nombre: "Gasto de Transporte",
      descripcion: "Gastos de traslado para entrega de equipaje",
      icon: "directions_car",
      habilitado: true,
    },
    {
      id: "compra_maleta",
      nombre: "Compra de Maleta",
      descripcion: "Reemplazo de equipaje dañado irreparable",
      icon: "luggage",
      habilitado: true,
    },
    {
      id: "indemnizacion",
      nombre: "Indemnización",
      descripcion: "Compensación por peso faltante o daño (según tipo de reclamo)",
      icon: "paid",
      habilitado: true,
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

  tiposGasto: TipoGasto[] = []

  gastoSeleccionado: TipoGasto | null = null

  // Campos para gastos generales
  descripcionGasto = ""
  montoGasto: number | null = null

  // Campos para indemnización (cálculo por peso)
  pesoRecibido: number | null = null
  pesoEntregado: number | null = null
  precioPorKilo: number | null = 15 // USD por kilo según manual BOA
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
    const tipo = this.route.snapshot.queryParams["tipo"] as ClaimType
    if (tipo) {
      this.tipoReclamo = tipo
    }
    this.claimConfig = getClaimTypeConfig(this.tipoReclamo)
    this.filtrarGastosPorTipoReclamo()
  }

  filtrarGastosPorTipoReclamo(): void {
    this.tiposGasto = this.tiposGastoBase
      .filter((gasto) => isExpenseAllowed(this.tipoReclamo, gasto.id))
      .map((gasto) => ({
        ...gasto,
        habilitado: true,
        // Actualizar descripción según el tipo de reclamo
        descripcion: this.getDescripcionGasto(gasto.id),
      }))
  }

  getDescripcionGasto(gastoId: string): string {
    const descripciones: Record<ClaimType, Record<string, string>> = {
      AHL: {
        primera_necesidad: "Artículos esenciales mientras espera su equipaje (ropa, higiene)",
        transporte: "Gastos de entrega del equipaje cuando sea encontrado",
        otro: "Otros gastos relacionados al reclamo",
      },
      DAMAGED: {
        indemnizacion: "Compensación por daño a la maleta",
        compra_maleta: "Reemplazo de maleta dañada irreparable",
        transporte: "Gastos de traslado para reparación/entrega",
        otro: "Otros gastos relacionados al reclamo",
      },
      PILFERED: {
        indemnizacion: "Indemnización por diferencia de peso (15 USD/kg)",
        otro: "Otros gastos relacionados al reclamo",
      },
    }
    return (
      descripciones[this.tipoReclamo]?.[gastoId] || this.tiposGastoBase.find((g) => g.id === gastoId)?.descripcion || ""
    )
  }

  getTipoReclamoInfo(): { nombre: string; color: string } {
    return {
      nombre: this.claimConfig.nombre,
      color: this.claimConfig.color,
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
    this.precioPorKilo = this.tipoReclamo === "PILFERED" ? 15 : null
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
      tipoReclamo: this.tipoReclamo,
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
