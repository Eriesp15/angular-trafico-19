import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import  { HttpClient } from "@angular/common/http"
import { BreadcrumbComponent, BreadcrumbItem } from '@erp/components/breadcrumb/breadcrumb.component';
import { MatDialogModule, MatDialog } from "@angular/material/dialog"
import { ClaimStatusService } from "app/services/claim-status/claim-status.service"
import { ActionWizardService } from "../action-wizard/action-wizard.service"
import { ActionWizardComponent } from "../action-wizard/action-wizard.component"
import { DerivarButtonComponent } from '../../derivar-button/derivar-button.component';
import { ACTIONS } from "../action-wizard/action-config"

type FlowState = 'done' | 'current' | 'upcoming';

type FlowStep = {
  key: string;
  label: string;
  statuses: string[];
};

@Component({
  selector: "app-view-claim",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, BreadcrumbComponent, MatDialogModule, ActionWizardComponent,DerivarButtonComponent],
  templateUrl: "./view-claim.component.html",
  styleUrls: ["./view-claim.component.scss"],
})
export class ViewClaimComponent implements OnInit {
  claimId = "";
  pirData: any = null;
  antiguedadDias = 0;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Lista de Reclamos', url: '/baggage/claim/list' },
    { label: 'Visualizar Reclamo' } // Sin URL = no clickeable (página actual)
  ];

  // World Tracer fields
  worldTracerCodigo = ""
  worldTracerEstado = ""
  worldTracerDescripcion = ""
  flowSteps: FlowStep[] = [];

  // URL base del backend
  private readonly apiUrl = "http://localhost:3700/api/v1/claims/view";



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    public claimStatusService: ClaimStatusService,
    private actionWizard: ActionWizardService,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    if (this.claimId) {
      this.loadClaim(this.claimId)
    }
  }

  // Cargar un PIR desde el backend
  private loadClaim(pirNumber: string): void {
    this.http.get<any>(`${this.apiUrl}/${pirNumber}`).subscribe({
      next: (data) => {
        console.log("Datos del backend PIR:", data)
        this.pirData = data;
        this.calcularAntiguedad();
        this.breadcrumbItems = [
          { label: 'Lista de Reclamos', url: '/baggage/claim/list' },
          { label: 'Visualizar Reclamo' },
          { label: this.pirData?.pirNumber || '' }
        ];

        console.log("PIR cargado:", this.pirData)
        console.log("tipo de reclamo:", this.pirData.claimType)
        this.flowSteps = this.getFlowByClaimType(this.pirData?.claimType);
      },
      error: (err) => {
        console.error("Error cargando PIR:", err)
      },
    })
  }

  private calcularAntiguedad(): void {
    if (!this.pirData?.createdAt) {
      this.antiguedadDias = 0;
      return;
    }

    const fechaCreacion = new Date(this.pirData.createdAt);
    const ahora = new Date();
    const diferenciaMilisegundos = ahora.getTime() - fechaCreacion.getTime();

    // Calcular días
    this.antiguedadDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  }

  verFormularioContenido(): void {
    this.router.navigate([`/baggage/claim/content/${this.claimId}`])
  }

  realizarEntrega() {
    this.actionWizard.open('DELIVER', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  // Indemnizar (AHL, PILFERED, DPR)
  indemnizar() {
    this.actionWizard.open('COMPENSATE', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  indicarBusquedaLocal() {
    this.actionWizard.open('INDICATE_LOCAL_SEARCH', this.pirData, () => {
      this.loadClaim(this.claimId); // Recargar datos después de guardar
    });
  }

  indicarBusquedaWorldTracer() {
    this.actionWizard.open('INDICATE_WT_SEARCH', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

    // AHL - Encontrado
  indicarEncontrado() {
    this.actionWizard.open('INDICATE_FOUND', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  indicarRecibido() {
    this.actionWizard.open('INDICATE_RECEIVED', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  asignarTransporte() {
    this.actionWizard.open('ASSIGN_TRANSPORT', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  recojoEnAeropuerto() {
    this.actionWizard.open('AIRPORT_PICKUP', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  enviarAReparacion(): void {
  const pirNumber = this.pirData?.pirNumber;

  if (!pirNumber) {
    console.error('No se encontró pirNumber en pirData');
    return;
  }

  this.router.navigate(['/baggage/claim/repair-flow', pirNumber]);
}

  recogerMaleta() {
    this.actionWizard.open('PICKUP_REPAIRED', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  // DPR - Transferencia
  enviarACochabamba() {
    this.actionWizard.open('TRANSFER_TO_CBB', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  cerrarReclamoMal(): void {
    this.router.navigate([`/baggage/claim/closing-receipt/${this.claimId}`])
  }

  cerrarReclamo(): void {
    this.actionWizard.open('CLOSE_CLAIM', this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  verGastos(): void {
    this.router.navigate(["/baggage/claim/expenses", this.claimId])
  }

  anadirGasto(): void {
    this.router.navigate(["/baggage/claim/add-expense", this.claimId], {
      queryParams: {
        tipo: this.pirData?.claimType,
        fecha: this.pirData?.createdAt,
      },
    })
  }

  follow(): void {
    this.router.navigate(["/baggage/claim/follow", this.claimId])
  }

  contactoEstaciones(): void {
    this.router.navigate(["/baggage/claim/station-contact", this.claimId])
  }

  cambiarTipo() {
    const currentType = this.pirData.claimType;
    const allTypes = ['AHL', 'DPR', 'PILFERED'];
    const availableTypes = allTypes.filter(t => t !== currentType);

    const baseConfig = ACTIONS['CHANGE_CLAIM_TYPE'];
    const fields = baseConfig.fields.map((f: any) => {
      if (f.name === 'newClaimType') {
        return { ...f, options: availableTypes };
      }
      return f;
    });

    this.actionWizard.open({ ...baseConfig, fields }, this.pirData, () => {
      this.loadClaim(this.claimId);
    });
  }

  isAHL(): boolean {
    return this.pirData?.claimType === 'AHL';
  }
  isPILFERED(): boolean {
    return this.pirData?.claimType === 'PILFERED';
  }
  isDPR(): boolean {
    return this.pirData?.claimType === 'DPR';
  }

  getFlowState(step: FlowStep): FlowState {
    const status = this.pirData?.claim?.claimStatus;
    if (!status) return 'upcoming';

    const index = this.flowSteps.findIndex((item) => item.statuses.includes(status));
    const stepIndex = this.flowSteps.findIndex((item) => item.key === step.key);

    if (index < 0) return 'upcoming';
    if (stepIndex < index) return 'done';
    if (stepIndex === index) return 'current';
    return 'upcoming';
  }

  getFlowStateLabel(step: FlowStep): string {
    const state = this.getFlowState(step);
    if (state === 'done') return 'Realizado';
    if (state === 'current') return 'Realizado';
    return 'Por hacer';
  }

  getFlowStateIcon(step: FlowStep): string {
    const state = this.getFlowState(step);
    if (state === 'done') return 'check_circle';
    if (state === 'current') return 'check_circle';
    return 'radio_button_unchecked';
  }

  private getFlowByClaimType(claimType?: string): FlowStep[] {
    if (claimType === 'AHL') {
      return [
        { key: 'pending', label: 'Pendiente de gestión', statuses: ['PENDING', 'IN_PROCESS'] },
        { key: 'searching', label: 'En búsqueda', statuses: ['SEARCHING'] },
        { key: 'found', label: 'Encontrado', statuses: ['FOUND'] },
        { key: 'received', label: 'Recibido', statuses: ['RECEIVED'] },
        { key: 'assigned', label: 'Asignado a transporte', statuses: ['ASSIGNED'] },
        { key: 'delivered', label: 'Entregado', statuses: ['DELIVERED'] },
        { key: 'closed', label: 'Reclamo cerrado', statuses: ['CLOSED'] },
      ];
    }

    if (claimType === 'DPR') {
      return [
        { key: 'pending', label: 'Pendiente de gestión', statuses: ['PENDING'] },
        { key: 'repaired-route', label: 'Reparación / transferencia', statuses: ['REPAIRING', 'TRANSFERRED'] },
        { key: 'received', label: 'Recibido de reparación', statuses: ['REPAIRED'] },
        { key: 'assigned', label: 'Asignado a transporte', statuses: ['ASSIGNED'] },
        { key: 'compensated', label: 'Compra/indemnización', statuses: ['COMPENSATED'] },
        { key: 'delivered', label: 'Entregado', statuses: ['DELIVERED'] },
        { key: 'closed', label: 'Reclamo cerrado', statuses: ['CLOSED'] },
      ];
    }

    if (claimType === 'PILFERED') {
      return [
        { key: 'pending', label: 'Pendiente de gestión', statuses: ['PENDING'] },
        { key: 'compensated', label: 'Indemnizado', statuses: ['COMPENSATED'] },
        { key: 'closed', label: 'Reclamo cerrado', statuses: ['CLOSED'] },
      ];
    }

    return [];
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case "PENDING":
        return "badge-warning"
      case "IN_PROCESS":
      case "REPAIRED":
      case "REPAIRING":
      case "SEARCHING":
      case "TRANSFERRED":
      case "RECEIVED":
      case "ASSIGNED":
        return "badge-processing"
      case "PURCHASED":
      case "FOUND":
      case "DELIVERED":
        return "badge-registered"
      case "COMPENSATED":
        return "badge-resolved"
      case "CLOSED":
        return "badge-closed"
      default:
        return "badge-default"
    }
  }


}
