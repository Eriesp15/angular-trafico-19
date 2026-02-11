import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { HttpClient } from "@angular/common/http"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatRadioModule } from "@angular/material/radio"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: "./make-delivery.component.html",
  styleUrls: ["./make-delivery.component.scss"],
})
export class MakeDeliveryComponent implements OnInit {
  pirNumber = ""
  deliveryForm!: FormGroup
  selectedDeliveryType = "aeropuerto"
  showConfirmation = false
  confirmationData: ConfirmationData | null = null
  isLoading = false
  passengerInfo: any = null
  temporaryAddress = ""
  permanentAddress = ""
  temporaryPhone = ""
  permanentPhone = ""
  selectedAddressType: 'temporal' | 'permanente' = 'temporal'



  // URL del API
  private apiUrl = "http://localhost:3700/api/v1/delivery"

  deliveryTypes = [
    { value: "domicilio", label: "Envío a Domicilio", icon: "home" },
    { value: "aeropuerto", label: "Entrega en Aeropuerto", icon: "flight" },
  ]

  aeropuertos = AEROPUERTOS_BOA

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Obtener pirNumber de la URL (el parámetro se llama 'id' en la ruta)
    this.pirNumber = this.route.snapshot.params["id"]
    
    if (!this.pirNumber) {
      this.showError("No se proporcionó número de PIR")
      this.router.navigate(["/baggage/claim/list"])
      return
    }

    this.initializeForm()
    this.loadPassengerInfo()
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

  /**
   * Cargar información del pasajero desde el backend
   */
  loadPassengerInfo(): void {
    this.isLoading = true

    this.http.get<any>(`${this.apiUrl}/passenger-info/${this.pirNumber}`).subscribe({
      next: (data) => {
        this.passengerInfo = data

        this.temporaryAddress = data.temporaryAddress || ""
        this.permanentAddress = data.permanentAddress || ""
        this.temporaryPhone = data.temporaryPhone || ""
        this.permanentPhone = data.permanentPhone || ""

        // por defecto mostramos temporal
        this.deliveryForm.patchValue({
          direccion: this.temporaryAddress,
          telefono: this.temporaryPhone,
        })

        this.isLoading = false

        if (data.deliveryInstructions) {
          this.showInfo(`Instrucciones: ${data.deliveryInstructions}`)
        }
      },
      error: (error) => {
        console.error("Error al cargar información del pasajero:", error)
        this.isLoading = false
        this.showError(error.error?.message || "Error al cargar información del pasajero")
      },
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
      this.markFormGroupTouched(this.deliveryForm)
      this.showError("Por favor complete todos los campos requeridos")
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
      const aeropuertoSeleccionado = this.aeropuertos.find(
        (a) => a.codigo === formValue.aeropuerto
      )
      this.confirmationData = {
        tipo: "Entrega en Aeropuerto",
        aeropuerto: formValue.aeropuerto,
        nombreAeropuerto: aeropuertoSeleccionado?.nombre,
      }
    }

    this.showConfirmation = true
  }

  cancelar(): void {
    this.router.navigate([`/baggage/claim/view/${this.pirNumber}`])
  }

  /**
   * Confirmar y registrar la entrega en el backend
   */
  confirmarEntrega(): void {
    this.isLoading = true

    const deliveryData = {
      pirNumber: this.pirNumber,
      tipo: this.deliveryForm.value.tipo,
      addressType: this.selectedAddressType,
      direccion: this.deliveryForm.value.direccion,
      telefono: this.deliveryForm.value.telefono,
      referencia: this.deliveryForm.value.referencia,
      aeropuerto: this.deliveryForm.value.aeropuerto,
    }


    this.http.post<any>(`${this.apiUrl}/make-delivery`, deliveryData).subscribe({
      next: (response) => {
        console.log("Entrega registrada exitosamente:", response)
        this.isLoading = false
        
        // Mostrar mensaje de éxito
        this.showSuccess(response.message || "Entrega registrada exitosamente")
        
        // Redirigir a la vista del claim después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate([`/baggage/claim/view/${this.pirNumber}`])
        }, 1500)
      },
      error: (error) => {
        console.error("Error al registrar entrega:", error)
        this.isLoading = false
        this.showError(error.error?.message || "Error al registrar la entrega. Por favor intente nuevamente.")
        this.volver() // Volver al formulario para que el usuario pueda intentar de nuevo
      },
    })
  }

  volver(): void {
    this.showConfirmation = false
  }

  getDeliveryTypeLabel(value: string): string {
    return this.deliveryTypes.find((dt) => dt.value === value)?.label || ""
  }

  isFieldRequired(fieldName: string): boolean {
    const control = this.deliveryForm.get(fieldName)
    return control?.hasError("required") && (control?.touched || false)
  }

  onAddressTypeChange(tipo: 'temporal' | 'permanente'): void {
    this.selectedAddressType = tipo

    if (tipo === "temporal") {
      this.deliveryForm.patchValue({
        direccion: this.temporaryAddress,
        telefono: this.temporaryPhone,
      })
    } else {
      this.deliveryForm.patchValue({
        direccion: this.permanentAddress,
        telefono: this.permanentPhone,
      })
    }
  }


  /**
   * Marcar todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key)
      control?.markAsTouched()

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  /**
   * Mostrar mensaje de éxito
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
      panelClass: ["success-snackbar"],
    })
  }

  /**
   * Mostrar mensaje de error
   */
  private showError(message: string): void {
    this.snackBar.open(message, "Cerrar", {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
      panelClass: ["error-snackbar"],
    })
  }

  /**
   * Mostrar mensaje informativo
   */
  private showInfo(message: string): void {
    this.snackBar.open(message, "Cerrar", {
      duration: 4000,
      horizontalPosition: "center",
      verticalPosition: "top",
      panelClass: ["info-snackbar"],
    })
  }
}