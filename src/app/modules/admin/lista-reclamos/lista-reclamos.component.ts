import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatTableModule } from "@angular/material/table"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"

interface ReclamoCompleto {
  tipo: string
  pasajero: string
  vuelo: string
  ruta: string
  fecha: string
  bagTag: string
  pir: string
  estado: string
}

@Component({
  selector: "app-lista-reclamos",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: "./lista-reclamos.component.html",
  styleUrls: ["./lista-reclamos.component.scss"],
})
export class ListaReclamosComponent {
  searchTerm = ""
  displayedColumns: string[] = ["tipo", "pasajero", "vuelo", "ruta", "fecha", "bagTag", "pir", "estado"]

  reclamos: ReclamoCompleto[] = [
    {
      tipo: "AHL",
      pasajero: "Juan Pérez",
      vuelo: "OB709",
      ruta: "CBB VVI",
      fecha: "2024-01-15",
      bagTag: "BA789456",
      pir: "PIR001234",
      estado: "En proceso",
    },
    {
      tipo: "DPR",
      pasajero: "María García",
      vuelo: "OB787",
      ruta: "CBB VVI EZE",
      fecha: "2024-01-14",
      bagTag: "BA789457",
      pir: "PIR001235",
      estado: "Cerrado",
    },
    {
      tipo: "PILFERED",
      pasajero: "Carlos López",
      vuelo: "OB546",
      ruta: "CBB VVI MAD",
      fecha: "2024-01-13",
      bagTag: "BA789458",
      pir: "PIR001236",
      estado: "Pendiente",
    },
  ]

  filteredReclamos: ReclamoCompleto[] = [...this.reclamos]

  constructor(private router: Router) {}

  filterReclamos(): void {
    const term = this.searchTerm.toLowerCase().trim()
    if (!term) {
      this.filteredReclamos = [...this.reclamos]
      return
    }

    this.filteredReclamos = this.reclamos.filter(
      (reclamo) =>
        reclamo.pir.toLowerCase().includes(term) ||
        reclamo.pasajero.toLowerCase().includes(term) ||
        reclamo.bagTag.toLowerCase().includes(term),
    )
  }

  verDetalle(pir: string): void {
    this.router.navigate(["/example/reclamo", pir])
  }
}
