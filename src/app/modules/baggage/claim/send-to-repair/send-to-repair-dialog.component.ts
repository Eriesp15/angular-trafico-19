import { Component, Inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { HttpClient } from "@angular/common/http"

interface DialogData {
  pirNumber: string
  equipaje?: {
    colorTipo?: string
    bagtags?: string
    contenido?: string
  }
  pasajero?: {
    nombre?: string
    apellidoPaterno?: string
    email?: string
    telefonoPermanente?: string
  }
}

@Component({
  selector: "app-send-to-repair-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: "./send-to-repair-dialog.component.html",
  styleUrls: ["./send-to-repair-dialog.component.scss"],
})
export class SendToRepairDialogComponent implements OnInit {
  repairForm!: FormGroup
  loading = false
  submitted = false

  repairProviders = [
    { id: "provider-1", name: "Reparaciones ABC" },
    { id: "provider-2", name: "Servicios de Reparación XYZ" },
    { id: "provider-3", name: "Taller Especializado" },
    { id: "provider-4", name: "Centro de Reparación Premium" },
  ]

  repairTypes = [
    { value: "cleaning", label: "Limpieza" },
    { value: "minor_repair", label: "Reparación Menor" },
    { value: "major_repair", label: "Reparación Mayor" },
    { value: "replacement", label: "Reemplazo" },
  ]

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<SendToRepairDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit(): void {
    this.initForm()
  }

  private initForm(): void {
    this.repairForm = this.fb.group({
      repairProvider: ["", Validators.required],
      repairType: ["", Validators.required],
      estimatedCost: ["", [Validators.required, Validators.min(0)]],
      estimatedDate: ["", Validators.required],
      description: ["", Validators.required],
      priority: ["medium", Validators.required],
      authorizeRepair: [false, Validators.requiredTrue],
      notes: [""],
    })
  }

  get f() {
    return this.repairForm.controls
  }

  get isFormValid(): boolean {
    return this.repairForm.valid
  }

  onSubmit(): void {
    this.submitted = true

    if (!this.repairForm.valid) {
      console.log("Formulario inválido", this.repairForm.errors)
      return
    }

    this.loading = true

    const payload = {
      pirNumber: this.data.pirNumber,
      repairData: this.repairForm.value,
      baggage: {
        description: this.data.equipaje?.colorTipo,
        bagtags: this.data.equipaje?.bagtags,
        content: this.data.equipaje?.contenido,
      },
      passenger: {
        name: `${this.data.pasajero?.nombre} ${this.data.pasajero?.apellidoPaterno}`,
        email: this.data.pasajero?.email,
        phone: this.data.pasajero?.telefonoPermanente,
      },
    }

    this.http.post("http://localhost:3700/api/v1/claims/send-to-repair", payload).subscribe({
      next: (response: any) => {
        this.loading = false
        console.log("Reparación enviada exitosamente", response)
        this.dialogRef.close({ success: true, data: response })
      },
      error: (error) => {
        this.loading = false
        console.error("Error al enviar a reparación", error)
        alert("Error al enviar a reparación: " + error.message)
      },
    })
  }

  onCancel(): void {
    this.dialogRef.close()
  }
}