import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatRadioModule } from "@angular/material/radio"
import { AEROPUERTOS_BOA } from "../../models/claim-type-config.model"

interface ConfirmationData {
  tipo: string
  direccion?: string
  telefono?: string
  referencia?: string
  aeropuerto?: string
  nombreAeropuerto?: string
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
  selectedDeliveryType = "aeropuerto"
  showConfirmation = false
  confirmationData: ConfirmationData | null = null

  deliveryTypes = [
    { value: "domicilio", label: "Envío a Domicilio", icon: "home" },
    { value: "aeropuerto", label: "Entrega en Aeropuerto", icon: "flight" },
  ]

  aeropuertos = AEROPUERTOS_BOA

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
      tipo: ["aeropuerto", Validators.required],
      // Campos para envío a domicilio
      direccion: [""],
      telefono: [""],
      referencia: [""],
      // Campo para entrega en aeropuerto
      aeropuerto: [""],
    })

    this.deliveryForm.get("tipo")?.valueChanges.subscribe((value) => {
      this.selectedDeliveryType = value
      this.updateFormValidators()
    })
  }

  updateFormValidators(): void {
    const direccionControl = this.deliveryForm.get("direccion")
    const telefonoControl = this.deliveryForm.get("telefono")
    const aeropuertoControl = this.deliveryForm.get("aeropuerto")

    // Limpiar validadores
    direccionControl?.clearValidators()
    telefonoControl?.clearValidators()
    aeropuertoControl?.clearValidators()

    if (this.selectedDeliveryType === "domicilio") {
      direccionControl?.setValidators([Validators.required])
      telefonoControl?.setValidators([Validators.required])
      aeropuertoControl?.clearValidators()
    } else if (this.selectedDeliveryType === "aeropuerto") {
      direccionControl?.clearValidators()
      telefonoControl?.clearValidators()
      aeropuertoControl?.setValidators([Validators.required])
    }

    direccionControl?.updateValueAndValidity()
    telefonoControl?.updateValueAndValidity()
    aeropuertoControl?.updateValueAndValidity()
  }

  aceptar(): void {
    if (this.deliveryForm.invalid) {
      return
    }

    const formValue = this.deliveryForm.value

    if (formValue.tipo === "domicilio") {
      this.confirmationData = {
        tipo: "Envío a Domicilio",
        direccion: formValue.direccion,
        telefono: formValue.telefono,
        referencia: formValue.referencia || undefined,
      }
    } else {
      const aeropuertoSeleccionado = this.aeropuertos.find((a) => a.codigo === formValue.aeropuerto)
      this.confirmationData = {
        tipo: "Entrega en Aeropuerto",
        aeropuerto: formValue.aeropuerto,
        nombreAeropuerto: aeropuertoSeleccionado?.nombre,
      }
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
