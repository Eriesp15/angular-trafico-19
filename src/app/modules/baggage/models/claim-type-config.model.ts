export type ClaimType = "AHL" | "DPR" | "PILFERED" | "OHL"

export type IndemnizacionTipo = "FALTANTE_CONTENIDO" | "EXTRAVIO_MALETA"

export type DPRSubtipo = "DANO_EQUIPAJE" | "FALTANTE_CONTENIDO"

export type TipoEntrega = "ENVIO_DOMICILIO" | "ENTREGA_AEROPUERTO"

// Estados del reclamo
export type ClaimStatus = "ABIERTO" | "CERRADO" | "ANULADO"

export interface ClaimTypeConfig {
  tipo: ClaimType
  nombre: string
  descripcion: string
  color: string
  // Gastos permitidos
  gastosPermitidos: {
    indemnizacionFaltanteContenido: boolean
    indemnizacionExtravioMaleta: boolean
    compraMaleta: boolean
    reparacionMaleta: boolean
    transporte: boolean
    primeraNecesidad: boolean
    otro: boolean
  }
  // Control de tiempo para habilitar indemnización
  diasParaIndemnizacion: number
  // Acciones permitidas
  accionesPermitidas: {
    formularioContenido: boolean
    realizarEntrega: boolean
    cerrarReclamo: boolean
    enviarCentral: boolean // Para OHL
  }
  // Tiempos de seguimiento en días
  tiemposSeguimiento: {
    busquedaLocal: number
    busquedaInternacional: number
    indemnizacion: number
  }
}

// Configuración por tipo de reclamo según el manual MSA de BOA
export const CLAIM_TYPE_CONFIGS: Record<ClaimType, ClaimTypeConfig> = {
  // AHL - Equipaje Faltante/Demorado
  AHL: {
    tipo: "AHL",
    nombre: "Equipaje Faltante",
    descripcion: "Equipaje que no llegó con el pasajero",
    color: "#1976d2",
    gastosPermitidos: {
      indemnizacionFaltanteContenido: false, // NO - AHL no tiene indemnización por contenido
      indemnizacionExtravioMaleta: true, // SI - Solo después de 21 días (15 USD/kg)
      compraMaleta: false, // NO - No se compra maleta, se busca la original
      reparacionMaleta: false,
      transporte: true, // SI - Para entrega del equipaje cuando se encuentre
      primeraNecesidad: true, // SI - Ropa, artículos de higiene mientras espera
      otro: true,
    },
    diasParaIndemnizacion: 21, // Solo después de 21 días se habilita indemnización
    accionesPermitidas: {
      formularioContenido: true, // SI - Para búsqueda por contenido después de 3 días
      realizarEntrega: true, // SI - Cuando se encuentre el equipaje
      cerrarReclamo: true,
      enviarCentral: false,
    },
    tiemposSeguimiento: {
      busquedaLocal: 1,
      busquedaInternacional: 3,
      indemnizacion: 21,
    },
  },

  // DPR - Equipaje Dañado (incluye daño y faltante de contenido)
  DPR: {
    tipo: "DPR",
    nombre: "Equipaje Dañado",
    descripcion: "Equipaje con daños físicos o contenido faltante",
    color: "#f57c00",
    gastosPermitidos: {
      indemnizacionFaltanteContenido: true, // SI - Si hay faltante de contenido (después de 21 días)
      indemnizacionExtravioMaleta: false, // NO - La maleta está presente
      compraMaleta: true, // SI - Si el daño es irreparable
      reparacionMaleta: true, // SI - Si el daño es reparable
      transporte: true, // SI - Para recoger/entregar maleta reparada
      primeraNecesidad: false, // NO - El pasajero tiene su equipaje
      otro: true,
    },
    diasParaIndemnizacion: 21, // Indemnización por faltante de contenido después de 21 días
    accionesPermitidas: {
      formularioContenido: true, // SI - Para documentar contenido faltante
      realizarEntrega: true, // SI - Entregar maleta reparada o nueva
      cerrarReclamo: true,
      enviarCentral: false,
    },
    tiemposSeguimiento: {
      busquedaLocal: 0,
      busquedaInternacional: 0,
      indemnizacion: 21,
    },
  },

  // PILFERED - Equipaje Saqueado (solo para faltante de contenido confirmado)
  PILFERED: {
    tipo: "PILFERED",
    nombre: "Equipaje Saqueado",
    descripcion: "Equipaje con contenido faltante o violado",
    color: "#d32f2f",
    gastosPermitidos: {
      indemnizacionFaltanteContenido: true, // SI - Por diferencia de peso (15 USD/kg)
      indemnizacionExtravioMaleta: false, // NO - La maleta está presente
      compraMaleta: false, // NO - La maleta está presente
      reparacionMaleta: false,
      transporte: false, // NO - El pasajero ya tiene su maleta
      primeraNecesidad: false, // NO - El pasajero tiene su equipaje
      otro: true,
    },
    diasParaIndemnizacion: 0, // Se puede indemnizar inmediatamente (diferencia de peso)
    accionesPermitidas: {
      formularioContenido: true, // SI - Para documentar contenido faltante
      realizarEntrega: false, // NO - El equipaje ya está con el pasajero
      cerrarReclamo: true,
      enviarCentral: false,
    },
    tiemposSeguimiento: {
      busquedaLocal: 0,
      busquedaInternacional: 0,
      indemnizacion: 30,
    },
  },

  // OHL - Equipaje Sobrante No Reclamado
  OHL: {
    tipo: "OHL",
    nombre: "Equipaje Sobrante",
    descripcion: "Equipaje encontrado sin reclamar - Enviar a Central CBB",
    color: "#7b1fa2",
    gastosPermitidos: {
      indemnizacionFaltanteContenido: false,
      indemnizacionExtravioMaleta: false,
      compraMaleta: false,
      reparacionMaleta: false,
      transporte: true, // SI - Para envío a central
      primeraNecesidad: false,
      otro: true,
    },
    diasParaIndemnizacion: 0,
    accionesPermitidas: {
      formularioContenido: true, // SI - Para documentar contenido
      realizarEntrega: false, // NO - No hay pasajero
      cerrarReclamo: true,
      enviarCentral: true, // SI - Enviar a Cochabamba
    },
    tiemposSeguimiento: {
      busquedaLocal: 5, // 5 días para buscar dueño
      busquedaInternacional: 15, // 15 días WorldTracer
      indemnizacion: 0,
    },
  },
}

