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
  requiereDias?: number // Días mínimos para habilitar
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
  diasTranscurridos = 0 // Días desde que se creó el reclamo
  fechaCreacion: Date = new Date()

  tiposGastoBase: TipoGasto[] = [
    {
      id: "primera_necesidad",
      nombre: "Gastos de Primera Necesidad",
      descripcion: "Artículos esenciales como ropa, higiene personal (Solo para equipaje faltante AHL)",
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
      id: "reparacion_maleta",
      nombre: "Reparación de Maleta",
      descripcion: "Costo de reparación del equipaje dañado",
      icon: "build",
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
      id: "indemnizacion_faltante_contenido",
      nombre: "Indemnización - Faltante de Contenido",
      descripcion: "Compensación por contenido faltante (15 USD/kg)",
      icon: "inventory_2",
      habilitado: true,
      requiereCalculo: true,
      requiereDias: 21,
    },
    {
      id: "indemnizacion_extravio_maleta",
      nombre: "Indemnización - Extravío de Maleta",
      descripcion: "Compensación por equipaje no encontrado después de 21 días (15 USD/kg)",
      icon: "paid",
      habilitado: true,
      requiereCalculo: true,
      requiereDias: 21,
    },
    {
      id: "otro",
      nombre: "Otro Gasto",
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
  precioPorKilo = 15 // USD por kilo según manual BOA
  diferenciaPeso = 0
  totalIndemnizar = 0

  subtiposDPR = [
    { id: "DANO_EQUIPAJE", nombre: "Daño de Equipaje", descripcion: "Reparación o compra de maleta" },
    { id: "FALTANTE_CONTENIDO", nombre: "Faltante de Contenido", descripcion: "Indemnización por contenido" },
  ]
  subtipoDPRSeleccionado: string | null = null

  // Estado de confirmación
  mostrarConfirmacion = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    const tipo = this.route.snapshot.queryParams["tipo"] as ClaimType
    const fechaStr = this.route.snapshot.queryParams["fecha"]

    if (tipo) {
      this.tipoReclamo = tipo
    }

    if (fechaStr) {
      this.fechaCreacion = new Date(fechaStr)
      this.calcularDiasTranscurridos()
    }

    this.claimConfig = getClaimTypeConfig(this.tipoReclamo)
    this.filtrarGastosPorTipoReclamo()
  }

  calcularDiasTranscurridos(): void {
    const hoy = new Date()
    const diffTime = Math.abs(hoy.getTime() - this.fechaCreacion.getTime())
    this.diasTranscurridos = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  filtrarGastosPorTipoReclamo(): void {
    this.tiposGasto = this.tiposGastoBase
      .filter((gasto) => {
        // Verificar si el gasto está permitido para este tipo de reclamo
        const permitido = isExpenseAllowed(this.tipoReclamo, gasto.id, this.diasTranscurridos)
        return permitido
      })
      .map((gasto) => {
        // Verificar si requiere días mínimos
        const requiereDias = gasto.requiereDias && this.diasTranscurridos < gasto.requiereDias

        return {
          ...gasto,
          habilitado: !requiereDias,
          descripcion: this.getDescripcionGasto(gasto.id, requiereDias),
        }
      })
  }

  getDescripcionGasto(gastoId: string, bloqueadoPorDias = false): string {
    if (bloqueadoPorDias) {
      const diasRestantes = this.claimConfig.diasParaIndemnizacion - this.diasTranscurridos
      return `Disponible en ${diasRestantes} días (requiere mínimo 21 días)`
    }

    const descripciones: Record<ClaimType, Record<string, string>> = {
      AHL: {
        primera_necesidad: "Artículos esenciales mientras espera su equipaje (ropa, higiene, etc.)",
        transporte: "Gastos de entrega del equipaje cuando sea encontrado",
        indemnizacion_extravio_maleta: "Compensación por equipaje no encontrado (15 USD/kg)",
        otro: "Otros gastos relacionados al reclamo",
      },
      DPR: {
        reparacion_maleta: "Costo de reparación del daño en el equipaje",
        compra_maleta: "Reemplazo de maleta cuando el daño es irreparable",
        transporte: "Gastos de traslado para reparación/entrega",
        indemnizacion_faltante_contenido: "Compensación por contenido faltante (15 USD/kg)",
        otro: "Otros gastos relacionados al reclamo",
      },
      PILFERED: {
        indemnizacion_faltante_contenido: "Indemnización por diferencia de peso (15 USD/kg)",
        otro: "Otros gastos relacionados al reclamo",
      },
      OHL: {
        transporte: "Gastos de envío del equipaje a Central CBB",
        otro: "Otros gastos relacionados",
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
    this.diferenciaPeso = 0
    this.totalIndemnizar = 0
    this.mostrarConfirmacion = false
    this.subtipoDPRSeleccionado = null
  }

  calcularIndemnizacion(): void {
    const recibido = this.pesoRecibido || 0
    const entregado = this.pesoEntregado || 0

    this.diferenciaPeso = recibido - entregado
    this.totalIndemnizar = this.diferenciaPeso * this.precioPorKilo
  }

  obtenerMontoTotal(): number {
    if (this.gastoSeleccionado?.id.startsWith("indemnizacion")) {
      return this.totalIndemnizar
    }
    return this.montoGasto || 0
  }

  formularioValido(): boolean {
    if (!this.gastoSeleccionado) return false

    if (this.gastoSeleccionado.id.startsWith("indemnizacion")) {
      return !!(this.pesoRecibido && this.pesoEntregado && this.totalIndemnizar > 0)
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
      ...(this.gastoSeleccionado?.id.startsWith("indemnizacion") && {
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

  esIndemnizacion(): boolean {
    return this.gastoSeleccionado?.id.startsWith("indemnizacion") || false
  }
}
