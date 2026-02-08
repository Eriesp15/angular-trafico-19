import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatCardModule } from "@angular/material/card"
import { MatDividerModule } from "@angular/material/divider"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { Router, RouterModule } from "@angular/router"
import { HttpClient } from "@angular/common/http"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"
import { BreadcrumbComponent, BreadcrumbItem } from '../shared/breadcrumb/breadcrumb.component';

interface SearchResult {
  id: string
  pirNumber: string
  passengerName: string
  claimType: string
  status: string
  createdAt: string
  bagtag?: string
  content?: string
}

@Component({
  selector: "app-search",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterModule,
    BreadcrumbComponent,
  ],
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, OnDestroy {
  breadcrumbItems: BreadcrumbItem[] = [{ label: "Buscar Equipaje" }]

  searchByBagTagForm: FormGroup
  searchByContentForm: FormGroup
  searchResults: SearchResult[] = []
  isSearching = false
  activeTab = 0
  noResults = false

  private destroy$ = new Subject<void>()
  private readonly apiUrl = "http://localhost:3700/api/v1"

  statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    IN_PROCESS: "En proceso",
    PURCHASED: "Comprado",
    REPAIRED: "Reparado",
    LOST: "Perdido",
    FOUND: "Encontrado",
    COMPENSATED: "Indemnizado",
    CLOSED: "Cerrado",
  }

  tipoLabels: Record<string, string> = {
    AHL: "Equipaje Faltante",
    DPR: "Equipaje Dañado",
    PILFERED: "Equipaje Saqueado",
    OHL: "Equipaje Sobrante",
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
  ) {
    this.searchByBagTagForm = this.fb.group({
      bagTag: ["", [Validators.required, Validators.minLength(3)]],
    })

    this.searchByContentForm = this.fb.group({
      description: ["", [Validators.required, Validators.minLength(3)]],
    })
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  searchByBagTag(): void {
    if (this.searchByBagTagForm.invalid) return

    this.isSearching = true
    this.noResults = false
    const bagTag = this.searchByBagTagForm.get("bagTag")?.value

    this.http
      .get<any[]>(`${this.apiUrl}/claims/list`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.searchResults = data
            .filter((item) => item.BagTag?.includes(bagTag))
            .map((item) => ({
              id: item.PIR,
              pirNumber: item.PIR,
              passengerName: item.Pasajero,
              claimType: item.Tipo,
              status: item.Estado,
              createdAt: item.Fecha,
              bagtag: item.BagTag,
            }))

          this.noResults = this.searchResults.length === 0
          this.isSearching = false
        },
        error: (err) => {
          console.error("Error en búsqueda:", err)
          this.isSearching = false
          this.noResults = true
        },
      })
  }

  searchByContent(): void {
    if (this.searchByContentForm.invalid) return

    this.isSearching = true
    this.noResults = false
    const description = this.searchByContentForm.get("description")?.value.toLowerCase()

    this.http
      .get<any[]>(`${this.apiUrl}/claims/list`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.searchResults = data
            .filter((item) => {
              const content = (item.Contenido || "").toLowerCase()
              const passenger = (item.Pasajero || "").toLowerCase()
              return content.includes(description) || passenger.includes(description)
            })
            .map((item) => ({
              id: item.PIR,
              pirNumber: item.PIR,
              passengerName: item.Pasajero,
              claimType: item.Tipo,
              status: item.Estado,
              createdAt: item.Fecha,
              content: item.Contenido,
            }))

          this.noResults = this.searchResults.length === 0
          this.isSearching = false
        },
        error: (err) => {
          console.error("Error en búsqueda:", err)
          this.isSearching = false
          this.noResults = true
        },
      })
  }

  getStatusClass(status: string): string {
    const statusClassMap: Record<string, string> = {
      PENDING: "status-pending",
      IN_PROCESS: "status-in-process",
      PURCHASED: "status-purchased",
      REPAIRED: "status-repaired",
      LOST: "status-lost",
      FOUND: "status-found",
      COMPENSATED: "status-compensated",
      CLOSED: "status-closed",
    }
    return statusClassMap[status] || "status-pending"
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status
  }

  getTipoLabel(tipo: string): string {
    return this.tipoLabels[tipo] || tipo
  }

  viewClaim(pirNumber: string): void {
    this.router.navigate(["/baggage/claim/view", pirNumber])
  }

  clearResults(): void {
    this.searchResults = []
    this.searchByBagTagForm.reset()
    this.searchByContentForm.reset()
    this.noResults = false
  }

  switchTab(tabIndex: number): void {
    this.activeTab = tabIndex
    this.clearResults()
  }
}
