import { Component,  OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  Router, RouterOutlet } from "@angular/router"
import {  FormBuilder,  FormGroup, ReactiveFormsModule } from "@angular/forms"
import { MatPaginatorModule,  PageEvent } from "@angular/material/paginator"
import { MatSelectModule } from "@angular/material/select"
import { MatIconModule } from "@angular/material/icon"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"
import  { HttpClient } from "@angular/common/http"
import { AEROPUERTOS_BOA,  ClaimType,  ClaimStatus } from "../../models/claim-type-config.model"
import { BreadcrumbComponent, BreadcrumbItem } from "../../shared/breadcrumb/breadcrumb.component"

// Interfaz PIR
interface PIR {
  id?: string
  claimReference: {
    airport: string
    airline: string
    reference: string
  }
  passenger: {
    firstName: string
    lastName: string
  }
  claimType: ClaimType
  status: ClaimStatus
  createdAt: Date
  flight: string
  route: string
  bagTag: string
  tipo: string
  aeropuerto?: string
  derivedFromRegional?: string | null
  derivedAt?: Date | null
  originalRegional?: string | null
}

@Component({
  selector: "app-list",
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, MatPaginatorModule, MatSelectModule, MatIconModule, BreadcrumbComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class ListComponent implements OnInit, OnDestroy {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Lista de Reclamos'}
  ];
  claims: PIR[] = []
  filteredClaims: PIR[] = []
  paginatedClaims: PIR[] = []
  loading = true

  searchForm: FormGroup
  selectedStatus: ClaimStatus | "ALL" = "ALL"
  selectedType: "ALL" | ClaimType = "ALL"
  selectedAeropuerto = "ALL"
  selectedDerivedFilter: "all" | "derived" | "original" = "all"
  filterOption: "all" | "recent" | "date" = "all"
  selectedDate = ""

  aeropuertos = AEROPUERTOS_BOA

  pageSize = 10
  pageSizeOptions = [5, 10, 25, 50]
  pageIndex = 0

  private destroy$ = new Subject<void>()

  private readonly apiUrl = "http://localhost:3700/api/v1/claims/list"

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
  ) {
    this.searchForm = this.fb.group({
      query: [""],
    })
  }

  ngOnInit(): void {
    this.loadClaims()
    this.setupSearch()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  // Cargar reclamos desde backend
  private loadClaims(): void {
    this.loading = true

    const params = this.selectedStatus !== "ALL" ? { status: this.selectedStatus } : {}

    this.http
      .get<any[]>(this.apiUrl, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.claims = data.map((item) => {
            const nameParts = item.Pasajero.split(" ")
            const lastName = nameParts.shift() || ""
            const firstName = nameParts.join(" ") || ""

            return {
              id: item.PIR,
              claimReference: {
                airport: item.PIR.substring(0, 3),
                airline: item.PIR.substring(3, 5),
                reference: item.PIR.substring(5),
              },
              passenger: {
                firstName,
                lastName,
              },
              claimType: item.Tipo,
              status: item.Estado,
              createdAt: new Date(item.Fecha),
              flight: item.Vuelo ?? "",
              route: item.Ruta,
              bagTag: item.BagTag ?? "",
              tipo: item.Tipo,
              aeropuerto: item.PIR.substring(0, 3), // Extraer código aeropuerto del PIR
            } as PIR
          })

          this.applyFilters()
          this.loading = false
        },
        error: (err) => {
          console.error("Error cargando reclamos", err)
          this.loading = false
        },
      })
  }

  // Observador del buscador
  private setupSearch(): void {
    this.searchForm
      .get("query")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters())
  }

  filterByStatus(status: ClaimStatus | "ALL"): void {
    this.selectedStatus = status
    this.applyFilters()
  }

  filterByType(type: "ALL" | ClaimType): void {
    this.selectedType = type
    this.applyFilters()
  }

  filterByAeropuerto(aeropuerto: string): void {
    this.selectedAeropuerto = aeropuerto
    this.applyFilters()
  }

  filterByDerived(filter: "all" | "derived" | "original"): void {
    this.selectedDerivedFilter = filter
    this.applyFilters()
  }

  setFilterOption(option: "all" | "recent" | "date"): void {
    this.filterOption = option
    if (option !== "date") this.selectedDate = ""
    this.applyFilters()
  }

  onDateChange(date: string): void {
    this.selectedDate = date
    this.applyFilters()
  }

  private applyFilters(): void {
    let result = [...this.claims]

    if (this.selectedStatus !== "ALL") {
      result = result.filter((c) => c.status === this.selectedStatus)
    }

    // Filtro por tipo
    if (this.selectedType !== "ALL") {
      result = result.filter((c) => c.claimType === this.selectedType)
    }

    if (this.selectedAeropuerto !== "ALL") {
      result = result.filter((c) => c.aeropuerto === this.selectedAeropuerto)
    }

    // Filtro por reclamos derivados
    if (this.selectedDerivedFilter === "derived") {
      result = result.filter((c) => c.derivedFromRegional !== null && c.derivedFromRegional !== undefined)
    } else if (this.selectedDerivedFilter === "original") {
      result = result.filter((c) => !c.derivedFromRegional || c.derivedFromRegional === null)
    }

    if (this.filterOption === "recent") {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      result = result.filter((c) => c.createdAt >= sevenDaysAgo)
    } else if (this.filterOption === "date" && this.selectedDate) {
      const selDate = new Date(this.selectedDate)
      result = result.filter((c) => c.createdAt.toDateString() === selDate.toDateString())
    }

    const query = this.searchForm.get("query")?.value
    if (query?.trim()) {
      const lower = query.toLowerCase()
      result = result.filter(
        (c) =>
          c.id?.toLowerCase().includes(lower) ||
          c.passenger.firstName.toLowerCase().includes(lower) ||
          c.passenger.lastName.toLowerCase().includes(lower) ||
          c.claimReference.reference.toLowerCase().includes(lower) ||
          c.flight.toLowerCase().includes(lower) ||
          c.route.toLowerCase().includes(lower) ||
          c.bagTag.toLowerCase().includes(lower) ||
          c.claimType.toLowerCase().includes(lower) ||
          c.status.toLowerCase().includes(lower),
      )
    }

    this.filteredClaims = result
    this.pageIndex = 0
    this.updatePaginatedClaims()
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
    this.updatePaginatedClaims()
  }

  private updatePaginatedClaims(): void {
    const start = this.pageIndex * this.pageSize
    const end = start + this.pageSize
    this.paginatedClaims = this.filteredClaims.slice(start, end)
  }

  deleteClaim(id: string | undefined): void {
    if (id && confirm("¿Está seguro de que desea eliminar este reclamo?")) {
      this.claims = this.claims.filter((c) => c.id !== id)
      this.applyFilters()
    }
  }

  getStatusClass(status: ClaimStatus): string {
    return `status-${status.toLowerCase()}`
  }

  statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_PROCESS: 'En proceso',
    PURCHASED: 'Comprado',
    REPAIRED: 'Reparado',
    LOST: 'Perdido',
    FOUND: 'Encontrado',
    COMPENSATED: 'Indemnizado',
    CLOSED: 'Cerrado'
  };

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  tipoLabels: Record<string, string> = {
    AHL: "Equipaje Faltante",
    DPR: "Equipaje Dañado",
    PILFERED: "Equipaje Saqueado",
    OHL: "Equipaje Sobrante",
  }

  getTipoLabel(tipo: string): string {
    return this.tipoLabels[tipo] ?? tipo
  }

  clearSearch(): void {
    this.searchForm.reset()
    this.selectedStatus = "ALL"
    this.selectedType = "ALL"
    this.selectedAeropuerto = "ALL"
    this.filterOption = "all"
    this.selectedDate = ""
    this.applyFilters()
  }

  navigateToClaim(id: string | undefined): void {
    if (id) this.router.navigate(["/baggage/claim/view", id])
  }

  createNewClaim(): void {
    this.router.navigate(["/baggage/claim/new"])
  }

  createOHL(): void {
    this.router.navigate(["/baggage/ohl/new"])
  }
}
