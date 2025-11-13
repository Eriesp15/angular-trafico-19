import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router"
import { FormsModule } from "@angular/forms"

interface BaggageType {
  code: string
  name: string
  image: string
}

interface DamagePart {
  code: string
  name: string
  selected: boolean
}

interface DamageLocation {
  code: string
  name: string
  selected: boolean
}

@Component({
  selector: "app-new-claim",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./new-claim.component.html",
  styleUrls: ["./new-claim.component.scss"],
})
export class NewClaimComponent {
  pirFormat: "classic" | "modern" = "classic"

  passengerData = {
    firstName: "",
    paternalLastName: "",
    maternalLastName: "",
    permanentAddress: "",
    temporaryAddress: "",
    permanentPhone: "",
    temporaryPhone: "",
    email: "",
    ticketNumber: "",
    initials: "",
    passportNumber: "",
    frequentTravelerId: "",
    deliveryInstructions: "",
  }

  claimData = {
    involvedStations: "",
    originStation: "",
    originatorDate: "",
    originatorTime: "",
    airport: "",
    airline: "",
    reference: "",
    claimType: "AHL",
  }

  baggageData = {
    ticketNumber: "",
    bagtag: "",
    route: "",
    trackingPlace: "",
    flightNumber: "",
    flightDate: "",
    flightDay: "",
    flightMonth: "",
    colorType: "",
    brand: "",
    content: "",
    bagWeight: "",
    deliveredWeight: "",
    weightDifference: "",
    pnrLocator: "",
    lossReason: "",
    failureStation: "",
  }

  additionalData = {
    hasInsurance: false,
    needsKey: false,
    kitType: "", // "M" for male, "F" for female
    language: "",
    damageType: "", // "MINOR", "MAJOR", "TOTAL"
    damageCondition: "", // "GOOD", "REASONABLE", "BAD"
  }

  showBaggageModal = false
  showDamageModal = false
  showDamageLocationModal = false

  baggageTypes: BaggageType[] = [
    {
      code: "50",
      name: "Bag",
      image: "/images/7b2a7e28d9-40db-43a3-95f9-762c03156175-7d.png",
    },
    {
      code: "51",
      name: "Courier Bag / Diplomatic Pouch",
      image: "/images/7b2a7e28d9-40db-43a3-95f9-762c03156175-7d.png",
    },
    {
      code: "52",
      name: "Trunk-Sampler",
      image: "/images/7b2a7e28d9-40db-43a3-95f9-762c03156175-7d.png",
    },
    {
      code: "53",
      name: "Add-Charge",
      image: "/images/7b2a7e28d9-40db-43a3-95f9-762c03156175-7d.png",
    },
    {
      code: "54",
      name: "Tube - without sporting",
      image: "/images/7b2a7e28d9-40db-43a3-95f9-762c03156175-7d.png",
    },
  ]

  damageParts: DamagePart[] = [
    {
      code: "C",
      name: "Combinación de cerradura / Combination locks",
      selected: false,
    },
    {
      code: "H",
      name: "Jalador de mano / Retractable handles",
      selected: false,
    },
    {
      code: "S",
      name: "Hebillas de seguro / Straps to close/secure",
      selected: false,
    },
    { code: "W", name: "Ruedas / Wheels rollers", selected: false },
  ]

  damageLocations: DamageLocation[] = [
    { code: "L", name: "Lado / Side", selected: false },
    { code: "E", name: "Extremo / End", selected: false },
    { code: "A", name: "Arriba / Top", selected: false },
    { code: "B", name: "Abajo / Bottom", selected: false },
  ]

  selectedBaggageType: BaggageType | null = null
  selectedDamageLocations: string[] = []

  constructor(private router: Router) {}

  switchFormat(format: "classic" | "modern") {
    this.pirFormat = format
  }

  openBaggageModal() {
    this.showBaggageModal = true
  }

  closeBaggageModal() {
    this.showBaggageModal = false
  }

  selectBaggageType(type: BaggageType) {
    this.selectedBaggageType = type
    this.baggageData.colorType = `${type.code} - ${type.name}`
    this.closeBaggageModal()
  }

  openDamageModal() {
    this.showDamageModal = true
  }

  closeDamageModal() {
    this.showDamageModal = false
  }

  openDamageLocationModal() {
    this.showDamageLocationModal = true
  }

  closeDamageLocationModal() {
    this.showDamageLocationModal = false
  }

  toggleDamagePart(part: DamagePart) {
    part.selected = !part.selected
  }

  toggleDamageLocation(location: DamageLocation) {
    location.selected = !location.selected
    if (location.selected) {
      this.selectedDamageLocations.push(location.code)
    } else {
      this.selectedDamageLocations = this.selectedDamageLocations.filter((l) => l !== location.code)
    }
  }

  saveDamage() {
    this.closeDamageModal()
  }

  submitClaim() {
    console.log("[v0] Submitting claim with format:", this.pirFormat)
    console.log("[v0] Submitting claim:", {
      passenger: this.passengerData,
      claim: this.claimData,
      baggage: this.baggageData,
      additional: this.additionalData,
      damage: this.damageParts.filter((p) => p.selected),
      damageLocations: this.selectedDamageLocations,
    })
    alert("Reclamo guardado exitosamente")
  }

  cancel() {
    this.router.navigate(["/baggage"])
  }
}
