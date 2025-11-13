import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatRadioModule } from "@angular/material/radio"

interface ConfirmationData {
  tipo: string
  ubicacion?: string
  empresa?: string
  departamento?: string
}

@Component({
  selector: "app-make-delivery",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
  ],
  templateUrl: "./make-delivery.component.html",
  styleUrls: ["./make-delivery.component.scss"],
})
export class MakeDeliveryComponent implements OnInit {
  claimId = ""
  deliveryForm!: FormGroup
  selectedDeliveryType = "recojo"
  showConfirmation = false
  confirmationData: ConfirmationData | null = null

  deliveryTypes = [
    { value: "envio", label: "Envío" },
    { value: "aeropuerto", label: "Mandar a Aeropuerto" },
    { value: "recojo", label: "Recojo en el Aeropuerto" },
  ]

  departments = ["La Paz", "Cochabamba", "Santa Cruz", "Tarija", "Potosí", "Sucre", "Oruro", "Beni", "Pando"]

  shippingCompanies = ["Aeropuerto taxis", "El Jardin Radiomovil", "TotalExpress", "Taller Moto"]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    this.initializeForm()
  }

  initializeForm(): void {
    this.deliveryForm = this.fb.group({
      tipo: ["recojo", Validators.required],
      ubicacion: [""],
      empresa: [""],
      departamento: [""],
    })

    this.deliveryForm.get("tipo")?.valueChanges.subscribe((value) => {
      this.selectedDeliveryType = value
      this.updateFormValidators()
    })
  }

  updateFormValidators(): void {
    const ubicacionControl = this.deliveryForm.get("ubicacion")
    const empresaControl = this.deliveryForm.get("empresa")
    const departamentoControl = this.deliveryForm.get("departamento")

    // Clear validators
    ubicacionControl?.clearAsyncValidators()
    empresaControl?.clearAsyncValidators()
    departamentoControl?.clearAsyncValidators()

    if (this.selectedDeliveryType === "envio") {
      ubicacionControl?.setValidators([Validators.required])
      empresaControl?.setValidators([Validators.required])
      departamentoControl?.clearValidators()
    } else if (this.selectedDeliveryType === "aeropuerto") {
      ubicacionControl?.clearValidators()
      empresaControl?.clearValidators()
      departamentoControl?.setValidators([Validators.required])
    } else if (this.selectedDeliveryType === "recojo") {
      ubicacionControl?.clearValidators()
      empresaControl?.clearValidators()
      departamentoControl?.clearValidators()
    }

    ubicacionControl?.updateValueAndValidity()
    empresaControl?.updateValueAndValidity()
    departamentoControl?.updateValueAndValidity()
  }

  aceptar(): void {
    if (this.deliveryForm.invalid) {
      return
    }

    const formValue = this.deliveryForm.value
    this.confirmationData = {
      tipo: this.getDeliveryTypeLabel(formValue.tipo),
      ubicacion: formValue.ubicacion || undefined,
      empresa: formValue.empresa || undefined,
      departamento: formValue.departamento || undefined,
    }

    this.showConfirmation = true
  }

  cancelar(): void {
    this.router.navigate([`/baggage/claim/view/${this.claimId}`])
  }

  confirmarEntrega(): void {
    console.log("[v0] Entrega confirmada:", this.confirmationData)
    // Aquí iría la lógica para guardar en la base de datos
    this.router.navigate([`/baggage/claim/view/${this.claimId}`])
  }

  volver(): void {
    this.showConfirmation = false
  }

  getDeliveryTypeLabel(value: string): string {
    return this.deliveryTypes.find((dt) => dt.value === value)?.label || ""
  }

  isFieldRequired(fieldName: string): boolean {
    const control = this.deliveryForm.get(fieldName)
    return control?.hasError("required") && control?.touched
  }
}
