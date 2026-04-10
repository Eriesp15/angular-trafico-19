import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { HttpClient } from "@angular/common/http"

interface ContentData {
  // Datos del Usuario
  fullName: string
  phone: string
  email: string
  // Datos del Equipaje Faltante
  flightNumbers: string
  baggageRoute: string
  flightDate: string
  baggageTicketNumber: string
  // Aduana y Embalaje
  customsDeclared: boolean
  customsAirport: string
  packed: boolean
  // Características del Equipaje
  baggageName: string
  baggageType: string
  material: string
  baggageColor: string
  baggageBrand: string
  baggageSize: string
  combinationCode: string
  wheels: string
  retractablePuller: boolean
  // Contenido
  contentItems: ContentItem[]
  // Declaración
  passengerDeclaration: boolean
  passengerSignature: string
  signatureDate: string
  receivedBy: string
  createdAt: string
  updatedAt: string
}

interface ContentItem {
  description: string
  gender: string
  size: string
  brand: string
  colorDescription: string
}

@Component({
  selector: "app-content",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: "./content.component.html",
  styleUrl: "./content.component.scss",
})
export class ContentComponent implements OnInit {
  claimId = ""
  contentForm!: FormGroup
  isLoading = true
  isSaving = false
  pirData: any = null

  isViewMode = true
  hasExistingData = false
  showSummary = false
  isConfirmed = false
  maxItems = 17

  // Datos del pasajero y reclamo
  passengerName = ""
  passengerLastName = ""
  pirNumber = ""
  claimDate = ""
  claimType = ""
  route = ""
  baggageWeight = ""

  contentData: ContentData | null = null

  // Mapeos para mostrar etiquetas
  baggageTypes: { [key: string]: string } = {
    RIGIDO: "Rígido",
    LONA: "Lona",
    METAL: "Metal",
    CUERO: "Cuero",
    OTRO: "Otro",
  }

  materials: { [key: string]: string } = {
    RIGIDO: "Rígido",
    LONA: "Lona",
    METAL: "Metal",
    CUERO: "Cuero",
  }

  baggageSizes: { [key: string]: string } = {
    PEQUEÑO: "Pequeño",
    MEDIANO: "Mediano",
    GRANDE: "Grande",
  }

  genders: { [key: string]: string } = {
    M: "M - Masculino",
    F: "F - Femenino",
    CH: "CH - Niño(a)",
    I: "I - Infante",
  }

  wheelsOptions = ["No", "2", "4", "5"]

  private readonly apiUrl = "http://localhost:3700/api/v1"

  constructor(
    private fb: FormBuilder,
    private route_: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    this.initForm()
  }

  ngOnInit(): void {
    this.claimId = this.route_.snapshot.params["id"]
    if (this.claimId) {
      this.loadContentData(this.claimId)
    }
  }

  private initForm(): void {
    this.contentForm = this.fb.group({
      // Datos del Usuario
      usuario: this.fb.group({
        fullName: ["", Validators.required],
        phone: ["", Validators.required],
        email: [""],
      }),
      // Datos del Equipaje Faltante
      equipajeFaltante: this.fb.group({
        flightNumbers: ["", Validators.required],
        baggageRoute: ["", Validators.required],
        flightDate: ["", Validators.required],
        baggageTicketNumber: [""],
      }),
      // Aduana y Embalaje
      aduana: this.fb.group({
        didAduana: ["No"],
        customsAirport: [""],
        packed: ["No"],
      }),
      // Características del Equipaje
      caracteristicas: this.fb.group({
        baggageName: [""],
        baggageType: [""],
        material: [""],
        baggageColor: [""],
        baggageBrand: [""],
        baggageSize: [""],
        combinationCode: [""],
        wheels: [""],
        retractablePuller: [false],
      }),
      // Items de contenido
      contentItems: this.fb.array([]),
      // Declaración y firma
      passengerDeclaration: [false, Validators.requiredTrue],
      passengerSignature: ["", Validators.required],
      signatureDate: [new Date(), Validators.required],
      receivedBy: [""],
    })

    // Inicializar con 3 items vacíos (como en el PDF)
    for (let i = 0; i < 3; i++) {
      this.addContentItem()
    }
  }

