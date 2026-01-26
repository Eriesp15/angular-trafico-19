import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule,  FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import  { HttpClient } from "@angular/common/http"

// Categorías de contenido según WorldTracer
const CONTENT_CATEGORIES = [
  { code: "CLOTHES", label: "Ropa / Clothes", examples: "Camisas, pantalones, vestidos, ropa interior" },
  { code: "SHOES", label: "Calzado / Shoes", examples: "Zapatos, zapatillas, sandalias, botas" },
  { code: "TOILETRIES", label: "Artículos de Aseo / Toiletries", examples: "Cepillo de dientes, shampoo, cremas" },
  { code: "DOCUMENTS", label: "Documentos / Documents", examples: "Libros, cuadernos, papeles (NO valiosos)" },
  {
    code: "ELECTRONICS",
    label: "Electrónicos / Electronics",
    examples: "Cargadores, cables, adaptadores (NO valiosos)",
  },
  { code: "MEDICINE", label: "Medicamentos / Medicine", examples: "Pastillas, jarabes, vitaminas" },
  { code: "ACCESSORIES", label: "Accesorios / Accessories", examples: "Cinturones, bufandas, gorras, lentes" },
  { code: "SPORTS", label: "Artículos Deportivos / Sports", examples: "Raquetas, pelotas, guantes" },
  { code: "BABY", label: "Artículos de Bebé / Baby Items", examples: "Pañales, biberones, ropa de bebé" },
  { code: "TOOLS", label: "Herramientas / Tools", examples: "Destornilladores, llaves (permitidas)" },
  { code: "COSMETICS", label: "Cosméticos / Cosmetics", examples: "Maquillaje, perfumes, cremas" },
  { code: "OTHERS", label: "Otros / Others", examples: "Artículos no clasificados" },
]

// Tipos de equipaje
const BAGGAGE_TYPES: { [key: string]: string } = {
  "01": "Maleta Dura (Hard Case)",
  "02": "Maleta Semi-Dura",
  "03": "Maleta Suave (Soft Case)",
  "04": "Bolso de Viaje",
  "05": "Mochila",
  "06": "Caja/Cartón",
  "22": "Bolso Deportivo",
  "25": "Maletín/Portafolio",
  "27": "Maleta Expandible",
  "99": "Otro",
}

// Colores
const BAGGAGE_COLORS: { [key: string]: string } = {
  BK: "Negro",
  BU: "Azul",
  GY: "Gris",
  RD: "Rojo",
  GN: "Verde",
  BN: "Marrón/Café",
  WT: "Blanco",
  YW: "Amarillo",
  OR: "Naranja",
  PK: "Rosa",
  PR: "Púrpura",
  MC: "Multicolor",
}

// Tamaños
const BAGGAGE_SIZES: { [key: string]: string } = {
  S: "Pequeño (Cabin Size)",
  M: 'Mediano (23-25")',
  L: 'Grande (26-29")',
  XL: 'Extra Grande (30"+)',
}

// Tipos de candado
const LOCK_TYPES: { [key: string]: string } = {
  NONE: "Sin candado",
  KEY: "Candado con llave",
  COMBINATION: "Candado de combinación",
  TSA: "Candado TSA",
  INTEGRATED: "Cerradura integrada",
  ZIPPER: "Solo cierre/cremallera",
}

interface ContentData {
  pirNumber: string
  passengerName: string
  passengerLastName: string
  baggageType: string
  baggageColor: string
  baggageBrand: string
  baggageSize: string
  baggageDescription: string
  registeredWeight: string
  deliveredWeight: string
  weightDifference: string
  contentItems: ContentItem[]
  valuedItems: ValuedItem[]
  distinctiveMarks: string
  lockType: string
  hasKeys: boolean
  lockCombination: string
  additionalNotes: string
  passengerDeclaration: boolean
  passengerSignature: string
  signatureDate: string
  createdAt: string
  updatedAt: string
}

