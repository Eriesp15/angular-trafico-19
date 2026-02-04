import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import  { HttpClient } from "@angular/common/http"
import {  ClaimType, getClaimTypeConfig,  ClaimTypeConfig } from "../../models/claim-type-config.model"

type ClaimStatus = "PENDING" | "IN_PROCESS" | "PURCHASED" | "REPAIRED" | "LOST" | "FOUND" | "COMPENSATED" | "CLOSED"

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
  pirStatus: ClaimStatus = "PENDING"

  claimConfig: ClaimTypeConfig | null = null
  alertasDias: { tipo: string; mensaje: string; color: string }[] = []

  // URL base del backend
  private readonly apiUrl = "http://localhost:3700/api/v1/claims/view"

  // Datos que se muestran en el frontend
  reclamoData: any = null

  statusLabels: Record<ClaimStatus, string> = {
    PENDING: "Pendiente",
    IN_PROCESS: "En proceso",
    PURCHASED: "Comprado",
    REPAIRED: "Reparado",
    LOST: "Perdido",
    FOUND: "Encontrado",
    COMPENSATED: "Indemnizado",
    CLOSED: "Cerrado",
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    if (this.claimId) {
      this.loadClaim(this.claimId)
    }
    this.calcularDiasTranscurridos()
    this.loadPirStatus()
  }

  // Cargar un PIR desde el backend
  private loadClaim(pirNumber: string): void {
    this.http.get<any>(`${this.apiUrl}/${pirNumber}`).subscribe({
      next: (data) => {
        console.log("Datos del backend PIR:", data)

        // ------------------------------
        // Mapeo de pasajero
        // ------------------------------
        const nameParts = data.pasajero?.split(" ") || []
        const lastName = data.passengerLastName || nameParts.shift() || "—"
        const firstName = data.passengerName || nameParts.join(" ") || "—"

        const pasajero = {
          nombre: firstName,
          apellidoPaterno: lastName,
          apellidoMaterno: "—",
          direccionPermanente: data.permanentAddress ?? "—",
          direccionTemporal: data.temporaryAddress ?? "—",
          telefonoPermanente: data.permanentPhone ?? "—",
          telefonoTemporal: data.temporaryPhone ?? "—",
          email: "—",
          numeroBoleto: data.ticketNumber ?? "—",
          iniciales: data.initials ?? "—",
          passportNumber: data.passportNumber ?? "—",
          frequentFlyerId: data.frequentFlyerId ?? "—",
          language: data.language ?? "—",
        }

        // ------------------------------
        // Mapeo de reclamo
        // ------------------------------
        const reclamo = {
          tipo: data.claimType ?? "AHL",
          fecha: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "—",
          hora: "—",
          estacion: data.airport ?? "—",
          estacionesInvolucradas: data.ruta ?? "—",
          lossReason: data.lossReason ?? "—",
          hasInsurance: data.hasInsurance ?? false,
          estado: data.claimStatus || data.estado || "PENDING",
        }

        this.claimConfig = getClaimTypeConfig(reclamo.tipo as ClaimType)
        this.calcularAlertasDias()
        this.loadPirStatus()

        // ------------------------------
        // Mapeo de vuelo
        // ------------------------------
        const vuelo = {
          numero: data.flightNumbers?.[0]?.flightNo ?? "—",
          fecha: "—",
          horaSalida: "—",
          aerolinea: data.airline ?? "—",
        }

        // ------------------------------
        // Mapeo de ruta del vuelo
        // ------------------------------
        const routeStops = data.route?.routeStops ?? []
        const ruta = routeStops.map((rs: any, index: number) => ({
          codigo: rs?.stop?.code || "—",
          tipo: index === 0 ? "origen" : index === routeStops.length - 1 ? "destino" : "conexion",
          horario: "—",
        }))

        // ------------------------------
        // Mapeo de equipaje
        // ------------------------------
        const equipaje = {
          numeroTicket: data.ticketNumber ?? "—",
          ruta: data.ruta ?? "—",
          numeroVuelo: data.flightNumbers?.[0]?.flightNo ?? "—",
          fechaVuelo: "—",
          colorTipo: "—",
          marca: data.baggageMarks?.[0] ?? "—",
          contenido: data.contents?.join(", ") ?? "—",
          descripcion: data.bagDescriptions?.[0] ?? "—",
        }

        // ------------------------------
        // Mapeo de daños
        // ------------------------------
        const dano = {
          tipoDano: data.damages?.[0]?.damageType ?? "—",
          condicion: data.damages?.[0]?.condition ?? "—",
          partesAfectadas:
            data.damages?.map((d: any) => ({
              codigo: d.code ?? "—",
              nombre: d.description ?? "—",
            })) ?? [],
        }

        // ------------------------------
        // Asignar datos al frontend
        // ------------------------------
        this.reclamoData = {
          pasajero,
          reclamo,
          vuelo,
          ruta,
          equipaje,
          dano,
        }

        console.log("Datos mapeados para frontend:", this.reclamoData)
      },
      error: (err) => {
        console.error("Error cargando PIR:", err)
      },
    })
  }

  calcularDiasTranscurridos(): void {
    const fechaReclamo = new Date()
    fechaReclamo.setDate(fechaReclamo.getDate() - 22)

    const hoy = new Date()
    const diferencia = hoy.getTime() - fechaReclamo.getTime()
    this.diasTranscurridos = Math.floor(diferencia / (1000 * 60 * 60 * 24))
  }

  calcularAlertasDias(): void {
    if (!this.claimConfig) return

    this.alertasDias = []
    const config = this.claimConfig

    if (config.tipo === "AHL") {
      if (this.diasTranscurridos >= 21) {
        this.alertasDias.push({
          tipo: "INDEMNIZAR",
          mensaje: "Han pasado más de 21 días. Proceder con indemnización.",
          color: "#d32f2f",
        })
      } else if (this.diasTranscurridos >= 3) {
        this.alertasDias.push({
          tipo: "CONTENIDO",
          mensaje: "Han pasado más de 3 días. Solicitar formulario de contenido para búsqueda internacional.",
          color: "#f57c00",
        })
      } else if (this.diasTranscurridos >= 1) {
        this.alertasDias.push({
          tipo: "BUSQUEDA_INTERNACIONAL",
          mensaje: "Ha pasado más de 1 día. Iniciar búsqueda internacional con WorldTracer.",
          color: "#1976d2",
        })
      }
    }
  }

  isActionAllowed(action: string): boolean {
    if (!this.claimConfig) return true

    const actionMap: Record<string, keyof ClaimTypeConfig["accionesPermitidas"]> = {
      formularioContenido: "formularioContenido",
      realizarEntrega: "realizarEntrega",
      cerrarReclamo: "cerrarReclamo",
    }

    const key = actionMap[action]
    return key ? this.claimConfig.accionesPermitidas[key] : true
  }

  getTipoReclamo(): ClaimType {
    return (this.reclamoData?.reclamo?.tipo as ClaimType) || "AHL"
  }

  imprimirPIR(): void {
    window.print()
  }

  exportarPDF(): void {
    console.log("[v0] Exportando PDF...")
  }

  cerrar(): void {
    this.router.navigate(["/baggage"])
  }

  verHojaSeguimiento(): void {
    this.router.navigate(["/baggage/follow"])
  }

  verFormularioContenido(): void {
    this.router.navigate([`/baggage/claim/content/${this.claimId}`])
  }

  realizarEntrega(): void {
    this.router.navigate([`/baggage/claim/make-delivery/${this.claimId}`])
  }

  indemnizar(): void {
    this.router.navigate(["/baggage/claim/add-expense", this.claimId], {
      queryParams: { tipo: this.getTipoReclamo() },
    })
  }

  cerrarReclamo(): void {
    this.router.navigate([`/baggage/claim/closing-receipt/${this.claimId}`])
  }

  verGastos(): void {
    this.router.navigate(["/baggage/claim/expenses", this.claimId])
  }

  follow(): void {
    this.router.navigate(["/baggage/claim/follow", this.claimId])
  }

  contactoEstaciones(): void {
    this.router.navigate(["/baggage/claim/station-contact", this.claimId])
  }

  loadPirStatus(): void {
    const statusFromData = this.reclamoData?.reclamo?.estado || "PENDING"
    this.pirStatus = statusFromData as ClaimStatus
  }

  getPirStatusClass(): string {
    const statusClassMap: Record<ClaimStatus, string> = {
      PENDING: "status-pending",
      IN_PROCESS: "status-in-process",
      PURCHASED: "status-purchased",
      REPAIRED: "status-repaired",
      LOST: "status-lost",
      FOUND: "status-found",
      COMPENSATED: "status-compensated",
      CLOSED: "status-closed",
    }
    return statusClassMap[this.pirStatus] || "status-pending"
  }

  getPirStatusLabel(): string {
    return this.statusLabels[this.pirStatus] || "Pendiente"
  }
}