  get contentItems(): FormArray {
    return this.contentForm.get("contentItems") as FormArray
  }

  private loadContentData(pirNumber: string): void {
    this.isLoading = true

    // Primero cargar datos del PIR
    this.http.get<any>(`${this.apiUrl}/claims/view/${pirNumber}`).subscribe({
      next: (pirData) => {
        this.pirData = pirData
        this.populatePirInfo(pirData)

        // Luego intentar cargar datos de contenido existentes
        this.http.get<ContentData>(`${this.apiUrl}/claims/${pirNumber}/content`).subscribe({
          next: (contentData) => {
            this.contentData = contentData
            this.hasExistingData = true
            this.isViewMode = true
            this.isConfirmed = true
            this.populateFormWithContentData(contentData)
            this.contentForm.disable()
            this.isLoading = false
          },
          error: () => {
            // No hay datos de contenido, mostrar vacío en modo vista
            this.hasExistingData = false
            this.isViewMode = true
            this.isLoading = false
          },
        })
      },
      error: (err) => {
        console.error("Error cargando datos del PIR:", err)
        this.isLoading = false
      },
    })
  }

  private populatePirInfo(data: any): void {
    this.passengerName = data.passengerName || data.pasajero?.split(" ").slice(1).join(" ") || ""
    this.passengerLastName = data.passengerLastName || data.pasajero?.split(" ")[0] || ""
    this.pirNumber = this.claimId
    this.claimDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : ""
    this.claimType = data.claimType || ""
    this.route = data.ruta || ""
    this.baggageWeight = data.registeredWeight || ""

    // Pre-cargar nombre del pasajero en el formulario si está disponible
    if (this.passengerName || this.passengerLastName) {
      this.contentForm.get("usuario.fullName")?.setValue(`${this.passengerName} ${this.passengerLastName}`.trim())
    }
  }

  private populateFormWithContentData(data: ContentData): void {
    // Usuario
    this.contentForm.patchValue({
      usuario: {
        fullName: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
      },
      equipajeFaltante: {
        flightNumbers: data.flightNumbers || "",
        baggageRoute: data.baggageRoute || "",
        flightDate: data.flightDate || "",
        baggageTicketNumber: data.baggageTicketNumber || "",
      },
      aduana: {
        didAduana: data.customsDeclared ? "Si" : "No",
        customsAirport: data.customsAirport || "",
        packed: data.packed ? "Si" : "No",
      },
      caracteristicas: {
        baggageName: data.baggageName || "",
        baggageType: data.baggageType || "",
        material: data.material || "",
        baggageColor: data.baggageColor || "",
        baggageBrand: data.baggageBrand || "",
        baggageSize: data.baggageSize || "",
        combinationCode: data.combinationCode || "",
        wheels: data.wheels || "",
        retractablePuller: data.retractablePuller || false,
      },
      passengerDeclaration: data.passengerDeclaration || false,
      passengerSignature: data.passengerSignature || "",
      signatureDate: data.signatureDate ? new Date(data.signatureDate) : new Date(),
      receivedBy: data.receivedBy || "",
    })

    // Limpiar y repoblar contentItems
    while (this.contentItems.length) {
      this.contentItems.removeAt(0)
    }
    if (data.contentItems && data.contentItems.length > 0) {
      data.contentItems.forEach((item) => {
        const contentItem = this.fb.group({
          description: [item.description || ""],
          gender: [item.gender || ""],
          size: [item.size || ""],
          brand: [item.brand || ""],
          colorDescription: [item.colorDescription || ""],
        })
        this.contentItems.push(contentItem)
      })
    } else {
      // Si no hay items, crear 3 vacíos
      for (let i = 0; i < 3; i++) {
        this.addContentItem()
      }
    }
  }

  enableEditMode(): void {
    if (this.isConfirmed) return
    this.isViewMode = false
    this.contentForm.enable()
    // Asegurarse de que hay al menos 3 items de contenido
    while (this.contentItems.length < 3) {
      this.addContentItem()
    }
  }

  cancelEdit(): void {
    if (this.hasExistingData && this.contentData) {
      this.populateFormWithContentData(this.contentData)
      this.contentForm.disable()
    } else {
      // Reset form
      this.initForm()
      this.contentForm.enable()
    }
    this.isViewMode = true
    this.showSummary = false
  }

