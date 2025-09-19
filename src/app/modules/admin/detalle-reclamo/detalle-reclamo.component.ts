import { Component, type OnInit } from "@angular/core"
import type { ActivatedRoute, Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"
import { MatTabsModule } from "@angular/material/tabs"
import { MatListModule } from "@angular/material/list"
import { MatDividerModule } from "@angular/material/divider"
import { MatToolbarModule } from "@angular/material/toolbar"

interface Pasajero {
  nombre: string
  apellido: string
  documento: string
  telefono: string
  email: string
  direccion: string
}

interface Vuelo {
  numero: string
  fecha: string
  origen: { codigo: string; nombre: string }
  destino: { codigo: string; nombre: string }
  aerolinea: string
  hora_salida: string
  hora_llegada: string
}

interface Equipaje {
  tipo: string
  color: string
  marca: string
  peso: string
  descripcion: string
  etiqueta: string
  ubicacion_actual: string
  problema: string
}

interface HistorialEvento {
  fecha: string
  estado: string
  descripcion: string
  agente: string
}

interface Documento {
  nombre: string
  tipo: string
  fecha: string
}

interface Costos {
  reparacion: number
  transporte: number
  compensacion: number
  total: number
  moneda: string
}

interface ReclamoData {
  id: string
  fechaCreacion: string
  estado: string
  subestado: string
  prioridad: string
  fechaLimite: string
  pasajero: Pasajero
  vuelo: Vuelo
  equipaje: Equipaje
  historial: HistorialEvento[]
  documentos: Documento[]
  costos: Costos
}

@Component({
  selector: "app-detalle-reclamo",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatToolbarModule,
  ],
  templateUrl: "./detalle-reclamo.component.html",
  styleUrls: ["./detalle-reclamo.component.scss"],
})
export class DetalleReclamoComponent implements OnInit {
  reclamoId = ""
  reclamoData: ReclamoData = {
    id: "PIR-2024-001",
    fechaCreacion: "2024-12-15T14:30:00Z",
    estado: "En Proceso",
    subestado: "En reparación",
    prioridad: "Alta",
    fechaLimite: "2024-12-18T23:59:00Z",

    pasajero: {
      nombre: "María",
      apellido: "González Rodríguez",
      documento: "12345678A",
      telefono: "+34 600 123 456",
      email: "maria.gonzalez@email.com",
      direccion: "Calle Mayor 123, 28001 Madrid, España",
    },

    vuelo: {
      numero: "AA-1234",
      fecha: "2024-12-15",
      origen: { codigo: "MAD", nombre: "Madrid-Barajas" },
      destino: { codigo: "BCN", nombre: "Barcelona-El Prat" },
      aerolinea: "American Airlines",
      hora_salida: "10:30",
      hora_llegada: "11:45",
    },

    equipaje: {
      tipo: "Maleta de mano",
      color: "Negro",
      marca: "Samsonite",
      peso: "8.5 kg",
      descripcion: "Maleta rígida negra con ruedas, contiene ropa y documentos personales",
      etiqueta: "AA1234MAD001",
      ubicacion_actual: "Almacén Terminal 2 - Madrid",
      problema: "Dañado durante manipulación",
    },

    historial: [
      {
        fecha: "2024-12-15T14:30:00Z",
        estado: "Recibido",
        descripcion: "Reclamo registrado en el sistema",
        agente: "Juan Pérez",
      },
      {
        fecha: "2024-12-15T15:45:00Z",
        estado: "En investigación",
        descripcion: "Iniciada búsqueda en sistema World Tracer",
        agente: "Ana López",
      },
      {
        fecha: "2024-12-15T17:20:00Z",
        estado: "Equipaje localizado",
        descripcion: "Encontrado en almacén de Terminal 2",
        agente: "Carlos Ruiz",
      },
      {
        fecha: "2024-12-16T09:15:00Z",
        estado: "En reparación",
        descripcion: "Enviado a taller especializado para reparación de ruedas",
        agente: "María Santos",
      },
    ],

    documentos: [
      { nombre: "Formulario PIR Original", tipo: "PDF", fecha: "2024-12-15" },
      { nombre: "Fotos del daño", tipo: "JPG", fecha: "2024-12-15" },
      { nombre: "Comprobante de vuelo", tipo: "PDF", fecha: "2024-12-15" },
      { nombre: "Presupuesto reparación", tipo: "PDF", fecha: "2024-12-16" },
    ],

    costos: {
      reparacion: 85.5,
      transporte: 25.0,
      compensacion: 150.0,
      total: 260.5,
      moneda: "EUR",
    },
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.reclamoId = this.route.snapshot.params["id"]
    // En producción, aquí cargarías los datos del reclamo desde un servicio
  }

  volver(): void {
    this.router.navigate(["/example"])
  }

  getEstadoColor(estado: string, subestado?: string): string {
    const estadoCompleto = subestado || estado

    switch (estadoCompleto.toLowerCase()) {
      case "pendiente":
        return "warn"
      case "en proceso":
      case "en investigación":
      case "en búsqueda":
        return "primary"
      case "en reparación":
      case "en proceso de pago":
        return "accent"
      case "resuelto":
      case "completado":
        return ""
      default:
        return "primary"
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado.toLowerCase()) {
      case "recibido":
        return "description"
      case "en investigación":
        return "search"
      case "equipaje localizado":
        return "place"
      case "en reparación":
        return "build"
      case "en proceso de pago":
        return "credit_card"
      case "resuelto":
        return "check_circle"
      default:
        return "settings"
    }
  }

  actualizarEstado(): void {
    console.log("Actualizar Estado")
  }

  enviarNotificacion(): void {
    console.log("Enviar Notificación")
  }

  generarReporte(): void {
    console.log("Generar Reporte")
  }

  contactarPasajero(): void {
    console.log("Contactar Pasajero")
  }

  agregarDocumento(): void {
    console.log("Agregar Documento")
  }

  descargarDocumento(documento: Documento): void {
    console.log("Descargar documento:", documento.nombre)
  }
}
