import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import {  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { AEROPUERTOS_BOA, getAeropuertoCentral } from "../../models/claim-type-config.model"

@Component({
  selector: "app-new-ohd",
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
  ],
  templateUrl: "./new-ohd.component.html",
  styleUrls: ["./new-ohd.component.scss"],
})
export class NewOhdComponent implements OnInit {
  ohdForm!: FormGroup
  aeropuertos = AEROPUERTOS_BOA
  aeropuertoCentral = getAeropuertoCentral()

  // Tipos de equipaje
  tiposEquipaje = [
    { value: "MALETA", label: "Maleta" },
    { value: "BOLSO", label: "Bolso" },
    { value: "MOCHILA", label: "Mochila" },
    { value: "CAJA", label: "Caja/Paquete" },
    { value: "OTRO", label: "Otro" },
  ]

  // Colores
  colores = [
    "Negro",
    "Azul",
    "Rojo",
    "Verde",
    "Gris",
    "Marrón",
    "Blanco",
    "Amarillo",
    "Naranja",
    "Rosa",
    "Morado",
    "Otro",
  ]

  showConfirmation = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm()
  }

  initializeForm(): void {
    this.ohdForm = this.fb.group({
      // Datos del equipaje
      bagTag: ["", Validators.required],
      tipoEquipaje: ["MALETA", Validators.required],
      marca: [""],
      color: ["", Validators.required],
      peso: [null, [Validators.required, Validators.min(0)]],

      // Ubicación encontrado
      aeropuertoOrigen: ["", Validators.required],
      lugarEncontrado: ["", Validators.required], // Banda, sala, avión, etc.
      fechaEncontrado: [new Date().toISOString().split("T")[0], Validators.required],

      // Descripción
      descripcion: [""],
      marcasDistintivas: [""],

      // Datos de vuelo (si se conocen)
      vueloOrigen: [""],
      rutaOrigen: [""],
    })
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.ohdForm.get(fieldName)
    return (control?.invalid && control?.touched) || false
  }

  continuar(): void {
    if (this.ohdForm.valid) {
      this.showConfirmation = true
    } else {
      this.ohdForm.markAllAsTouched()
    }
  }

  volver(): void {
    this.showConfirmation = false
  }

  confirmar(): void {
    const ohdData = {
      ...this.ohdForm.value,
      tipo: "OHD",
      estado: "ABIERTO",
      destino: this.aeropuertoCentral?.codigo, // Siempre a Central CBB
      fechaRegistro: new Date().toISOString(),
    }

    console.log("[v0] OHD registrado:", ohdData)
    this.router.navigate(["/baggage/claim/list"])
  }

  cancelar(): void {
    this.router.navigate(["/baggage/claim/list"])
  }

  getAeropuertoNombre(codigo: string): string {
    return this.aeropuertos.find((a) => a.codigo === codigo)?.nombre || codigo
  }
}