// Helper para obtener la configuración de un tipo de reclamo
export function getClaimTypeConfig(tipo: ClaimType): ClaimTypeConfig {
  return CLAIM_TYPE_CONFIGS[tipo] || CLAIM_TYPE_CONFIGS.AHL
}

export function isExpenseAllowed(tipo: ClaimType, gastoId: string, diasTranscurridos?: number): boolean {
  const config = getClaimTypeConfig(tipo)

  const gastoMap: Record<string, keyof ClaimTypeConfig["gastosPermitidos"]> = {
    indemnizacion_faltante_contenido: "indemnizacionFaltanteContenido",
    indemnizacion_extravio_maleta: "indemnizacionExtravioMaleta",
    compra_maleta: "compraMaleta",
    reparacion_maleta: "reparacionMaleta",
    transporte: "transporte",
    primera_necesidad: "primeraNecesidad",
    otro: "otro",
  }

  const key = gastoMap[gastoId]
  if (!key) return false

  const permitido = config.gastosPermitidos[key]

  // Verificar si la indemnización requiere días mínimos
  if (gastoId.startsWith("indemnizacion") && config.diasParaIndemnizacion > 0 && diasTranscurridos !== undefined) {
    return permitido && diasTranscurridos >= config.diasParaIndemnizacion
  }

  return permitido
}

export const AEROPUERTOS_BOA = [
  { codigo: "VVI", nombre: "Santa Cruz - Viru Viru", ciudad: "Santa Cruz" },
  { codigo: "LPB", nombre: "La Paz - El Alto", ciudad: "La Paz" },
  { codigo: "CBB", nombre: "Cochabamba - J. Wilstermann", ciudad: "Cochabamba", esCentral: true },
  { codigo: "SRE", nombre: "Sucre - Juana Azurduy", ciudad: "Sucre" },
  { codigo: "TJA", nombre: "Tarija - Oriel Lea Plaza", ciudad: "Tarija" },
  { codigo: "ORU", nombre: "Oruro - Juan Mendoza", ciudad: "Oruro" },
  { codigo: "POI", nombre: "Potosí - Capitán N. Rojas", ciudad: "Potosí" },
  { codigo: "TDD", nombre: "Trinidad - J. Aráuz", ciudad: "Trinidad" },
  { codigo: "CIJ", nombre: "Cobija - Aníbal Arab", ciudad: "Cobija" },
  { codigo: "RIB", nombre: "Riberalta", ciudad: "Riberalta" },
  { codigo: "GYA", nombre: "Guayaramerín", ciudad: "Guayaramerín" },
  { codigo: "RBQ", nombre: "Rurrenabaque", ciudad: "Rurrenabaque" },
  { codigo: "UYU", nombre: "Uyuni - Joya Andina", ciudad: "Uyuni" },
]

// Helper para obtener el aeropuerto central
export function getAeropuertoCentral() {
  return AEROPUERTOS_BOA.find((a) => a.esCentral)
}
