import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule,  Router } from "@angular/router"
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

@Component({
  selector: "app-new-claim",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./new-claim.component.html",
  styleUrls: ["./new-claim.component.scss"],
})
export class NewClaimComponent {
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
  }

  claimData = {
    originStation: "",
    date: "",
    time: "",
    claimType: "AHL",
    involvedStations: "",
  }

  baggageData = {
    airline: "",
    ticketNumber: "",
    route: "",
    flightNumber: "",
    flightDate: "",
    colorType: "",
    brand: "",
    content: "",
  }

  showBaggageModal = false
  showDamageModal = false

  baggageTypes: BaggageType[] = [
    {
      code: "50",
      name: "Bag",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B2A7E28D9-40DB-43A3-95F9-762C03156175%7D-OeN1yPXV3RquItS06HOkPOD0Pl2LOg.png",
    },
    {
      code: "51",
      name: "Courier Bag / Diplomatic Pouch",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B2A7E28D9-40DB-43A3-95F9-762C03156175%7D-OeN1yPXV3RquItS06HOkPOD0Pl2LOg.png",
    },
    {
      code: "52",
      name: "Trunk-Sampler",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B2A7E28D9-40DB-43A3-95F9-762C03156175%7D-OeN1yPXV3RquItS06HOkPOD0Pl2LOg.png",
    },
    {
      code: "53",
      name: "Add-Charge",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B2A7E28D9-40DB-43A3-95F9-762C03156175%7D-OeN1yPXV3RquItS06HOkPOD0Pl2LOg.png",
    },
    {
      code: "54",
      name: "Tube - without sporting",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B2A7E28D9-40DB-43A3-95F9-762C03156175%7D-OeN1yPXV3RquItS06HOkPOD0Pl2LOg.png",
    },
  ]

  damageParts: DamagePart[] = [
    { code: "C", name: "Combinación de cerradura / Combination locks", selected: false },
    { code: "H", name: "Jalador de mano / Retractable handles", selected: false },
    { code: "S", name: "Hebillas de seguro / Straps to close/secure", selected: false },
    { code: "W", name: "Ruedas / Wheels rollers", selected: false },
  ]

  selectedBaggageType: BaggageType | null = null

  constructor(private router: Router) {}

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

  toggleDamagePart(part: DamagePart) {
    part.selected = !part.selected
  }

  saveDamage() {
    this.closeDamageModal()
  }

  submitClaim() {
    console.log("[v0] Submitting claim:", {
      passenger: this.passengerData,
      claim: this.claimData,
      baggage: this.baggageData,
      damage: this.damageParts.filter((p) => p.selected),
    })
    alert("Reclamo guardado exitosamente")
  }

  cancel() {
    this.router.navigate(["/baggage"])
  }
}
