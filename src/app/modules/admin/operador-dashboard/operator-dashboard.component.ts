import { Component } from "@angular/core"
import type { Router } from "@angular/router"

interface Reclamo {
  id: string
  pasajero: string
  vuelo: string
  estado: "Pendiente" | "En Proceso" | "Resuelto"
  tiempo: string
}

@Component({
  selector: "app-operator-dashboard",
  templateUrl: "./operator-dashboard.component.html",
  styleUrls: ["./operator-dashboard.component.scss"],
})
export class OperatorDashboardComponent {
  reclamos: Reclamo[] = [
    {
      id: "PIR-2024-001",
      pasajero: "María González",
      vuelo: "AA-1234",
      estado: "Pendiente",
      tiempo: "Hace 15 min",
    },
    {
      id: "PIR-2024-002",
      pasajero: "Carlos Ruiz",
      vuelo: "LA-5678",
      estado: "En Proceso",
      tiempo: "Hace 1 hora",
    },
    {
      id: "PIR-2024-003",
      pasajero: "Ana López",
      vuelo: "UA-9012",
      estado: "Resuelto",
      tiempo: "Hace 2 horas",
    },
  ]

  constructor(private router: Router) {}

  verDetalle(reclamoId: string): void {
    this.router.navigate(["/reclamos", reclamoId])
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case "Pendiente":
        return "warn"
      case "En Proceso":
        return "primary"
      case "Resuelto":
        return "accent"
      default:
        return "primary"
    }
  }

  nuevoReclamoPIR(): void {
    // Implementar lógica para nuevo reclamo
    console.log("Nuevo Reclamo PIR")
  }

  registrarPasajero(): void {
    // Implementar lógica para registrar pasajero
    console.log("Registrar Pasajero")
  }

  articulosEncontrados(): void {
    // Implementar lógica para artículos encontrados
    console.log("Artículos Encontrados")
  }
}
