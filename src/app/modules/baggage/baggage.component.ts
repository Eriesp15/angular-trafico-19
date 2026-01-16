import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  Router, RouterLink, RouterOutlet } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import  { HttpClient } from "@angular/common/http"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"

interface MetricCard {
  title: string
  value: number
  icon: string
  color: string
}

interface RecentClaim {
  id?: string
  pir: string
  pasajero: string
  tipo: "AHL" | "DAMAGED" | "PILFERED"
  bagTag: string
  estado: "DRAFT" | "REGISTERED" | "PROCESSING" | "RESOLVED" | "CLOSED" | "PENDING"
  fecha: string
  vuelo: string
  ruta: string
}

@Component({
  selector: "app-baggage",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatIconModule],
  templateUrl: "./baggage.component.html",
  styleUrl: "./baggage.component.scss",
})
export class BaggageComponent implements OnInit, OnDestroy {
  metrics: MetricCard[] = [
    {
      title: "Total de Reclamos",
      value: 127,
      icon: "receipt_long",
      color: "#003366",
    },
    {
      title: "En Proceso",
      value: 23,
      icon: "schedule",
      color: "#0066cc",
    },
    {
      title: "Resueltos",
      value: 89,
      icon: "check_circle",
      color: "#00a651",
    },
    {
      title: "Indemnización Total",
      value: 15750,
      icon: "payment",
      color: "#ff9800",
    },
  ]

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
            }
          })

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

  navigateToClaim(claimId: string): void {
    this.router.navigate(["/baggage/claim/view", claimId])
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case "DRAFT":
        return "badge-draft"
      case "REGISTERED":
        return "badge-registered"
      case "PROCESSING":
        return "badge-processing"
      case "RESOLVED":
        return "badge-resolved"
      case "CLOSED":
        return "badge-closed"
      case "PENDING":
        return "badge-warning"
      default:
        return "badge-default"
    }
  }

  getTypeBadgeClass(tipo: string): string {
    switch (tipo) {
      case "AHL":
        return "badge-ahl"
      case "DAMAGED":
        return "badge-damaged"
      case "PILFERED":
        return "badge-pilfered"
      default:
        return "badge-default"
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case "PENDING":
        return "#ff9800"
      case "PROCESSING":
        return "#0066cc"
      case "CLOSED":
        return "#00a651"
      default:
        return "#666"
    }
  }
}
