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
      nombre: "Juan Andres",
      apellidoPaterno: "López",
      apellidoMaterno: "Herbas",
      direccionPermanente: "Av. América #123, Cochabamba",
      direccionTemporal: "Av. Segunda c/La paz",
      telefonoPermanente: "+591 70123456",
      telefonoTemporal: "+591 71234567",
      email: "juan.lopez@email.com",
      numeroBoleto: "OB2373000",
      iniciales: "JALH",
    },
    reclamo: {
      fecha: "16/03/2025",
      hora: "09:15",
      estacion: "CBBA LOR",
      tipo: "AHL", // AHL, DAMAGED, PILFERED
      estacionesInvolucradas: "CBBA, VVI, MAD",
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
    equipaje: {
      numeroTicket: "OB2373000",
      ruta: "CBBA-VVI-MAD",
      numeroVuelo: "OB7564",
      fechaVuelo: "03/10",
      colorTipo: "50 - Bag",
      marca: "Samsonite",
      contenido: "Ropa personal, documentos, laptop Dell, cámara fotográfica",
      descripcion: "Maleta rígida color negro, marca Samsonite, tamaño mediano con ruedas",
    },
    dano: {
      tipoDano: "Daño estructural",
      condicion: "Ruedas dañadas",
      partesAfectadas: [
        { codigo: "W", nombre: "Ruedas / Wheels rollers" },
        { codigo: "H", nombre: "Jalador de mano / Retractable handles" },
      ],
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
