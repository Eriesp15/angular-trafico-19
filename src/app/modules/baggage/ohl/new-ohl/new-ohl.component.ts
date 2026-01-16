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
  selector: "app-new-ohl",
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
  templateUrl: "./new-ohl.component.html",
  styleUrls: ["./new-ohl.component.scss"],
})
export class NewOhlComponent implements OnInit {
  ohlForm!: FormGroup
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
    this.ohlForm = this.fb.group({
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
    const control = this.ohlForm.get(fieldName)
    return (control?.invalid && control?.touched) || false
  }

  continuar(): void {
    if (this.ohlForm.valid) {
      this.showConfirmation = true
    } else {
      this.ohlForm.markAllAsTouched()
    }
  }

  volver(): void {
    this.showConfirmation = false
  }

  confirmar(): void {
    const ohlData = {
      ...this.ohlForm.value,
      tipo: "OHL",
      estado: "ABIERTO",
      destino: this.aeropuertoCentral?.codigo, // Siempre a Central CBB
      fechaRegistro: new Date().toISOString(),
    }

    console.log("[v0] OHL registrado:", ohlData)
    this.router.navigate(["/baggage/claim/list"])
  }

  cancelar(): void {
    this.router.navigate(["/baggage/claim/list"])
  }

  getAeropuertoNombre(codigo: string): string {
    return this.aeropuertos.find((a) => a.codigo === codigo)?.nombre || codigo
  }
}
