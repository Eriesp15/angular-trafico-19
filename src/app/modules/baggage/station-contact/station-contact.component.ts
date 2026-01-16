import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatChipsModule } from "@angular/material/chips"
import {  MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"

interface StationContact {
  id: string
  fecha: string
  hora: string
  estacionOrigen: string
  estacionDestino: string
  medio: "email" | "telefono" | "sistema_brs" | "whatsapp"
  asunto: string
  mensaje: string
  respuesta?: string
  estado: "enviado" | "respondido" | "pendiente"
  funcionario: string
  locked: boolean
}

@Component({
  selector: "app-station-contact",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule, MatChipsModule, MatSnackBarModule],
  templateUrl: "./station-contact.component.html",
  styleUrls: ["./station-contact.component.scss"],
})
export class StationContactComponent implements OnInit {
  claimId = ""
  pirNumber = ""

  // Estaciones BOA
  estaciones = [
    { codigo: "VVI", nombre: "Santa Cruz - Viru Viru" },
    { codigo: "LPB", nombre: "La Paz - El Alto" },
    { codigo: "CBB", nombre: "Cochabamba - Jorge Wilstermann" },
    { codigo: "SRE", nombre: "Sucre - Alcantarí" },
    { codigo: "TJA", nombre: "Tarija - Cap. Oriel Lea Plaza" },
    { codigo: "ORU", nombre: "Oruro - Juan Mendoza" },
    { codigo: "POI", nombre: "Potosí - Cap. Nicolas Rojas" },
    { codigo: "TDD", nombre: "Trinidad - Tte. Jorge Henrich" },
    { codigo: "CIJ", nombre: "Cobija - Cap. Anibal Arab" },
    { codigo: "RBQ", nombre: "Rurrenabaque" },
    { codigo: "GYA", nombre: "Guayaramerín" },
    { codigo: "SRZ", nombre: "San Borja" },
    { codigo: "ASU", nombre: "Asunción (Internacional)" },
    { codigo: "SAO", nombre: "São Paulo (Internacional)" },
    { codigo: "EZE", nombre: "Buenos Aires (Internacional)" },
    { codigo: "LIM", nombre: "Lima (Internacional)" },
    { codigo: "MIA", nombre: "Miami (Internacional)" },
    { codigo: "MAD", nombre: "Madrid (Internacional)" },
  ]

  mediosContacto = [
    { id: "email", nombre: "Correo Electrónico", icon: "mail" },
    { id: "telefono", nombre: "Teléfono", icon: "phone" },
    { id: "sistema_brs", nombre: "Sistema BRS Amadeus", icon: "computer" },
    { id: "whatsapp", nombre: "WhatsApp", icon: "sms" },
  ]

  // Historial de contactos
  contactos: StationContact[] = [
    {
      id: "1",
      fecha: "15-01-2024",
      hora: "10:30",
      estacionOrigen: "VVI",
      estacionDestino: "LPB",
      medio: "sistema_brs",
      asunto: "Búsqueda de equipaje PIR VVIOB12345",
      mensaje:
        "Solicitamos verificar si el equipaje con BagTag OB123456 se encuentra en su estación. Descripción: Maleta negra Samsonite.",
      respuesta: "Equipaje no localizado en nuestra estación. Verificaremos en bodega.",
      estado: "respondido",
      funcionario: "J. Velasco",
      locked: true,
    },
  ]

  // Formulario nuevo contacto
  nuevoContacto: Partial<StationContact> = {
    estacionOrigen: "VVI",
    estacionDestino: "",
    medio: "email",
    asunto: "",
    mensaje: "",
    funcionario: "",
  }

  mostrarFormulario = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    this.pirNumber = this.claimId
  }

  getNombreEstacion(codigo: string): string {
    return this.estaciones.find((e) => e.codigo === codigo)?.nombre || codigo
  }

  getMedioIcon(medio: string): string {
    return this.mediosContacto.find((m) => m.id === medio)?.icon || "help"
  }

  getMedioNombre(medio: string): string {
    return this.mediosContacto.find((m) => m.id === medio)?.nombre || medio
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case "enviado":
        return "estado-enviado"
      case "respondido":
        return "estado-respondido"
      case "pendiente":
        return "estado-pendiente"
      default:
        return ""
    }
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true
    // Pre-llenar asunto con número de PIR
    this.nuevoContacto.asunto = `Consulta sobre equipaje - PIR ${this.pirNumber}`
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false
    this.nuevoContacto = {
      estacionOrigen: "VVI",
      estacionDestino: "",
      medio: "email",
      asunto: "",
      mensaje: "",
      funcionario: "",
    }
  }

  formularioValido(): boolean {
    return !!(
      this.nuevoContacto.estacionDestino &&
      this.nuevoContacto.medio &&
      this.nuevoContacto.asunto?.trim() &&
      this.nuevoContacto.mensaje?.trim() &&
      this.nuevoContacto.funcionario?.trim()
    )
  }

  enviarContacto(): void {
    if (!this.formularioValido()) return

    const now = new Date()
    const contacto: StationContact = {
      id: Date.now().toString(),
      fecha: now.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-"),
      hora: now.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }),
      estacionOrigen: this.nuevoContacto.estacionOrigen!,
      estacionDestino: this.nuevoContacto.estacionDestino!,
      medio: this.nuevoContacto.medio as any,
      asunto: this.nuevoContacto.asunto!,
      mensaje: this.nuevoContacto.mensaje!,
      estado: "enviado",
      funcionario: this.nuevoContacto.funcionario!,
      locked: true,
    }

    this.contactos.unshift(contacto)
    this.cancelarFormulario()
    this.snack.open("Contacto registrado exitosamente", "OK", { duration: 3000 })
  }

  volver(): void {
    this.router.navigate(["/baggage/claim/view", this.claimId])
  }

  print(): void {
    window.print()
  }
}
