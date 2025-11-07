import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterOutlet } from "@angular/router"
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { PIR } from "../../models/pir.model"
import { ClaimService } from "../../services/claim.service"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"

@Component({
  selector: "app-list",
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class ListComponent implements OnInit, OnDestroy {
  claims: PIR[] = []
  filteredClaims: PIR[] = []
  loading = true
  searchForm: FormGroup
  selectedStatus: PIR["status"] | "ALL" = "ALL"
  private destroy$ = new Subject<void>()

  constructor(
    private claimService: ClaimService,
    private fb: FormBuilder,
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

  private loadClaims(): void {
    this.loading = true
    this.claimService
      .getAllClaims()
      .pipe(takeUntil(this.destroy$))
      .subscribe((claims) => {
        this.claims = claims
        this.applyFilters()
        this.loading = false
      })
  }

  private setupSearch(): void {
    this.searchForm
      .get("query")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters()
      })
  }

  private applyFilters(): void {
    let result = [...this.claims]

    // Filtrar por estado
    if (this.selectedStatus !== "ALL") {
      result = result.filter((c) => c.status === this.selectedStatus)
    }

    // Filtrar por búsqueda
    const query = this.searchForm.get("query")?.value
    if (query && query.trim()) {
      result = result.filter(
        (c) =>
          c.claimReference.reference.toLowerCase().includes(query.toLowerCase()) ||
          c.passenger.lastName.toLowerCase().includes(query.toLowerCase()) ||
          c.passenger.firstName.toLowerCase().includes(query.toLowerCase()) ||
          c.id?.toLowerCase().includes(query.toLowerCase()),
      )
    }

    this.filteredClaims = result
  }

  filterByStatus(status: PIR["status"] | "ALL"): void {
    this.selectedStatus = status
    this.applyFilters()
  }

  deleteClaim(id: string | undefined): void {
    if (id && confirm("¿Está seguro de que desea eliminar este reclamo?")) {
      this.claimService
        .deleteClaim(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadClaims()
        })
    }
  }

  getStatusClass(status: PIR["status"]): string {
    return `status-${status.toLowerCase()}`
  }

  clearSearch(): void {
    this.searchForm.reset()
  }
}