import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators, type FormArray } from "@angular/forms"
import { Router } from "@angular/router"
import type { PIR } from "../../models/pir.model"
import { ClaimService } from "../../services/claim.service"

@Component({
  selector: "app-new-claim",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./new-claim.component.html",
  styleUrl: "./new-claim.component.scss",
})
export class NewClaimComponent implements OnInit {
  form: FormGroup
  claimTypeOptions = ["AHL", "DAMAGED", "PILFERED"]
  damageTypeOptions = ["MINOR", "MAJOR", "TOTAL"]
  damageConditionOptions = ["GOOD", "REASONABLE", "BAD"]
  damageLocationOptions = ["LOCK", "HANDLE", "BUCKLES", "WHEELS", "SIDE", "END", "TOP", "BOTTOM"]

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private claimService: ClaimService,
  ) {
    this.form = this.initializeForm()
  }

  ngOnInit(): void {
    this.form = this.initializeForm()
    this.initializeDynamicArrays()
    this.setupAutomaticExpansion()
    this.setupWeightCalculation()
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      // Sección 1: Estaciones involucradas
      stations: this.fb.array([this.createStationField()]),

      // Sección 2: Estación originadora, fecha y hora
      originStation: ["", Validators.required],
      originDate: ["", Validators.required],
      originTime: ["", Validators.required],

      // Sección 3: Tipo de reclamo
      claimType: ["", Validators.required],

      // Sección 4: Referencia
      airport: ["", [Validators.required, Validators.maxLength(3)]],
      airline: ["", [Validators.required, Validators.maxLength(2)]],
      reference: ["", [Validators.required, Validators.maxLength(5)]],

      // Sección 5: Datos del pasajero
      lastName: ["", Validators.required],
      firstName: ["", Validators.required],
      initials: ["", [Validators.required, Validators.maxLength(4)]],

      // Sección 6: Bag tags
      bagTags: this.fb.array([this.createBagTagField()]),

      // Sección 7: Color/Tipo/Descripción de maletas (5 campos)
      baggages: this.fb.array([this.createBaggageField()]),

      // Sección 8: Ruta de rastreo (ASU/VVI/CBB)
      routes: this.fb.array([this.createRouteField()]),

      // Sección 9: Números de vuelo (múltiples)
      flights: this.fb.array([this.createFlightField()]),

      // Sección 10: Marcas en la maleta
      marksOnBaggage: this.fb.array([this.createMarkField()]),

      // Sección 11: Contenido (máximo 2 artículos)
      contents: this.fb.array([this.createContentField()]),

      // Direcciones
      permanentAddress: ["", Validators.required],
      temporaryAddress: [""],
      permanentPhone: ["", Validators.required],
      temporaryPhone: [""],
      deliveryInstructions: [""],

      // Elementos adicionales
      language: [""],
      passportNumber: [""],
      ticketNumber: [""],
      pnrRecordLocator: [""],
      frequentTravelerID: [""],
      reasonForLoss: [""],
      freeText: [""],
      baggageWeight: [0],
      deliveredWeight: [0],
      weightDifference: [{ value: 0, disabled: true }],
      hasInsurance: [false],
      keysAttached: [false],
      lockCombinationCode: [""],
      nightKit: [""],
      agentName: [""],
      boaNumber: [""],
      cashAdvanceGiven: [0],

      // Información de daño
      damageType: [""],
      damageCondition: [""],
      damageLocation: [[]],

      // Firma
      passengerSignature: ["", Validators.required],
    })
  }

  private createStationField() {
    return this.fb.control("", [Validators.required, Validators.maxLength(7)])
  }

  private createBagTagField() {
    return this.fb.control("", [Validators.maxLength(5)])
  }

  private createBaggageField() {
    return this.fb.group({
      color: ["", [Validators.maxLength(7)]],
      type: ["", [Validators.maxLength(7)]],
      description: ["", [Validators.maxLength(7)]],
    })
  }

  private createRouteField() {
    return this.fb.group({
      leg1: ["", [Validators.maxLength(3)]],
      leg2: ["", [Validators.maxLength(3)]],
      leg3: ["", [Validators.maxLength(3)]],
    })
  }

  private createFlightField() {
    return this.fb.group({
      flightNumber: ["", [Validators.required]],
      date: ["", [Validators.required]],
    })
  }

  private createMarkField() {
    return this.fb.group({
      mark: ["", Validators.maxLength(50)],
    })
  }

  private createContentField() {
    return this.fb.group({
      item: ["", Validators.maxLength(50)],
    })
  }

  private initializeDynamicArrays(): void {
    const baggages = this.form.get("baggages") as FormArray
    if (baggages.length === 0) {
      baggages.push(this.createBaggageField())
    }

    const routes = this.form.get("routes") as FormArray
    if (routes.length === 0) {
      routes.push(this.createRouteField())
    }

    const flights = this.form.get("flights") as FormArray
    if (flights.length === 0) {
      flights.push(this.createFlightField())
    }

    const marks = this.form.get("marksOnBaggage") as FormArray
    if (marks.length === 0) {
      marks.push(this.createMarkField())
    }

    const contents = this.form.get("contents") as FormArray
    if (contents.length === 0) {
      contents.push(this.createContentField())
    }
  }

  private setupAutomaticExpansion(): void {
    const arrays = [
      { name: "stations", max: 5 },
      { name: "bagTags", max: 5 },
      { name: "baggages", max: 5 },
      { name: "routes", max: 10 },
      { name: "flights", max: 10 },
      { name: "marksOnBaggage", max: 3 },
      { name: "contents", max: 2 },
    ]

    arrays.forEach(({ name, max }) => {
      const array = this.form.get(name) as FormArray
      if (array) {
        array.valueChanges.subscribe(() => {
          const lastControl = array.at(array.length - 1)
          if (lastControl && lastControl.value && lastControl.value !== "" && array.length < max) {
            if (name === "baggages") {
              array.push(this.createBaggageField())
            } else if (name === "routes") {
              array.push(this.createRouteField())
            } else if (name === "flights") {
              array.push(this.createFlightField())
            } else if (name === "marksOnBaggage") {
              array.push(this.createMarkField())
            } else if (name === "contents") {
              array.push(this.createContentField())
            } else if (name === "bagTags") {
              array.push(this.createBagTagField())
            } else {
              array.push(this.createStationField())
            }
          }
        })
      }
    })
  }

  private setupWeightCalculation(): void {
    this.form.get('baggageWeight')?.valueChanges.subscribe(() => {
      this.calculateWeightDifference()
    })
    this.form.get('deliveredWeight')?.valueChanges.subscribe(() => {
      this.calculateWeightDifference()
    })
  }

  private calculateWeightDifference(): void {
    const baggageWeight = this.form.get('baggageWeight')?.value || 0
    const deliveredWeight = this.form.get('deliveredWeight')?.value || 0
    const difference = baggageWeight - deliveredWeight
    this.form.get('weightDifference')?.setValue(difference, { emitEvent: false })
  }

  shouldShowBaggageFields(): boolean {
    return (this.form.get("baggages") as FormArray).length > 0
  }

  getBaggages(): FormArray {
    return this.form.get("baggages") as FormArray
  }

  getRoutes(): FormArray {
    return this.form.get("routes") as FormArray
  }

  getFlights(): FormArray {
    return this.form.get("flights") as FormArray
  }

  getMarksOnBaggage(): FormArray {
    return this.form.get("marksOnBaggage") as FormArray
  }

  getContents(): FormArray {
    return this.form.get("contents") as FormArray
  }

  getBagTags(): FormArray {
    return this.form.get("bagTags") as FormArray
  }

  getStations(): FormArray {
    return this.form.get("stations") as FormArray
  }

  onSubmit(): void {
    if (this.form.valid) {
      const pir: PIR = this.mapFormToPIR()
      this.claimService.createClaim(pir)
      this.router.navigate(["/baggage/claim"])
    }
  }

  private mapFormToPIR(): PIR {
    const formValue = this.form.value
    return {
      id: `PIR-${Date.now()}`,
      stations: formValue.stations.filter((s: string) => s),
      originStation: { code: formValue.originStation },
      originDate: formValue.originDate,
      originTime: formValue.originTime,
      claimType: formValue.claimType,
      claimReference: {
        airport: formValue.airport,
        airline: formValue.airline,
        reference: formValue.reference,
      },
      passenger: {
        lastName: formValue.lastName,
        firstName: formValue.firstName,
        passport: formValue.passportNumber,
        ticketNumber: formValue.ticketNumber,
        frequentTravelerID: formValue.frequentTravelerID,
        permanentAddress: formValue.permanentAddress,
        temporaryAddress: formValue.temporaryAddress,
        permanentPhone: formValue.permanentPhone,
        temporaryPhone: formValue.temporaryPhone,
        initials: formValue.initials,
      },
      bagTags: formValue.bagTags.filter((tag: string) => tag),
      baggages: formValue.baggages.filter((b: any) => b.color || b.type || b.description),
      route: formValue.routes,
      flightNumber: formValue.flights.map((f: any) => f.flightNumber).filter((f: string) => f),
      flightDate: formValue.flights.length > 0 ? formValue.flights[0].date : "",
      route3LetterStops: "",
      additionalElements: {
        language: formValue.language,
        pnrRecordLocator: formValue.pnrRecordLocator,
        reasonForLoss: formValue.reasonForLoss,
        freeText: formValue.freeText,
        baggageWeight: formValue.baggageWeight,
        deliveredWeight: formValue.deliveredWeight,
        weightDifference: formValue.weightDifference,
        hasInsurance: formValue.hasInsurance,
        keysAttached: formValue.keysAttached,
        lockCombinationCode: formValue.lockCombinationCode,
        nightKit: formValue.nightKit,
        agentName: formValue.agentName,
        boaNumber: formValue.boaNumber,
        cashAdvanceGiven: formValue.cashAdvanceGiven,
      },
      deliveryInstructions: formValue.deliveryInstructions,
      damage: formValue.damageType
        ? {
            type: formValue.damageType,
            condition: formValue.damageCondition,
            damageLocation: formValue.damageLocation,
          }
        : undefined,
      passengerSignature: formValue.passengerSignature,
      status: "DRAFT",
    }
  }

  onCancel(): void {
    this.router.navigate(["/baggage/claim"])
  }
}