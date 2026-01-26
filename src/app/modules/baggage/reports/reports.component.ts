import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"

interface ReportData {
  totalReclamos: number
  reclamosPorTipo: { tipo: string; cantidad: number; porcentaje: number; color: string }[]
  reclamosPorEstado: { estado: string; cantidad: number; porcentaje: number; color: string }[]
  reclamosPorEstacion: { estacion: string; cantidad: number }[]
  tiempoPromedioResolucion: number
  indemnizacionTotal: number
  gastosPrimeraNecesidad: number
  gastosTransporte: number
  reclamosPorMes: { mes: string; cantidad: number }[]
}

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
  // Filtros
  fechaInicio = ""
  fechaFin = ""
  tipoReclamo = "ALL"
  estacion = "ALL"

  // Datos del reporte
  reportData: ReportData = {
    totalReclamos: 0,
    reclamosPorTipo: [],
    reclamosPorEstado: [],
    reclamosPorEstacion: [],
    tiempoPromedioResolucion: 0,
    indemnizacionTotal: 0,
    gastosPrimeraNecesidad: 0,
    gastosTransporte: 0,
    reclamosPorMes: [],
  }

  estaciones = [
    { codigo: "ALL", nombre: "Todas las estaciones" },
    { codigo: "VVI", nombre: "Santa Cruz - Viru Viru" },
    { codigo: "LPB", nombre: "La Paz - El Alto" },
    { codigo: "CBB", nombre: "Cochabamba" },
    { codigo: "SRE", nombre: "Sucre" },
    { codigo: "TJA", nombre: "Tarija" },
  ]

  tiposReclamo = [
    { codigo: "ALL", nombre: "Todos los tipos" },
    { codigo: "AHL", nombre: "Equipaje Faltante (AHL)" },
    { codigo: "DAMAGED", nombre: "Equipaje Dañado (DPR)" },
    { codigo: "PILFERED", nombre: "Equipaje Saqueado (PIL)" },
  ]

  constructor() {}

  ngOnInit(): void {
    this.setDefaultDates()
    this.loadReportData()
  }

  setDefaultDates(): void {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    this.fechaFin = today.toISOString().split("T")[0]
    this.fechaInicio = firstDayOfMonth.toISOString().split("T")[0]
  }

  loadReportData(): void {
    // Datos de ejemplo - en producción vendrían del backend
    this.reportData = {
      totalReclamos: 127,
      reclamosPorTipo: [
        { tipo: "AHL", cantidad: 78, porcentaje: 61.4, color: "#1976d2" },
        { tipo: "DAMAGED", cantidad: 35, porcentaje: 27.6, color: "#f57c00" },
        { tipo: "PILFERED", cantidad: 14, porcentaje: 11.0, color: "#d32f2f" },
      ],
      reclamosPorEstado: [
        { estado: "Cerrados", cantidad: 89, porcentaje: 70.1, color: "#00a651" },
        { estado: "En Proceso", cantidad: 23, porcentaje: 18.1, color: "#1976d2" },
        { estado: "Pendientes", cantidad: 15, porcentaje: 11.8, color: "#ff9800" },
      ],
      reclamosPorEstacion: [
        { estacion: "VVI", cantidad: 45 },
        { estacion: "LPB", cantidad: 38 },
        { estacion: "CBB", cantidad: 22 },
        { estacion: "SRE", cantidad: 12 },
        { estacion: "TJA", cantidad: 10 },
      ],
      tiempoPromedioResolucion: 8.5,
      indemnizacionTotal: 15750,
      gastosPrimeraNecesidad: 8420,
      gastosTransporte: 3250,
      reclamosPorMes: [
        { mes: "Ene", cantidad: 18 },
        { mes: "Feb", cantidad: 22 },
        { mes: "Mar", cantidad: 15 },
        { mes: "Abr", cantidad: 28 },
        { mes: "May", cantidad: 24 },
        { mes: "Jun", cantidad: 20 },
      ],
    }
  }

  aplicarFiltros(): void {
    console.log("[v0] Aplicando filtros:", {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      tipoReclamo: this.tipoReclamo,
      estacion: this.estacion,
    })
    this.loadReportData()
  }

  limpiarFiltros(): void {
    this.setDefaultDates()
    this.tipoReclamo = "ALL"
    this.estacion = "ALL"
    this.loadReportData()
  }

  exportarPDF(): void {
    console.log("[v0] Exportando reporte a PDF...")
  }

  exportarExcel(): void {
    console.log("[v0] Exportando reporte a Excel...")
  }

  print(): void {
    window.print()
  }

  getMaxCantidadEstacion(): number {
    return Math.max(...this.reportData.reclamosPorEstacion.map((e) => e.cantidad))
  }

  getBarWidth(cantidad: number): number {
    const max = this.getMaxCantidadEstacion()
    return max > 0 ? (cantidad / max) * 100 : 0
  }

  getMaxCantidadMes(): number {
    return Math.max(...this.reportData.reclamosPorMes.map((m) => m.cantidad))
  }

  getBarHeight(cantidad: number): number {
    const max = this.getMaxCantidadMes()
    return max > 0 ? (cantidad / max) * 100 : 0
  }
}
