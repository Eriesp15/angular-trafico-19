import { Component, ViewEncapsulation } from "@angular/core"
import  { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"
import { MatGridListModule } from "@angular/material/grid-list"
import { MatToolbarModule } from "@angular/material/toolbar"
import { SidebarComponent } from "../sidebar/sidebar.component"

interface Reclamo {
  pir: string
  pasajero: string
  bagTag: string
  estado: "En proceso" | "Cerrado" | "Pendiente"
  fecha: string
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

  totalReclamos = 3
  enProceso = 1
  cerrados = 1
  totalIndemnizado = 850

  reclamos: Reclamo[] = [
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
  ]

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.sidebarOpened = !this.sidebarOpened
  }

  closeSidebar(): void {
    this.sidebarOpened = false
  }

  verDetalle(pir: string): void {
    this.router.navigate(["/example/reclamo", pir])
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case "Pendiente":
        return "warn"
      case "En proceso":
        return "primary"
      case "Cerrado":
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