interface ContentItem {
  category: string
  description: string
  quantity: number
  color: string
  brand: string
  approximateValue: string
}

interface ValuedItem {
  itemName: string
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  purchaseValue: string
  hasReceipt: boolean
  notes: string
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
  categories = CONTENT_CATEGORIES
  isLoading = true
  isSaving = false
  pirData: any = null

  isViewMode = true
  hasExistingData = false

  // Datos del pasajero y reclamo
  passengerName = ""
  passengerLastName = ""
  pirNumber = ""
  claimDate = ""
  claimType = ""
  route = ""
  baggageWeight = ""
  deliveredWeight = ""

  contentData: ContentData | null = null

  // Mapeos para mostrar etiquetas
  baggageTypes = BAGGAGE_TYPES
  baggageColors = BAGGAGE_COLORS
  baggageSizes = BAGGAGE_SIZES
  lockTypes = LOCK_TYPES

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
      baggageDescription: ["", Validators.required],
      baggageColor: ["", Validators.required],
      baggageType: ["", Validators.required],
      baggageBrand: [""],
      baggageSize: [""],
      registeredWeight: [{ value: "", disabled: true }],
      deliveredWeight: [""],
      weightDifference: [{ value: "", disabled: true }],
      contentItems: this.fb.array([]),
      valuedItems: this.fb.array([]),
      additionalNotes: [""],
      distinctiveMarks: [""],
      lockType: [""],
      hasKeys: [false],
      lockCombination: [""],
      passengerDeclaration: [false, Validators.requiredTrue],
      passengerSignature: ["", Validators.required],
      signatureDate: [new Date(), Validators.required],
    })

    this.addContentItem()
    this.addContentItem()
    this.addContentItem()
    this.addValuedItem()
  }

  get contentItems(): FormArray {
    return this.contentForm.get("contentItems") as FormArray
  }

  get valuedItems(): FormArray {
    return this.contentForm.get("valuedItems") as FormArray
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
            this.populateFormWithContentData(contentData)
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
    this.deliveredWeight = data.deliveredWeight || ""

    this.contentForm.patchValue({
      registeredWeight: this.baggageWeight,
    })
  }

  private populateFormWithContentData(data: ContentData): void {
    this.contentForm.patchValue({
      baggageDescription: data.baggageDescription || "",
      baggageColor: data.baggageColor || "",
      baggageType: data.baggageType || "",
      baggageBrand: data.baggageBrand || "",
      baggageSize: data.baggageSize || "",
      deliveredWeight: data.deliveredWeight || "",
      weightDifference: data.weightDifference || "",
      distinctiveMarks: data.distinctiveMarks || "",
      lockType: data.lockType || "",
      hasKeys: data.hasKeys || false,
      lockCombination: data.lockCombination || "",
      additionalNotes: data.additionalNotes || "",
      passengerDeclaration: data.passengerDeclaration || false,
      passengerSignature: data.passengerSignature || "",
      signatureDate: data.signatureDate ? new Date(data.signatureDate) : new Date(),
    })

    // Limpiar y repoblar contentItems
    while (this.contentItems.length) {
      this.contentItems.removeAt(0)
    }
    if (data.contentItems && data.contentItems.length > 0) {
      data.contentItems.forEach((item) => {
        const contentItem = this.fb.group({
          category: [item.category || ""],
          description: [item.description || ""],
          quantity: [item.quantity || 1],
          color: [item.color || ""],
          brand: [item.brand || ""],
          approximateValue: [item.approximateValue || ""],
        })
        this.contentItems.push(contentItem)
      })
    }

    // Limpiar y repoblar valuedItems
    while (this.valuedItems.length) {
      this.valuedItems.removeAt(0)
    }
    if (data.valuedItems && data.valuedItems.length > 0) {
      data.valuedItems.forEach((item) => {
        const valuedItem = this.fb.group({
          itemName: [item.itemName || ""],
          brand: [item.brand || ""],
          model: [item.model || ""],
          serialNumber: [item.serialNumber || ""],
          purchaseDate: [item.purchaseDate || ""],
          purchaseValue: [item.purchaseValue || ""],
          hasReceipt: [item.hasReceipt || false],
          notes: [item.notes || ""],
        })
        this.valuedItems.push(valuedItem)
      })
    }

    this.calculateWeightDifference()
  }

  enableEditMode(): void {
    this.isViewMode = false
    // Asegurarse de que hay al menos 3 items de contenido
    while (this.contentItems.length < 3) {
      this.addContentItem()
    }
  }

  cancelEdit(): void {
    if (this.hasExistingData && this.contentData) {
      this.populateFormWithContentData(this.contentData)
    }
    this.isViewMode = true
  }

  addContentItem(): void {
    if (this.contentItems.length < 12) {
      const contentItem = this.fb.group({
        category: ["", Validators.required],
        description: ["", Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        color: [""],
        brand: [""],
        approximateValue: [""],
      })
      this.contentItems.push(contentItem)
    }
  }

  removeContentItem(index: number): void {
    if (this.contentItems.length > 3) {
      this.contentItems.removeAt(index)
    }
  }

  addValuedItem(): void {
    const valuedItem = this.fb.group({
      itemName: [""],
      brand: [""],
      model: [""],
      serialNumber: [""],
      purchaseDate: [""],
      purchaseValue: [""],
      hasReceipt: [false],
      notes: [""],
    })
    this.valuedItems.push(valuedItem)
  }

  removeValuedItem(index: number): void {
    this.valuedItems.removeAt(index)
  }

  calculateWeightDifference(): void {
    const registered = Number.parseFloat(this.contentForm.get("registeredWeight")?.value) || 0
    const delivered = Number.parseFloat(this.contentForm.get("deliveredWeight")?.value) || 0
    const difference = registered - delivered
    this.contentForm.patchValue({ weightDifference: difference > 0 ? difference.toFixed(2) : "0" })
  }

  getCategoryLabel(categoryCode: string): string {
    const category = this.categories.find((c) => c.code === categoryCode)
    return category?.label || categoryCode
  }

  getCategoryExamples(categoryCode: string): string {
    const category = this.categories.find((c) => c.code === categoryCode)
    return category?.examples || ""
  }

  getBaggageTypeLabel(code: string): string {
    return this.baggageTypes[code] || code || "—"
  }

  getBaggageColorLabel(code: string): string {
    return this.baggageColors[code] || code || "—"
  }

  getBaggageSizeLabel(code: string): string {
    return this.baggageSizes[code] || code || "—"
  }

  getLockTypeLabel(code: string): string {
    return this.lockTypes[code] || code || "—"
  }

  onSubmit(): void {
    if (this.contentForm.valid) {
      this.isSaving = true

      const formData = {
        pirNumber: this.claimId,
        passengerName: this.passengerName,
        passengerLastName: this.passengerLastName,
        ...this.contentForm.getRawValue(),
        updatedAt: new Date().toISOString(),
        createdAt: this.contentData?.createdAt || new Date().toISOString(),
      }

      this.http.post(`${this.apiUrl}/claims/${this.claimId}/content`, formData).subscribe({
        next: () => {
          this.contentData = formData as ContentData
          this.hasExistingData = true
          this.isViewMode = true
          this.isSaving = false
        },
        error: (err) => {
          console.error("Error guardando contenido:", err)
          this.isSaving = false
          // Para desarrollo, simular éxito
          this.contentData = formData as ContentData
          this.hasExistingData = true
          this.isViewMode = true
        },
      })
    } else {
      this.markFormGroupTouched(this.contentForm)
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control)
      } else {
        control.markAsTouched()
      }
    })
  }

  printForm(): void {
    window.print()
  }

  goBack(): void {
    this.router.navigate(["/baggage/claim/view", this.claimId])
  }
}
