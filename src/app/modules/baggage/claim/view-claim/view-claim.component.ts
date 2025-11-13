import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-view-claim",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: "./view-claim.component.html",
  styleUrls: ["./view-claim.component.scss"],
})
export class ViewClaimComponent implements OnInit {
  claimId = ""
  diasTranscurridos = 0

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
      tipo: "AHL",
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
    this.calcularDiasTranscurridos()
  }

  calcularDiasTranscurridos(): void {
    const fechaReclamo = new Date();
    fechaReclamo.setDate(fechaReclamo.getDate() - 22);

    const hoy = new Date()
    const diferencia = hoy.getTime() - fechaReclamo.getTime()
    this.diasTranscurridos = Math.floor(diferencia / (1000 * 60 * 60 * 24))
  }

  imprimirPIR(): void {
    window.print()
  }

  exportarPDF(): void {
    console.log("[v0] Exporting PDF...")
  }

  cerrar(): void {
    this.router.navigate(["/baggage"])
  }

  verHojaSeguimiento(): void {
    this.router.navigate(["/baggage/follow"])
  }

  verFormularioContenido(): void {
    console.log("[v0] Ver formulario contenido - ruta no asignada aún")
  }

  realizarEntrega(): void {
    this.router.navigate([`/baggage/claim/make-delivery/${this.claimId}`])
  }

  indemnizar(): void {
    this.router.navigate(["/baggage/claim/compensation", this.claimId])
  }

  cerrarReclamo(): void {
    console.log("[v0] Cerrar reclamo")
  }

   verGastos(): void {
    this.router.navigate(["/baggage/claim/expenses", this.claimId])
  }
}
