// Modelo para Parte de Irregularidad Recibida (PIR)

export interface Station {
  code: string // 3 letras + 4 estaticos (ej: VVILLOB)
}

export interface DamageInfo {
  type: "MINOR" | "MAJOR" | "TOTAL"
  condition: "GOOD" | "REASONABLE" | "BAD"
  damageLocation: ("LOCK" | "HANDLE" | "BUCKLES" | "WHEELS" | "SIDE" | "END" | "TOP" | "BOTTOM")[]
}

export interface Baggage {
  color: string
  type: string
  description: string
  marks: string[]
  contents: string[]
  weight: number
  deliveredWeight?: number
}

export interface PassengerInfo {
  lastName: string
  firstName: string
  passport: string
  ticketNumber: string
  frequentTravelerID?: string
  permanentAddress: string
  temporaryAddress?: string
  permanentPhone: string
  temporaryPhone?: string
  initials: string // Max 4 letras
}

export interface ClaimReference {
  airport: string // 3 letras
  airline: string // 2 letras
  reference: string // 5 caracteres
}

export interface PIR {
  id?: string
  createdAt?: Date
  stations: Station[] // Max 5
  originStation: Station
  originDate: Date
  originTime: string
  claimType: "AHL" | "DAMAGED" | "PILFERED"
  claimReference: ClaimReference
  passenger: PassengerInfo
  bagTags: string[] // Max 5
  baggages: Baggage[] // Max 5
  route: string[] // 3 letras por ruta, max 10 rutas (ej: ['ASU', 'VVI', 'CBB'])
  flightNumber: string
  flightDate: Date
  route3LetterStops: string // Ejemplo: "asu>vvi>cbb"
  additionalElements: {
    language: string
    pnrRecordLocator: string
    reasonForLoss: string
    hasInsurance: boolean
    keysAttached: boolean
    lockCombinationCode?: string
    nightKit?: "MALE" | "FEMALE"
    agentName: string
    boaNumber: string
    cashAdvanceGiven: number
  }
  deliveryInstructions: string
  damage?: DamageInfo
  passengerSignature: string
  status: "DRAFT" | "REGISTERED" | "PROCESSING" | "RESOLVED" | "CLOSED"
}
