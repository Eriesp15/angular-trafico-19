import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatDialogModule, MatDialog } from "@angular/material/dialog"
import { HttpClient } from "@angular/common/http"
import { ClaimType, getClaimTypeConfig, ClaimTypeConfig } from "../../models/claim-type-config.model"
import { BreadcrumbComponent, BreadcrumbItem} from "@erp/components/breadcrumb/breadcrumb.component"


type ClaimStatus = "PENDING" | "IN_PROCESS" | "PURCHASED" | "REPAIRED" | "LOST" | "FOUND" | "COMPENSATED" | "CLOSED"

@Component({
  selector: "app-view-claim",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule, MatDialogModule, BreadcrumbComponent],
  templateUrl: "./view-claim.component.html",
  styleUrls: ["./view-claim.component.scss"],
})
export class ViewClaimComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Lista de Reclamos', url: '/baggage/claim/list' },
    { label: 'Visualizar Reclamo'}
  ];
  claimId = ""
  diasTranscurridos = 0
  pirStatus: ClaimStatus = "PENDING"

  claimConfig: ClaimTypeConfig | null = null
  alertasDias: { tipo: string; mensaje: string; color: string }[] = []

  // World Tracer fields
  worldTracerCodigo = ""
  worldTracerEstado = ""
  worldTracerDescripcion = ""

  // URL base del backend
  private readonly apiUrl = "http://localhost:3700/api/v1/claims/view"

  // Datos que se muestran en el frontend
  reclamoData: any = null

  // Mapeo de estados sincronizado con list.component.ts
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
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    if (this.claimId) {
      this.loadClaim(this.claimId)
    }
    this.calcularDiasTranscurridos()
  }

  // Cargar un PIR desde el backend
  private loadClaim(pirNumber: string): void {
    this.http.get<any>(`${this.apiUrl}/${pirNumber}`).subscribe({
      next: (data) => {
        console.log("Datos del backend PIR:", data)

        // Recuperar y mapear pasajero
        const pasajero = {
          nombre: data.passengerName ?? "—",
          apellidoPaterno: data.passengerLastName ?? "—",
          apellidoMaterno: "—",
          direccionPermanente: data.permanentAddress ?? "—",
          direccionTemporal: data.temporaryAddress ?? "—",
          telefonoPermanente: data.permanentPhone ?? "—",
          telefonoTemporal: data.temporaryPhone ?? "—",
          email: data.email ?? "—",
          numeroBoleto: data.ticketNumber ?? "—",
          iniciales: data.initials ?? "—",
          passportNumber: data.passportNumber ?? "—",
          frequentFlyerId: data.frequentFlyerId ?? "—",
          language: data.language ?? "—",
          pnr: data.pnr ?? "—",
        }

        // Recuperar y mapear reclamo
        const reclamo = {
          tipo: data.claimType ?? "AHL",
          fecha: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "—",
          hora: data.createdAt ? new Date(data.createdAt).toLocaleTimeString() : "—",
          estacion: data.airport?.code ?? data.airport ?? "—",
          estacionesInvolucradas: data.route?.routeStops?.map((r: any) => r.stop?.code).join("-") ?? "—",
          lossReason: data.lossReason ?? "—",
          faultStation: data.faultStation ?? "—",
          hasInsurance: data.hasInsurance ?? false,
          estado: data.claimStatus || "PENDING",
          deliveryInstructions: data.deliveryInstructions ?? "—",
          additionalInfo: data.additionalInfo ?? "—",
        }

        this.claimConfig = getClaimTypeConfig(reclamo.tipo as ClaimType)
        this.calcularAlertasDias()
        this.pirStatus = reclamo.estado as ClaimStatus

        // Recuperar vuelos
        const flightNumbers = data.flightNumbers?.map((f: any) => ({
          numero: f.flightNo ?? "—",
          fecha: f.flightDate ? new Date(f.flightDate).toLocaleDateString() : "—",
          hora: f.flightDate ? new Date(f.flightDate).toLocaleTimeString() : "—",
        })) ?? []

        // Recuperar ruta del vuelo
        const ruta = data.route?.routeStops?.map((rs: any, index: number) => ({
          codigo: rs?.stop?.code || "—",
          ciudad: rs?.stop?.name || "—",
          tipo: index === 0 ? "origen" : index === (data.route?.routeStops?.length - 1) ? "destino" : "conexion",
          horario: rs?.scheduleTime ?? "—",
        })) ?? []

        // Recuperar equipaje
        const bagtags = data.bagtags?.map((b: any) => b.number) ?? []
        const bagDescriptions = data.bagDescriptions?.map((b: any) => b.description) ?? []
        const contents = data.contents?.map((c: any) => c.description) ?? []
        const baggageMarks = data.baggageIdentifications?.map((b: any) => b.mark) ?? []

        const equipaje = {
          numeroTicket: data.ticketNumber ?? "—",
          ruta: data.route?.routeStops?.map((r: any) => r.stop?.code).join("-") ?? "—",
          numeroVuelo: data.flightNumbers?.[0]?.flightNo ?? "—",
          fechaVuelo: data.flightNumbers?.[0]?.flightDate ? new Date(data.flightNumbers[0].flightDate).toLocaleDateString() : "—",
          bagtags: bagtags.join(", ") || "—",
          colorTipo: bagDescriptions.join(", ") || "—",
          marca: baggageMarks.join(", ") || "—",
          contenido: contents.join(", ") || "—",
          pesoFacturado: data.checkedBaggageWeight ?? "—",
          pesoEntregado: data.deliveredBaggageWeight ?? "—",
          diferenciaPeso: data.weightDifference ?? "—",
          tienesCerradasConLlave: data.keysAttached ? "Sí" : "No",
          combinacionCerradura: data.lockCombination ?? "—",
          kitNoche: data.nightKit ? "Sí" : "No",
        }

        // Recuperar daños
        const dano = {
          tipoDano: data.damageDetails?.[0]?.damageType ?? "—",
          condicion: data.damageDetails?.[0]?.condition ?? "—",
          partesAfectadas:
            data.damageDetails?.map((d: any) => ({
              codigo: d.damageLocation ?? "—",
              nombre: d.damageLocation ?? "—",
            })) ?? [],
          descripcionDano: data.damageDetails?.map((d: any) => d.description).join(", ") ?? "—",
        }

        // Información adicional
        const informacionAdicional = {
          pirNumber: data.pirNumber ?? "—",
          aeropuertoOrig: data.airport?.code ?? "—",
          aeropuertoText: data.airportText ?? "—",
          aerolinea: data.airline ?? "—",
          reference: data.reference ?? "—",
          traceRoute: data.traceRoute?.routeStops?.map((r: any) => r.stop?.code).join("-") ?? "—",
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString() : "—",
          updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—",
        }

        // Asignar todos los datos al frontend
        this.reclamoData = {
          pasajero,
          reclamo,
          vuelo: flightNumbers[0] || { numero: "—", fecha: "—", hora: "—" },
          vuelosCompletos: flightNumbers,
          ruta,
          equipaje,
          dano,
          informacionAdicional,
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

  enviarAReparacion(): void {
    import("../send-to-repair/send-to-repair-dialog.component").then(({ SendToRepairDialogComponent }) => {
      this.dialog.open(SendToRepairDialogComponent, {
        width: "800px",
        data: {
          pirNumber: this.reclamoData?.informacionAdicional?.pirNumber,
          pasajero: this.reclamoData?.pasajero,
          equipaje: this.reclamoData?.equipaje,
          reclamo: this.reclamoData?.reclamo,
        },
      })
    })
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
