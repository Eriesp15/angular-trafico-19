import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

// Interfaz PIR
interface PIR {
  id?: string;
  claimReference: {
    airport: string;
    airline: string;
    reference: string;
  };
  passenger: {
    firstName: string;
    lastName: string;
  };
  claimType: "AHL" | "DAMAGED" | "PILFERED";
  status: "DRAFT" | "REGISTERED" | "PROCESSING" | "RESOLVED" | "CLOSED" | "PENDING";
  createdAt: Date;
  flight: string;
  route: string;
  bagTag: string;
  tipo: string;
}

@Component({
  selector: "app-list",
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class ListComponent implements OnInit, OnDestroy {
  claims: PIR[] = [];
  filteredClaims: PIR[] = [];
  paginatedClaims: PIR[] = [];
  loading = true;

  searchForm: FormGroup;
  selectedStatus: PIR["status"] | "ALL" = "ALL";
  selectedType: "ALL" | "AHL" | "DAMAGED" | "PILFERED" = "ALL";
  filterOption: "all" | "recent" | "date" = "all";
  selectedDate = "";

  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  pageIndex = 0;

  private destroy$ = new Subject<void>();

  private readonly apiUrl = "http://localhost:3700/api/v1/claims/list";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.searchForm = this.fb.group({
      query: [""],
    });
  }

  ngOnInit(): void {
    this.loadClaims();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cargar reclamos desde backend
  private loadClaims(): void {
    this.loading = true;

    const params = this.selectedStatus !== "ALL" ? { status: this.selectedStatus } : {};

    this.http.get<any[]>(this.apiUrl, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log("Datos crudos del backend:", data);

          this.claims = data.map(item => {
            const nameParts = item.Pasajero.split(" ");
            const lastName = nameParts.shift() || "";
            const firstName = nameParts.join(" ") || "";

            return {
              id: item.PIR,
              claimReference: {
                airport: item.PIR.substring(0, 3),
                airline: item.PIR.substring(3, 5),
                reference: item.PIR.substring(5),
              },
              passenger: {
                firstName,
                lastName
              },
              claimType: item.Tipo,
              status: item.Estado,
              createdAt: new Date(item.Fecha),
              flight: item.Vuelo ?? "",
              route: item.Ruta,
              bagTag: item.BagTag ?? "",
              tipo: item.Tipo
            } as PIR;
          });

          console.log("Datos mapeados a PIR:", this.claims);

          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando reclamos", err);
          this.loading = false;
        }
      });
  }

  // Observador del buscador
  private setupSearch(): void {
    this.searchForm.get("query")?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  // Filtros
  filterByStatus(status: PIR["status"] | "ALL"): void {
    this.selectedStatus = status;
    this.loadClaims(); // recarga desde backend
  }

  filterByType(type: "ALL" | "AHL" | "DAMAGED" | "PILFERED"): void {
    this.selectedType = type;
    this.applyFilters();
  }

  setFilterOption(option: "all" | "recent" | "date"): void {
    this.filterOption = option;
    if (option !== "date") this.selectedDate = "";
    this.applyFilters();
  }

  onDateChange(date: string): void {
    this.selectedDate = date;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.claims];

    if (this.selectedType !== "ALL") result = result.filter(c => c.claimType === this.selectedType);

    if (this.filterOption === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter(c => c.createdAt >= sevenDaysAgo);
    } else if (this.filterOption === "date" && this.selectedDate) {
      const selDate = new Date(this.selectedDate);
      result = result.filter(c => c.createdAt.toDateString() === selDate.toDateString());
    }

    const query = this.searchForm.get("query")?.value;
    if (query?.trim()) {
      const lower = query.toLowerCase();
      result = result.filter(c =>
        c.id?.toLowerCase().includes(lower) ||
        c.passenger.firstName.toLowerCase().includes(lower) ||
        c.passenger.lastName.toLowerCase().includes(lower) ||
        c.claimReference.reference.toLowerCase().includes(lower) ||
        c.flight.toLowerCase().includes(lower) ||
        c.route.toLowerCase().includes(lower) ||
        c.bagTag.toLowerCase().includes(lower) ||
        c.claimType.toLowerCase().includes(lower) ||
        c.status.toLowerCase().includes(lower)
      );
    }

    this.filteredClaims = result;
    this.pageIndex = 0;
    this.updatePaginatedClaims();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedClaims();
  }

  private updatePaginatedClaims(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedClaims = this.filteredClaims.slice(start, end);
  }

  deleteClaim(id: string | undefined): void {
    if (id && confirm("¿Está seguro de que desea eliminar este reclamo?")) {
      this.claims = this.claims.filter(c => c.id !== id);
      this.applyFilters();
    }
  }

  getStatusClass(status: PIR["status"]): string {
    return `status-${status.toLowerCase()}`;
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

  clearSearch(): void {
    this.searchForm.reset();
    this.selectedStatus = "ALL";
    this.selectedType = "ALL";
    this.filterOption = "all";
    this.selectedDate = "";
    this.applyFilters();
  }

  navigateToClaim(id: string | undefined): void {
    if (id) this.router.navigate(["/baggage/claim/view", id]);
  }

  createNewClaim(): void {
    this.router.navigate(["/baggage/claim/new"]);
  }
}