  createContentItem(): FormGroup {
    return this.fb.group({
      description: ["", Validators.required],
      gender: [""],
      size: [""],
      brand: [""],
      colorDescription: [""],
    })
  }

  addContentItem(): void {
    if (this.isConfirmed) return
    if (this.contentItems.length < this.maxItems) {
      this.contentItems.push(this.createContentItem())
    }
  }

  removeContentItem(index: number): void {
    if (this.isConfirmed) return
    if (this.contentItems.length > 1) {
      this.contentItems.removeAt(index)
    }
  }

  getBaggageTypeLabel(code: string): string {
    return this.baggageTypes[code] || code || "—"
  }

  getMaterialLabel(code: string): string {
    return this.materials[code] || code || "—"
  }

  getBaggageSizeLabel(code: string): string {
    return this.baggageSizes[code] || code || "—"
  }

  getGenderLabel(code: string): string {
    return this.genders[code] || code || "—"
  }

  onSubmit(): void {
    if (this.isConfirmed) return
    if (this.contentForm.invalid) {
      this.contentForm.markAllAsTouched()
      alert("Por favor, completa los campos obligatorios.")
      return
    }
    this.showSummary = true
  }

  confirmSummary(): void {
    if (this.isConfirmed) return

    this.isSaving = true
    const rawValue = this.contentForm.getRawValue()

    const payload: ContentData = {
      // Usuario
      fullName: rawValue.usuario.fullName || "",
      phone: rawValue.usuario.phone || "",
      email: rawValue.usuario.email || "",
      // Equipaje Faltante
      flightNumbers: rawValue.equipajeFaltante.flightNumbers || "",
      baggageRoute: rawValue.equipajeFaltante.baggageRoute || "",
      flightDate: rawValue.equipajeFaltante.flightDate || "",
      baggageTicketNumber: rawValue.equipajeFaltante.baggageTicketNumber || "",
      // Aduana
      customsDeclared: rawValue.aduana.didAduana === "Si",
      customsAirport: rawValue.aduana.customsAirport || "",
      packed: rawValue.aduana.packed === "Si",
      // Características
      baggageName: rawValue.caracteristicas.baggageName || "",
      baggageType: rawValue.caracteristicas.baggageType || "",
      material: rawValue.caracteristicas.material || "",
      baggageColor: rawValue.caracteristicas.baggageColor || "",
      baggageBrand: rawValue.caracteristicas.baggageBrand || "",
      baggageSize: rawValue.caracteristicas.baggageSize || "",
      combinationCode: rawValue.caracteristicas.combinationCode || "",
      wheels: rawValue.caracteristicas.wheels || "",
      retractablePuller: rawValue.caracteristicas.retractablePuller || false,
      // Contenido
      contentItems: rawValue.contentItems || [],
      // Declaración
      passengerDeclaration: rawValue.passengerDeclaration || false,
      passengerSignature: rawValue.passengerSignature || "",
      signatureDate: rawValue.signatureDate || new Date(),
      receivedBy: rawValue.receivedBy || "",
      createdAt: this.contentData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.http.post(`${this.apiUrl}/claims/${this.claimId}/content`, payload).subscribe({
      next: () => {
        this.contentData = payload
        this.hasExistingData = true
        this.isConfirmed = true
        this.showSummary = false
        this.isViewMode = true
        this.contentForm.disable()
        this.isSaving = false
        alert("Formulario guardado y bloqueado con éxito.")
      },
      error: (err) => {
        console.error("Error al guardar:", err)
        this.isSaving = false
        alert("Error al guardar el formulario. Revisa la consola.")
        // Para desarrollo, simular éxito
        this.contentData = payload
        this.hasExistingData = true
        this.isConfirmed = true
        this.showSummary = false
        this.isViewMode = true
        this.contentForm.disable()
      },
    })
  }

  backToForm(): void {
    this.showSummary = false
  }

  printSummary(): void {
    window.print()
  }

  printForm(): void {
    window.print()
  }

  goBack(): void {
    this.router.navigate(["/baggage/claim/view", this.claimId])
  }
}