import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-view-claim",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: "./view-claim.component.html",
  styleUrls: ["./view-claim.component.scss"],
})
export class ViewClaimComponent implements OnInit {
  claimId = "";
  diasTranscurridos = 0;

  // URL base del backend
  private readonly apiUrl = "http://localhost:3700/api/v1/claims/view";

  // Datos que se muestran en el frontend
  reclamoData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"];
    if (this.claimId) {
      this.loadClaim(this.claimId);
    }
    this.calcularDiasTranscurridos();
  }

  // Cargar un PIR desde el backend
  private loadClaim(pirNumber: string): void {
    this.http.get<any>(`${this.apiUrl}/${pirNumber}`).subscribe({
      next: (data) => {
        console.log("Datos del backend PIR:", data);

        // ------------------------------
        // Mapeo de pasajero
        // ------------------------------
        const nameParts = (data.pasajero?.split(" ") || []);
        const lastName = data.passengerLastName || nameParts.shift() || "—";
        const firstName = data.passengerName || nameParts.join(" ") || "—";

        const pasajero = {
          nombre: firstName,
          apellidoPaterno: lastName,
          apellidoMaterno: "—", // No viene en el backend
          direccionPermanente: data.permanentAddress ?? "—",
          direccionTemporal: data.temporaryAddress ?? "—",
          telefonoPermanente: data.permanentPhone ?? "—",
          telefonoTemporal: data.temporaryPhone ?? "—",
          email: "—", // No viene en el backend
          numeroBoleto: data.ticketNumber ?? "—",
          iniciales: data.initials ?? "—",
          passportNumber: data.passportNumber ?? "—",
          frequentFlyerId: data.frequentFlyerId ?? "—",
          language: data.language ?? "—",
        };

        // ------------------------------
        // Mapeo de reclamo
        // ------------------------------
        const reclamo = {
          tipo: data.claimType ?? "—",
          fecha: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString()
            : "—",
          hora: "—", // No viene en el backend
          estacion: data.airport ?? "—",
          estacionesInvolucradas: data.ruta ?? "—",
          lossReason: data.lossReason ?? "—",
          hasInsurance: data.hasInsurance ?? false,
        };

        // ------------------------------
        // Mapeo de vuelo
        // ------------------------------
        const vuelo = {
          numero: data.flightNumbers?.[0]?.flightNo ?? "—",
          fecha: "—", // No viene en el backend
          horaSalida: "—", // No viene en el backend
          aerolinea: data.airline ?? "—",
        };

        // ------------------------------
        // Mapeo de ruta del vuelo con origen/conexion/destino
        // ------------------------------
        const routeStops = data.route?.routeStops ?? [];
        const ruta = routeStops.map((rs: any, index: number) => ({
          codigo: rs?.stop?.code || "—",
          tipo:
            index === 0
              ? "origen"
              : index === routeStops.length - 1
              ? "destino"
              : "conexion",
          horario: "—", // Si hay info de horarios, se puede agregar
        }));

        // ------------------------------
        // Mapeo de equipaje
        // ------------------------------
        const equipaje = {
          numeroTicket: data.ticketNumber ?? "—",
          ruta: data.ruta ?? "—",
          numeroVuelo: data.flightNumbers?.[0]?.flightNo ?? "—",
          fechaVuelo: "—",
          colorTipo: "—", // No hay info
          marca: data.baggageMarks?.[0] ?? "—",
          contenido: data.contents?.join(", ") ?? "—",
          descripcion: data.bagDescriptions?.[0] ?? "—",
        };

        // ------------------------------
        // Mapeo de daños
        // ------------------------------
        const dano = {
          tipoDano: data.damages?.[0]?.damageType ?? "—",
          condicion: data.damages?.[0]?.condition ?? "—",
          partesAfectadas: data.damages?.map((d: any) => ({
            codigo: d.code ?? "—",
            nombre: d.description ?? "—",
          })) ?? [],
        };

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
        };

        console.log("Datos mapeados para frontend:", this.reclamoData);
      },
      error: (err) => {
        console.error("Error cargando PIR:", err);
      },
    });
  }

  calcularDiasTranscurridos(): void {
    const fechaReclamo = new Date();
    fechaReclamo.setDate(fechaReclamo.getDate() - 22);

    const hoy = new Date();
    const diferencia = hoy.getTime() - fechaReclamo.getTime();
    this.diasTranscurridos = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  imprimirPIR(): void {
    window.print();
  }

  exportarPDF(): void {
    console.log("[v0] Exportando PDF...");
  }

  cerrar(): void {
    this.router.navigate(["/baggage"]);
  }

  verHojaSeguimiento(): void {
    this.router.navigate(["/baggage/follow"]);
  }

  verFormularioContenido(): void {
    console.log("[v0] Ver formulario contenido - ruta no asignada aún");
  }

  realizarEntrega(): void {
    this.router.navigate([`/baggage/claim/make-delivery/${this.claimId}`]);
  }

  indemnizar(): void {
    this.router.navigate(["/baggage/claim/add-expense", this.claimId]);
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
}
  