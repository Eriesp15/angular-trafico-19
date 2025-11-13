import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterOutlet } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"

interface MetricCard {
  title: string
  value: number
  icon: string
  color: string
}

interface RecentClaim {
  pir: string
  pasajero: string
  bagTag: string
  estado: "En proceso" | "Cerrado" | "Pendiente"
  fecha: string
}

@Component({
  selector: "app-baggage",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatIconModule],
  templateUrl: "./baggage.component.html",
  styleUrl: "./baggage.component.scss",
})
export class BaggageComponent implements OnInit {
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

  recentClaims: RecentClaim[] = [
    {
      pir: "PIR001234",
      pasajero: "Juan Pérez",
      bagTag: "BA789456",
      estado: "En proceso",
      fecha: "2024-01-15",
    },
    {
      pir: "PIR001235",
      pasajero: "María García",
      bagTag: "BA789457",
      estado: "Cerrado",
      fecha: "2024-01-14",
    },
    {
      pir: "PIR001236",
      pasajero: "Carlos López",
      bagTag: "BA789458",
      estado: "Pendiente",
      fecha: "2024-01-13",
    },
    {
      pir: "PIR001236",
      pasajero: "Carlos López",
      bagTag: "BA789458",
      estado: "Pendiente",
      fecha: "2024-01-13",
    },
  ]

  ngOnInit(): void {
    this.loadDashboardData()
  }

  private loadDashboardData(): void {
    console.log("[v0] Loading baggage dashboard data")
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case "Pendiente":
        return "badge-warning"
      case "En proceso":
        return "badge-info"
      case "Cerrado":
        return "badge-success"
      default:
        return "badge-default"
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case "Pendiente":
        return "#ff9800"
      case "En proceso":
        return "#0066cc"
      case "Cerrado":
        return "#00a651"
      default:
        return "#666"
    }
  }
}
