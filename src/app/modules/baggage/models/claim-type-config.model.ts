// Define qué gastos, acciones y funcionalidades están disponibles para cada tipo de reclamo

export type ClaimType = "AHL" | "DAMAGED" | "PILFERED"

export interface ClaimTypeConfig {
  tipo: ClaimType
  nombre: string
  descripcion: string
  color: string
  // Gastos permitidos
  gastosPermitidos: {
    indemnizacion: boolean
    compraMaleta: boolean
    transporte: boolean
    primeraNecesidad: boolean
    otro: boolean
  }
  // Acciones permitidas
  accionesPermitidas: {
    formularioContenido: boolean
    realizarEntrega: boolean
    cerrarReclamo: boolean
  }
  // Tiempos de seguimiento en días
  tiemposSeguimiento: {
    busquedaLocal: number // Días para búsqueda local
    busquedaInternacional: number // Días para búsqueda internacional
    indemnizacion: number // Días máximos antes de indemnizar
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
      indemnizacion: false, // NO - Solo se indemniza si no se encuentra en 21 días (por peso)
      compraMaleta: false, // NO - No se compra maleta, se busca la original
      transporte: true, // SI - Para entrega del equipaje cuando se encuentre
      primeraNecesidad: true, // SI - Ropa, artículos de higiene mientras espera
      otro: true,
    },
    accionesPermitidas: {
      formularioContenido: true, // SI - Para búsqueda por contenido después de 3 días
      realizarEntrega: true, // SI - Cuando se encuentre el equipaje
      cerrarReclamo: true,
    },
    tiemposSeguimiento: {
      busquedaLocal: 1,
      busquedaInternacional: 3,
      indemnizacion: 21,
    },
  },

  // DPR/DAMAGED - Equipaje Dañado
  DAMAGED: {
    tipo: "DAMAGED",
    nombre: "Equipaje Dañado",
    descripcion: "Equipaje que llegó con daños físicos",
    color: "#f57c00",
    gastosPermitidos: {
      indemnizacion: true, // SI - Se calcula por el daño o se compra maleta nueva
      compraMaleta: true, // SI - Si el daño es irreparable
      transporte: true, // SI - Para recoger/entregar maleta reparada
      primeraNecesidad: false, // NO - El pasajero tiene su equipaje
      otro: true,
    },
    accionesPermitidas: {
      formularioContenido: false, // NO - No aplica, el equipaje está presente
      realizarEntrega: true, // SI - Entregar maleta reparada o nueva
      cerrarReclamo: true,
    },
    tiemposSeguimiento: {
      busquedaLocal: 0,
      busquedaInternacional: 0,
      indemnizacion: 15, // Días para evaluar reparación o reemplazo
    },
  },

  // PILFERED - Equipaje Saqueado/Contenido Faltante
  PILFERED: {
    tipo: "PILFERED",
    nombre: "Equipaje Saqueado",
    descripcion: "Equipaje con contenido faltante o violado",
    color: "#d32f2f",
    gastosPermitidos: {
      indemnizacion: true, // SI - Por diferencia de peso (contenido faltante)
      compraMaleta: false, // NO - La maleta está presente
      transporte: false, // NO - El pasajero ya tiene su maleta
      primeraNecesidad: false, // NO - El pasajero tiene su equipaje
      otro: true,
    },
    accionesPermitidas: {
      formularioContenido: true, // SI - Para documentar contenido faltante
      realizarEntrega: false, // NO - El equipaje ya está con el pasajero
      cerrarReclamo: true,
    },
    tiemposSeguimiento: {
      busquedaLocal: 0,
      busquedaInternacional: 0,
      indemnizacion: 30, // Días para investigación y resolución
    },
  },
}

// Helper para obtener la configuración de un tipo de reclamo
export function getClaimTypeConfig(tipo: ClaimType): ClaimTypeConfig {
  return CLAIM_TYPE_CONFIGS[tipo] || CLAIM_TYPE_CONFIGS.AHL
}

// Helper para verificar si un gasto está permitido
export function isExpenseAllowed(tipo: ClaimType, gastoId: string): boolean {
  const config = getClaimTypeConfig(tipo)
  const gastoMap: Record<string, keyof ClaimTypeConfig["gastosPermitidos"]> = {
    indemnizacion: "indemnizacion",
    compra_maleta: "compraMaleta",
    transporte: "transporte",
    primera_necesidad: "primeraNecesidad",
    otro: "otro",
  }
  const key = gastoMap[gastoId]
  return key ? config.gastosPermitidos[key] : false
}
