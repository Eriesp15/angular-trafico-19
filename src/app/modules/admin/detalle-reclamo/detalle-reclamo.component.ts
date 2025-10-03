import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-detalle-reclamo",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: "./detalle-reclamo.component.html",
  styleUrls: ["./detalle-reclamo.component.scss"],
})
export class DetalleReclamoComponent implements OnInit {
  claimId = ""

  reclamoData = {
    pasajero: {
      nombreCompleto: "Juan Carlos Mendoza Vargas",
      documento: "12345678",
      telefono: "+591 70123456",
      email: "juan.mendoza@email.com",
      direccion: "Av. América #123, Cochabamba",
      nacionalidad: "Boliviana",
    },
    vuelo: {
      numero: "OB7564",
      aerolinea: "Boliviana de Aviación",
      fecha: "15/03/2025",
      horaSalida: "14:30",
    },
    ruta: [
      { codigo: "CBBA", ciudad: "Cochabamba", tipo: "origen", horario: "Salida: 14:30" },
      { codigo: "VVI", ciudad: "Santa Cruz", tipo: "conexion", horario: "Conexión: 16:45 - 20:15" },
      { codigo: "MAD", ciudad: "Madrid", tipo: "destino", horario: "Llegada: 12:30+1" },
    ],
    reclamo: {
      fecha: "16/03/2025",
      hora: "09:15",
      estacion: "CBBA LOR",
      tipo: "AHL", // AHL, DAMAGED, PILFERED
    },
    equipaje: {
      numero: "OB2334000",
      ubicacion: "Madrid Barajas (MAD)",
      descripcion: "Maleta rígida color negro, marca Samsonite, tamaño mediano con ruedas",
      contenido: "Ropa personal, documentos, laptop Dell, cámara fotográfica",
    },
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
  }

  imprimirPIR(): void {
    window.print()
  }

  exportarPDF(): void {
    console.log("Exportando PDF...")
    // Implementar lógica de exportación
  }

  cerrar(): void {
    this.router.navigate(["/"])
  }
}
