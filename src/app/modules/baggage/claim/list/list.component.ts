import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterOutlet } from "@angular/router"
import {  FormBuilder,  FormGroup, ReactiveFormsModule } from "@angular/forms"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"

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
  claimType: "AHL" | "DAMAGED" | "PILFERED"
  status: "DRAFT" | "REGISTERED" | "PROCESSING" | "RESOLVED" | "CLOSED"
  createdAt: Date
  flight: string
  route: string
  bagTag: string
  tipo: string
}

@Component({
  selector: "app-list",
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class ListComponent implements OnInit, OnDestroy {
  claims: PIR[] = [
    {
      id: "PIR001234",
      claimReference: { airport: "CBB", airline: "OB", reference: "001234" },
      passenger: { firstName: "Juan", lastName: "Pérez" },
      claimType: "AHL",
      status: "PROCESSING",
      createdAt: new Date("2024-01-15"),
      flight: "OB709",
      route: "CBB VVI",
      bagTag: "BA789456",
      tipo: "AHL",
    },
    {
      id: "PIR001235",
      claimReference: { airport: "CBB", airline: "OB", reference: "001235" },
      passenger: { firstName: "María", lastName: "García" },
      claimType: "DAMAGED",
      status: "REGISTERED",
      createdAt: new Date("2024-01-14"),
      flight: "OB787",
      route: "CBB VVI EZE",
      bagTag: "BA789457",
      tipo: "DAMAGED",
    },
    {
      id: "PIR001236",
      claimReference: { airport: "CBB", airline: "OB", reference: "001236" },
      passenger: { firstName: "Carlos", lastName: "López" },
      claimType: "PILFERED",
      status: "CLOSED",
      createdAt: new Date("2024-01-13"),
      flight: "OB546",
      route: "CBB VVI MAD",
      bagTag: "BA789458",
      tipo: "PILFERED",
    },
    {
      id: "PIR006323",
      claimReference: { airport: "CBB", airline: "OB", reference: "001236" },
      passenger: { firstName: "Samuel", lastName: "Sanchez" },
      claimType: "AHL",
      status: "PROCESSING",
      createdAt: new Date("2020-08-10"),
      flight: "OB546",
      route: "CBB VVI MAD",
      bagTag: "BA789458",
      tipo: "PILFERED",
    },
  ]
  filteredClaims: PIR[] = []
  loading = true
  searchForm: FormGroup
  selectedStatus: PIR["status"] | "ALL" = "ALL"
  selectedType: "ALL" | "AHL" | "DAMAGED" | "PILFERED" = "ALL"
  filterOption: "all" | "recent" | "date" = "all"
  selectedDate = ""
  private destroy$ = new Subject<void>()

  constructor(private fb: FormBuilder) {
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
    setTimeout(() => {
      this.applyFilters()
      this.loading = false
    }, 500)
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

    // Filter by status
    if (this.selectedStatus !== "ALL") {
      result = result.filter((c) => c.status === this.selectedStatus)
    }

    // Filter by type
    if (this.selectedType !== "ALL") {
      result = result.filter((c) => c.claimType === this.selectedType)
    }

    // Filter by date option
    if (this.filterOption === "recent") {
      // Show only last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      result = result.filter((c) => c.createdAt >= sevenDaysAgo)
    } else if (this.filterOption === "date" && this.selectedDate) {
      const selectedDate = new Date(this.selectedDate)
      result = result.filter((c) => c.createdAt.toDateString() === selectedDate.toDateString())
    }

    // Search across all fields
    const query = this.searchForm.get("query")?.value
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase()
      result = result.filter(
        (c) =>
          c.id?.toLowerCase().includes(lowerQuery) ||
          c.passenger.firstName.toLowerCase().includes(lowerQuery) ||
          c.passenger.lastName.toLowerCase().includes(lowerQuery) ||
          c.claimReference.reference.toLowerCase().includes(lowerQuery) ||
          c.flight.toLowerCase().includes(lowerQuery) ||
          c.route.toLowerCase().includes(lowerQuery) ||
          c.bagTag.toLowerCase().includes(lowerQuery) ||
          c.claimType.toLowerCase().includes(lowerQuery) ||
          c.status.toLowerCase().includes(lowerQuery),
      )
    }

    this.filteredClaims = result
  }

  filterByStatus(status: PIR["status"] | "ALL"): void {
    this.selectedStatus = status
    this.applyFilters()
  }

  filterByType(type: "ALL" | "AHL" | "DAMAGED" | "PILFERED"): void {
    this.selectedType = type
    this.applyFilters()
  }

  setFilterOption(option: "all" | "recent" | "date"): void {
    this.filterOption = option
    if (option !== "date") {
      this.selectedDate = ""
    }
    this.applyFilters()
  }

  onDateChange(date: string): void {
    this.selectedDate = date
    this.applyFilters()
  }

  deleteClaim(id: string | undefined): void {
    if (id && confirm("¿Está seguro de que desea eliminar este reclamo?")) {
      this.claims = this.claims.filter((c) => c.id !== id)
      this.loadClaims()
    }
  }

  getStatusClass(status: PIR["status"]): string {
    return `status-${status.toLowerCase()}`
  }

  clearSearch(): void {
    this.searchForm.reset()
    this.selectedStatus = "ALL"
    this.selectedType = "ALL"
    this.filterOption = "all"
    this.selectedDate = ""
    this.applyFilters()
  }
}
