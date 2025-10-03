import { Component, ViewEncapsulation } from "@angular/core"
import { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"
import { MatGridListModule } from "@angular/material/grid-list"
import { MatToolbarModule } from "@angular/material/toolbar"
import { SidebarComponent } from "../sidebar/sidebar.component"

interface Reclamo {
  id: string
  pasajero: string
  vuelo: string
  estado: "Pendiente" | "En Proceso" | "Resuelto"
  tiempo: string
}

@Component({
  selector: "example",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatGridListModule,
    MatToolbarModule,
    SidebarComponent,
  ],
  templateUrl: "./example.component.html",
  styleUrls: ["./example.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ExampleComponent {
  sidebarOpened = false

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

  toggleSidebar(): void {
    this.sidebarOpened = !this.sidebarOpened
  }

  closeSidebar(): void {
    this.sidebarOpened = false
  }

  verDetalle(reclamoId: string): void {
    this.router.navigate(["/example/reclamo", reclamoId])
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
    console.log("Nuevo Reclamo PIR")
  }

  registrarPasajero(): void {
    console.log("Registrar Pasajero")
  }

  articulosEncontrados(): void {
    console.log("Artículos Encontrados")
  }
}
