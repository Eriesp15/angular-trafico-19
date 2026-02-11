import { Component,  OnInit,  OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  Router, RouterLink, RouterOutlet } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import  { HttpClient } from "@angular/common/http"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"

interface MetricCard {
  title: string
  value: number | string
  icon: string
  color: string
  type?: "number" | "currency" | "days"
}

interface AlertCard {
  tipo: string
  mensaje: string
  cantidad: number
  color: string
  icon: string
  diasMin: number
  diasMax?: number
}

interface RecentClaim {
  id?: string
  pir: string
  pasajero: string
  tipo: "AHL" | "DPR" | "PILFERED" | "OHL"
  bagTag: string
  estado: "PENDING" | "IN_PROCESS" | "PURCHASED" | "REPAIRED" | "LOST" | "FOUND" | "COMPENSATED" | "CLOSED"
  fecha: string
  vuelo: string
  ruta: string
  diasTranscurridos?: number
}

@Component({
  selector: "app-baggage",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatIconModule],
  templateUrl: "./baggage.component.html",
  styleUrl: "./baggage.component.scss",
})
export class BaggageComponent implements OnInit, OnDestroy {
  // Mapeo de estados para mostrar etiquetas en español
  statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_PROCESS: 'En proceso',
    PURCHASED: 'Comprado',
    REPAIRED: 'Reparado',
    LOST: 'Perdido',
    FOUND: 'Encontrado',
    COMPENSATED: 'Indemnizado',
    CLOSED: 'Cerrado',
    DELIVERED: 'Entregado',
  };

  // Mapeo de tipos para mostrar etiquetas en español
  tipoLabels: Record<string, string> = {
    AHL: "Equipaje Faltante",
    DPR: "Equipaje Dañado",
    PILFERED: "Equipaje Saqueado",
    OHL: "Equipaje Sobrante",
  }

  metrics: MetricCard[] = [
    {
      title: "Reclamos Activos",
      value: 0,
      icon: "pending_actions",
      color: "#003366",
      type: "number",
    },
    {
      title: "Requieren Atención",
      value: 0,
      icon: "warning",
      color: "#f57c00",
      type: "number",
    },
    {
      title: "Cerrados este Mes",
      value: 0,
      icon: "check_circle",
      color: "#00a651",
      type: "number",
    },
    {
      title: "Tiempo Promedio (días)",
      value: 0,
      icon: "schedule",
      color: "#1976d2",
      type: "days",
    },
  ]

  alertas: AlertCard[] = []

  recentClaims: RecentClaim[] = []
  loading = true
  private destroy$ = new Subject<void>()
  private readonly apiUrl = "http://localhost:3700/api/v1/claims/list"

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadDashboardData(): void {
    console.log("[v0] Loading baggage dashboard data")
    this.loading = true

    this.http
      .get<any[]>(this.apiUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log("[v0] Datos del backend recibidos:", data)

          // Mapear datos del backend a la interfaz RecentClaim
          const mappedClaims: RecentClaim[] = data.map((item) => {
            const nameParts = item.Pasajero.split(" ")
            const lastName = nameParts.shift() || ""
            const firstName = nameParts.join(" ") || ""

            const fechaReclamo = new Date(item.Fecha)
            const hoy = new Date()
            const diasTranscurridos = Math.floor((hoy.getTime() - fechaReclamo.getTime()) / (1000 * 60 * 60 * 24))

            return {
              id: item.PIR,
              pir: item.PIR,
              pasajero: `${lastName}, ${firstName}`,
              tipo: item.Tipo,
              bagTag: item.BagTag ?? "",
              estado: item.Estado,
              fecha: new Date(item.Fecha).toLocaleDateString("es-BO", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }),
              vuelo: item.Vuelo ?? "",
              ruta: item.Ruta,
              diasTranscurridos,
            }
          })

          this.calcularMetricas(mappedClaims)

          this.calcularAlertas(mappedClaims)

          // Ordenar por fecha más reciente y obtener los últimos 5
          this.recentClaims = mappedClaims
            .sort((a, b) => {
              const dateA = new Date(a.fecha.split("/").reverse().join("-"))
              const dateB = new Date(b.fecha.split("/").reverse().join("-"))
              return dateB.getTime() - dateA.getTime()
            })
            .slice(0, 5)

          console.log("[v0] Reclamos recientes procesados:", this.recentClaims)
          this.loading = false
        },
        error: (err) => {
          console.error("[v0] Error cargando reclamos", err)
          this.loading = false
        },
      })
  }

  private calcularMetricas(claims: RecentClaim[]): void {
    const activos = claims.filter((c) => c.estado !== "CLOSED" && c.estado !== "COMPENSATED").length

    const requierenAtencion = claims.filter(
      (c) => c.estado !== "CLOSED" && c.estado !== "COMPENSATED" && (c.diasTranscurridos || 0) >= 3,
    ).length

    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const cerradosEsteMes = claims.filter((c) => {
      const fechaClaim = new Date(c.fecha.split("/").reverse().join("-"))
      return (c.estado === "CLOSED" || c.estado === "COMPENSATED") && fechaClaim >= inicioMes
    }).length

    const tiempoPromedio =
      claims.length > 0 ? Math.round(claims.reduce((acc, c) => acc + (c.diasTranscurridos || 0), 0) / claims.length) : 0

    this.metrics = [
      {
        title: "Reclamos Activos",
        value: activos,
        icon: "pending_actions",
        color: "#003366",
        type: "number",
      },
      {
        title: "Requieren Atención",
        value: requierenAtencion,
        icon: "warning",
        color: "#f57c00",
        type: "number",
      },
      {
        title: "Cerrados este Mes",
        value: cerradosEsteMes,
        icon: "check_circle",
        color: "#00a651",
        type: "number",
      },
      {
        title: "Tiempo Promedio",
        value: `${tiempoPromedio} días`,
        icon: "schedule",
        color: "#1976d2",
        type: "days",
      },
    ]
  }

  private calcularAlertas(claims: RecentClaim[]): void {
    const activeClaims = claims.filter((c) => c.estado !== "CLOSED" && c.estado !== "COMPENSATED")

    // Solo AHL tienen alertas por tiempo
    const ahlClaims = activeClaims.filter((c) => c.tipo === "AHL")

    const masde21 = ahlClaims.filter((c) => (c.diasTranscurridos || 0) >= 21).length
    const entre3y21 = ahlClaims.filter((c) => {
      const dias = c.diasTranscurridos || 0
      return dias >= 3 && dias < 21
    }).length
    const entre1y3 = ahlClaims.filter((c) => {
      const dias = c.diasTranscurridos || 0
      return dias >= 1 && dias < 3
    }).length

    this.alertas = []

    if (masde21 > 0) {
      this.alertas.push({
        tipo: "INDEMNIZAR",
        mensaje: "Reclamos que superan 21 días - Proceder con indemnización",
        cantidad: masde21,
        color: "#d32f2f",
        icon: "paid",
        diasMin: 21,
      })
    }

    if (entre3y21 > 0) {
      this.alertas.push({
        tipo: "CONTENIDO",
        mensaje: "Reclamos entre 3-21 días - Solicitar formulario de contenido",
        cantidad: entre3y21,
        color: "#f57c00",
        icon: "assignment",
        diasMin: 3,
        diasMax: 21,
      })
    }

    if (entre1y3 > 0) {
      this.alertas.push({
        tipo: "BÚSQUEDA",
        mensaje: "Reclamos entre 1-3 días - Iniciar búsqueda internacional",
        cantidad: entre1y3,
        color: "#1976d2",
        icon: "search",
        diasMin: 1,
        diasMax: 3,
      })
    }
  }

  navigateToClaim(claimId: string): void {
    this.router.navigate(["/baggage/claim/view", claimId])
  }

  navigateToReports(): void {
    this.router.navigate(["/baggage/reports"])
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case "PENDING":
        return "badge-pending"
      case "IN_PROCESS":
        return "badge-in-process"
      case "PURCHASED":
        return "badge-purchased"
      case "REPAIRED":
        return "badge-repaired"
      case "LOST":
        return "badge-lost"
      case "FOUND":
        return "badge-found"
      case "COMPENSATED":
        return "badge-compensated"
      case "CLOSED":
        return "badge-closed"
      default:
        return "badge-default"
    }
  }

  getTypeBadgeClass(tipo: string): string {
    switch (tipo) {
      case "AHL":
        return "badge-ahl"
      case "DPR":
        return "badge-dpr"
      case "PILFERED":
        return "badge-pilfered"
      case "OHL":
        return "badge-ohl"
      default:
        return "badge-default"
    }
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status
  }

  getTipoLabel(tipo: string): string {
    return this.tipoLabels[tipo] ?? tipo
  }

  getDaysClass(dias: number | undefined): string {
    if (!dias) return ""
    if (dias >= 21) return "days-danger"
    if (dias >= 3) return "days-warning"
    if (dias >= 1) return "days-info"
    return ""
  }
}