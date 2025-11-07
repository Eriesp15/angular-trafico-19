import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import type { PIR } from "../models/pir.model"

@Injectable({
  providedIn: "root",
})
export class ClaimService {
  private claims: PIR[] = []
  private claimsSubject = new BehaviorSubject<PIR[]>([])
  public claims$ = this.claimsSubject.asObservable()

  constructor() {
    this.loadClaims()
  }

  /**
   * Obtener todos los reclamos
   */
  getAllClaims(): Observable<PIR[]> {
    return this.claims$
  }

  /**
   * Obtener un reclamo por ID
   */
  getClaimById(id: string): Observable<PIR | undefined> {
    return new Observable((observer) => {
      const claim = this.claims.find((c) => c.id === id)
      observer.next(claim)
      observer.complete()
    })
  }

  /**
   * Crear nuevo reclamo
   */
  createClaim(pir: PIR): Observable<PIR> {
    return new Observable((observer) => {
      // Generar ID si no existe
      if (!pir.id) {
        pir.id = this.generateId()
      }
      if (!pir.createdAt) {
        pir.createdAt = new Date()
      }
      if (!pir.status) {
        pir.status = "DRAFT"
      }

      this.claims.push(pir)
      this.saveClaims()
      this.claimsSubject.next([...this.claims])

      observer.next(pir)
      observer.complete()
    })
  }

  /**
   * Actualizar reclamo existente
   */
  updateClaim(id: string, pir: Partial<PIR>): Observable<PIR | undefined> {
    return new Observable((observer) => {
      const index = this.claims.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.claims[index] = { ...this.claims[index], ...pir }
        this.saveClaims()
        this.claimsSubject.next([...this.claims])
        observer.next(this.claims[index])
      } else {
        observer.next(undefined)
      }
      observer.complete()
    })
  }

  /**
   * Cambiar estado del reclamo
   */
  updateClaimStatus(id: string, status: PIR["status"]): Observable<PIR | undefined> {
    return new Observable((observer) => {
      const index = this.claims.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.claims[index].status = status
        this.saveClaims()
        this.claimsSubject.next([...this.claims])
        observer.next(this.claims[index])
      } else {
        observer.next(undefined)
      }
      observer.complete()
    })
  }

  /**
   * Eliminar reclamo
   */
  deleteClaim(id: string): Observable<boolean> {
    return new Observable((observer) => {
      const index = this.claims.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.claims.splice(index, 1)
        this.saveClaims()
        this.claimsSubject.next([...this.claims])
        observer.next(true)
      } else {
        observer.next(false)
      }
      observer.complete()
    })
  }

  /**
   * Buscar reclamos por referencia
   */
  searchClaims(query: string): Observable<PIR[]> {
    return new Observable((observer) => {
      const results = this.claims.filter(
        (c) =>
          c.claimReference.reference.toLowerCase().includes(query.toLowerCase()) ||
          c.passenger.lastName.toLowerCase().includes(query.toLowerCase()) ||
          c.passenger.firstName.toLowerCase().includes(query.toLowerCase()) ||
          c.id?.toLowerCase().includes(query.toLowerCase()),
      )
      observer.next(results)
      observer.complete()
    })
  }

  /**
   * Obtener reclamos por estado
   */
  getClaimsByStatus(status: PIR["status"]): Observable<PIR[]> {
    return new Observable((observer) => {
      const results = this.claims.filter((c) => c.status === status)
      observer.next(results)
      observer.complete()
    })
  }

  /**
   * Generar PDF del reclamo
   */
  generateClaimPDF(pir: PIR): void {
    // TODO: Implementar generación de PDF
    console.log("Generando PDF para reclamo:", pir.id)
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return `PIR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Guardar reclamos en localStorage
   */
  private saveClaims(): void {
    try {
      localStorage.setItem("baggage_claims", JSON.stringify(this.claims))
    } catch (error) {
      console.error("Error al guardar reclamos:", error)
    }
  }

  /**
   * Cargar reclamos desde localStorage
   */
  private loadClaims(): void {
    try {
      const stored = localStorage.getItem("baggage_claims")
      if (stored) {
        this.claims = JSON.parse(stored)
        this.claimsSubject.next([...this.claims])
      }
    } catch (error) {
      console.error("Error al cargar reclamos:", error)
    }
  }

  /**
   * Limpiar almacenamiento
   */
  clearAllClaims(): void {
    this.claims = []
    this.saveClaims()
    this.claimsSubject.next([])
  }
}
