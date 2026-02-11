import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatCardModule } from "@angular/material/card"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { Router, RouterModule } from "@angular/router"
import { HttpClient } from "@angular/common/http"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"
import { BreadcrumbComponent, BreadcrumbItem } from "@erp/components/breadcrumb/breadcrumb.component"

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
    MatProgressSpinnerModule,
    RouterModule,
    BreadcrumbComponent,
  ],
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, OnDestroy {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: "World Tracer" }
  ]

  worldTracerForm: FormGroup
  isProcessing = false
  successMessage = ""
  errorMessage = ""

  private destroy$ = new Subject<void>()
  private readonly apiUrl = "http://localhost:3700/api/v1"

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
  ) {
    this.worldTracerForm = this.fb.group({
      codigo: ["", [Validators.required, Validators.minLength(1)]],
      estado: ["", [Validators.required, Validators.minLength(1)]],
      descripcion: ["", [Validators.required, Validators.minLength(5)]],
    })
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  guardarWorldTracer(): void {
    if (this.worldTracerForm.invalid) return

    this.isProcessing = true
    this.successMessage = ""
    this.errorMessage = ""

    const worldTracerData = {
      codigo: this.worldTracerForm.get("codigo")?.value,
      estado: this.worldTracerForm.get("estado")?.value,
      descripcion: this.worldTracerForm.get("descripcion")?.value,
      fechaRegistro: new Date().toLocaleString('es-BO'),
    }

    console.log("[v0] Guardando información World Tracer:", worldTracerData)

    // TODO: Implementar llamada a backend para guardar datos de World Tracer
    // this.http.post(`${this.apiUrl}/world-tracer`, worldTracerData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response) => {
    //       this.successMessage = "Información del World Tracer guardada exitosamente"
    //       this.worldTracerForm.reset()
    //       this.isProcessing = false
    //       setTimeout(() => {
    //         this.successMessage = ""
    //       }, 5000)
    //     },
    //     error: (err) => {
    //       console.error("Error al guardar World Tracer:", err)
    //       this.errorMessage = "Error al guardar la información. Intente nuevamente."
    //       this.isProcessing = false
    //     },
    //   })

    // Simulación temporal
    setTimeout(() => {
      this.successMessage = "Información del World Tracer guardada exitosamente"
      this.worldTracerForm.reset()
      this.isProcessing = false
      setTimeout(() => {
        this.successMessage = ""
      }, 3000)
    }, 1000)
  }
}
