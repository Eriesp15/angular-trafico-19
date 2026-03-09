// ===== CONFIGURACIÓN DE ACCIONES =====
// Actualizado según MSA Parte C - Servicio de Equipajes (Rev. Original 01/09/2024)
const v = (label: string, value: any, suffix = '') =>
  value != null && value !== '' && value !== undefined
    ? `${label}: ${value}${suffix}. `
    : '';
    
const resolve = (pirData: any, path: string): any => {
  return path.split('.').reduce((obj, key) => {
    if (obj == null) return undefined;
    return Array.isArray(obj) ? obj[parseInt(key)] : obj[key];
  }, pirData);
};

export { resolve };

// ---------------------------------------------------------------------------

export const COMPENSATE = {
  id: 'COMPENSATE',
  title: 'Indemnizar Equipaje',

  // Campos del PIR que se autocompletan automáticamente al abrir el modal
  autofill: {
    checkedWeight:    'checkedBaggageWeight',
    deliveredWeight:  'deliveredBaggageWeight',
    weightDifference: 'weightDifference',
  },

  calculate: (formData: any) => {
    formData.total = (formData.weightDifference || 0) * (formData.pricePerKg || 0);
    return formData;
  },

  fields: [
    {
      name: 'compensationType',
      label: '* Tipo de indemnización',
      type: 'select',
      options: [
        'Pérdida total (por peso de etiqueta)',
        'Saqueo / Diferencia de peso',
        'Daño — Reposición de maleta',
        'Daño — Reembolso contra factura',
      ],
    },
    { name: 'checkedWeight',    label: 'Peso facturado (kg)',   type: 'number', readonly: true },
    { name: 'deliveredWeight',  label: 'Peso entregado (kg)',   type: 'number', readonly: true },
    { name: 'weightDifference', label: 'Diferencia (kg)',       type: 'number', readonly: true },
    { name: 'pricePerKg',       label: '* Precio por kg (USD)', type: 'number', placeholder: 'Nacional: 25 | Internacional: 10' },
    { name: 'total',            label: 'Total a pagar (USD)',   type: 'number', readonly: true },
    {
      name: 'paymentMethod',
      label: '* Método de pago',
      type: 'select',
      options: ['Efectivo', 'Reposición de maleta', 'Reembolso contra factura'],
    },
    { name: 'notes', label: 'Observaciones', type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `Indemnización procesada. ` +
    v('Tipo', data.compensationType) +
    v('Diferencia', data.weightDifference, 'kg') +
    v('Total', data.total, ' USD') +
    v('Método', data.paymentMethod) +
    v('Obs', data.notes),

  newStatus: 'COMPENSATED',
};

// ---------------------------------------------------------------------------

export const INDICATE_GPN = {
  id: 'INDICATE_GPN',
  title: 'Pagar Gastos de Primera Necesidad (GPN)',
  // MSA §6.2 — Solo aplica fuera de residencia con demora atribuible a BoA.
  // Nacional: Bs. 70 | Internacional: USD 50.

  fields: [
    {
      name: 'flightType',
      label: '* Tipo de vuelo',
      type: 'select',
      options: ['Nacional (Bs. 70)', 'Internacional (USD 50)'],
    },
    {
      name: 'delayAttributable',
      label: '* ¿Demora atribuible a BoA?',
      type: 'select',
      options: ['Sí', 'No — Late Check-In', 'No — Fuerza mayor', 'No — Exceso de equipaje'],
    },
    { name: 'gpnAmount',     label: '* Monto pagado',              type: 'number' },
    {
      name: 'currency',
      label: '* Moneda',
      type: 'select',
      options: ['BOB', 'USD'],
    },
    { name: 'receiptNumber', label: '* N° de comprobante de pago', type: 'text' },
    { name: 'notes', label: 'Observaciones', type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `GPN registrado. ` +
    v('Vuelo', data.flightType) +
    v('Demora atribuible a BoA', data.delayAttributable) +
    v('Monto', data.gpnAmount) +
    v('Moneda', data.currency) +
    v('Comprobante', data.receiptNumber) +
    v('Obs', data.notes),

  newStatus: 'GPN_PAID',
};

// ---------------------------------------------------------------------------

export const INDICATE_LOCAL_SEARCH = {
  id: 'INDICATE_LOCAL_SEARCH',
  title: 'Indicar Búsqueda Local',

  fields: [
    {
      name: 'searchArea',
      label: '* Área de búsqueda',
      type: 'select',
      options: [
        'Bodega / Buzones de aeronave',
        'Rampa',
        'Cinta de entrega',
        'Depósito / Almacén del aeropuerto',
        'Mostradores de Check-In',
        'Aduana',
        'Otra aerolínea en estación',
      ],
    },
    { name: 'searchDate', label: '* Fecha y hora de búsqueda', type: 'datetime-local' },
    {
      name: 'searchResult',
      label: '* Resultado',
      type: 'select',
      options: ['No encontrado', 'Encontrado — registrar en "Equipaje Encontrado"', 'Pendiente'],
    },
    { name: 'stationsContacted', label: 'Estaciones contactadas', type: 'text', placeholder: 'Ej: CBB, VVI, LPB' },
    { name: 'notes',              label: 'Observaciones',          type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `Búsqueda local iniciada. ` +
    v('Área', data.searchArea) +
    v('Resultado', data.searchResult) +
    v('Estaciones contactadas', data.stationsContacted) +
    v('Obs', data.notes),

  newStatus: 'SEARCHING',
};

// ---------------------------------------------------------------------------

export const INDICATE_WT_SEARCH = {
  id: 'INDICATE_WT_SEARCH',
  title: 'Indicar Búsqueda World Tracer',

  fields: [
    {
      name: 'fileType',
      label: '* Tipo de expediente',
      type: 'select',
      options: [
        'AHL — Equipaje demorado / faltante',
        'OHD — Equipaje sobrante',
        'DPR — Daño o saqueo',
      ],
    },
    { name: 'wtReference', label: '* Referencia World Tracer',  type: 'text', placeholder: 'Ej: VVIOB12345' },
    { name: 'searchDate',  label: '* Fecha de registro en WT',  type: 'datetime-local' },
    {
      name: 'actionFileReviewed',
      label: 'Estado del Action File',
      type: 'select',
      options: ['Sin novedades', 'Matches encontrados', 'Pendiente de revisión'],
    },
    { name: 'notes', label: 'Observaciones', type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `Búsqueda WT registrada. ` +
    v('Tipo', data.fileType) +
    v('Referencia', data.wtReference) +
    v('Action File', data.actionFileReviewed) +
    v('Obs', data.notes),

  newStatus: 'SEARCHING',
};

// ---------------------------------------------------------------------------

export const INDICATE_FOUND = {
  id: 'INDICATE_FOUND',
  title: 'Indicar Equipaje Encontrado',

  // Al encontrar el equipaje, se precarga el peso facturado como referencia
  autofill: {
    referenceWeight: 'checkedBaggageWeight',
  },

  fields: [
    { name: 'foundLocation', label: '* Lugar donde se encontró',  type: 'text', placeholder: 'Ej: Bodega Terminal 1 — VVI' },
    { name: 'foundDate',     label: '* Fecha y hora de hallazgo', type: 'datetime-local' },
    {
      name: 'condition',
      label: '* Condición del equipaje',
      type: 'select',
      options: ['Buena', 'Regular', 'Dañada'],
    },
    { name: 'referenceWeight', label: 'Peso facturado (kg) — referencia', type: 'number', readonly: true },
    { name: 'foundWeight',     label: 'Peso al hallazgo (kg)',            type: 'number' },
    { name: 'notes',           label: 'Observaciones',                    type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `Equipaje encontrado. ` +
    v('Lugar', data.foundLocation) +
    v('Condición', data.condition) +
    v('Peso hallado', data.foundWeight, 'kg') +
    v('Obs', data.notes),

  newStatus: 'FOUND',
};

// ---------------------------------------------------------------------------

export const DELIVER = {
  id: 'DELIVER',
  title: 'Realizar Entrega',
  // MSA §5.5.4.5 y Formulario "Recibo de Entrega" (§4.3)

  autofill: {
    // Nombre del pasajero — se usa cuando la relación es "El mismo pasajero"
    recipientName:   'passengerFullName',       // campo virtual resuelto en el componente
    // Pesos del PIR
    checkedWeight:   'checkedBaggageWeight',
    // Direcciones registradas en el PIR
    // deliveryAddress se asigna condicionalmente según deliveryLocation (ver autofillIf en el campo)
  },

  fields: [
    { name: 'deliveryDate', label: '* Fecha y hora de entrega', type: 'datetime-local' },
    {
      name: 'deliveryLocation',
      label: '* Lugar de entrega',
      type: 'select',
      options: [
        'Oficina de Equipajes en aeropuerto',
        'Domicilio del pasajero',
        'Hotel / alojamiento temporal',
        'Otra oficina BoA',
      ],
    },
    {
      // Visible solo si deliveryLocation es domicilio u hotel.
      // Se autocompleta: domicilio → permanentAddress, hotel → temporaryAddress
      name: 'deliveryAddress',
      label: '* Dirección de entrega',
      type: 'text',
      showIf: { field: 'deliveryLocation', values: ['Domicilio del pasajero', 'Hotel / alojamiento temporal'] },
      autofillIf: [
        { when: { field: 'deliveryLocation', value: 'Domicilio del pasajero' },    source: 'permanentAddress' },
        { when: { field: 'deliveryLocation', value: 'Hotel / alojamiento temporal' }, source: 'temporaryAddress' },
      ],
    },
    {
      name: 'relationship',
      label: '* Relación con el pasajero',
      type: 'select',
      options: ['El mismo pasajero', 'Familiar', 'Persona autorizada'],
    },
    {
      // Se autocompleta con nombre completo del pasajero si relationship === 'El mismo pasajero'
      // Editable si es Familiar o Persona autorizada
      name: 'recipientName',
      label: '* Nombre de quien recibe',
      type: 'text',
      autofillIf: [
        { when: { field: 'relationship', value: 'El mismo pasajero' }, source: 'passengerFullName' },
      ],
    },
    { name: 'checkedWeight',   label: 'Peso facturado (kg) — referencia', type: 'number', readonly: true },
    { name: 'deliveredWeight', label: '* Peso entregado (kg)',             type: 'number' },
    { name: 'notes',           label: 'Observaciones',                     type: 'textarea', placeholder: 'Condición del equipaje al entregar...' },
  ],

  getMessage: (data: any) =>
    `Equipaje entregado. ` +
    v('Lugar', data.deliveryLocation) +
    v('Dirección', data.deliveryAddress) +
    v('Receptor', data.recipientName) +
    v('Relación', data.relationship) +
    v('Peso entregado', data.deliveredWeight, 'kg') +
    v('Obs', data.notes),

  newStatus: 'DELIVERED',
};

// ---------------------------------------------------------------------------

export const SEND_TO_REPAIR = {
  id: 'SEND_TO_REPAIR',
  title: 'Enviar a Reparación',
  // MSA §6.5.1.1 — Reparación puede ser gestionada por BoA o por el pasajero.

  fields: [
    {
      name: 'repairModality',
      label: '* Modalidad',
      type: 'select',
      options: [
        'BoA gestiona — maleta en custodia',
        'Pasajero lleva — reembolso contra factura',
      ],
    },
    { name: 'repairShop',        label: 'Taller de reparación',      type: 'text',     placeholder: 'Requerido si BoA gestiona' },
    { name: 'estimatedDate',     label: 'Fecha estimada de retorno', type: 'date' },
    { name: 'damageDescription', label: '* Descripción del daño',    type: 'textarea' },
    { name: 'estimatedCost',     label: 'Costo estimado (USD)',      type: 'number' },
    { name: 'notes',             label: 'Observaciones',             type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `Enviado a reparación. ` +
    v('Modalidad', data.repairModality) +
    v('Taller', data.repairShop) +
    v('Daño', data.damageDescription) +
    v('Costo estimado', data.estimatedCost, ' USD') +
    v('Retorno estimado', data.estimatedDate) +
    v('Obs', data.notes),

  newStatus: 'REPAIRING',
};

// ---------------------------------------------------------------------------

export const PICKUP_REPAIRED = {
  id: 'PICKUP_REPAIRED',
  title: 'Recoger Maleta de Reparación',

  fields: [
    { name: 'pickupDate', label: '* Fecha y hora de recogida',      type: 'datetime-local' },
    { name: 'actualCost', label: '* Costo real de reparación (USD)', type: 'number' },
    {
      name: 'condition',
      label: '* Estado tras reparación',
      type: 'select',
      options: ['Excelente', 'Buena', 'Aceptable'],
    },
    { name: 'notes', label: 'Observaciones', type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `Maleta recogida de reparación. ` +
    v('Costo real', data.actualCost, ' USD') +
    v('Estado', data.condition) +
    v('Obs', data.notes),

  newStatus: 'REPAIRED',
};

// ---------------------------------------------------------------------------

export const TRANSFER_TO_CBB = {
  id: 'TRANSFER_TO_CBB',
  title: 'Centralizar a CBBLZ',
  // MSA §5.7.6.1 — Al día 8. El OHD NO se cierra.

  fields: [
    { name: 'expedientDay',   label: '* Día del expediente (debe ser ≥7)', type: 'number' },
    { name: 'transferDate',   label: '* Fecha y hora de transferencia',    type: 'datetime-local' },
    { name: 'transferReason', label: '* Motivo',                           type: 'textarea',
      placeholder: 'Ej: Propietario no localizado en 7 días. Búsquedas sin resultado.' },
    {
      name: 'localSearchDocumented',
      label: '* ¿Acciones de búsqueda documentadas?',
      type: 'select',
      options: ['Sí', 'No — pendiente'],
    },
    {
      name: 'flzTransactionSent',
      label: '* ¿Transacción FLZ enviada en WT?',
      type: 'select',
      options: ['Sí', 'No — pendiente'],
    },
    { name: 'notes', label: 'Observaciones', type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `Equipaje centralizado a CBBLZ. ` +
    v('Día del expediente', data.expedientDay) +
    v('Motivo', data.transferReason) +
    v('Búsquedas documentadas', data.localSearchDocumented) +
    v('FLZ enviado', data.flzTransactionSent) +
    v('Obs', data.notes),

  newStatus: 'TRANSFERRED',
};

// ---------------------------------------------------------------------------

export const CLOSE_CLAIM = {
  id: 'CLOSE_CLAIM',
  title: 'Cerrar Reclamo',
  // MSA §5.5.4.8

  // Al cerrar se precarga el peso facturado y la estación de fallo del PIR
  autofill: {
    finalWeight: 'checkedBaggageWeight',
    failStation: 'faultStation',
  },

  fields: [
    {
      name: 'closureReason',
      label: '* Motivo de cierre',
      type: 'select',
      options: [
        'Equipaje entregado al pasajero',
        'Indemnización pagada — pérdida total',
        'Indemnización pagada — saqueo',
        'Reparación completada y devuelta',
        'Reposición de maleta realizada',
        'Reclamo rechazado — fuera de política',
        'Reclamo rechazado — extemporáneo',
        'Búsqueda de cortesía — sin indemnización',
      ],
    },
    { name: 'finalWeight', label: 'Peso final del equipaje (kg)', type: 'number' },
    { name: 'totalCost',   label: 'Costo total del caso (USD)',   type: 'number' },
    { name: 'failStation', label: 'Estación de fallo',            type: 'text' },
    {
      name: 'conciliationSigned',
      label: '¿Acuerdo de conciliación firmado?',
      type: 'select',
      options: ['Sí', 'No aplica', 'Pendiente'],
    },
    { name: 'closureNotes', label: '* Resumen final', type: 'textarea' },
  ],

  getMessage: (data: any) =>
    `Reclamo cerrado. ` +
    v('Motivo', data.closureReason) +
    v('Peso final', data.finalWeight, 'kg') +
    v('Costo total', data.totalCost, ' USD') +
    v('Estación de fallo', data.failStation) +
    v('Conciliación firmada', data.conciliationSigned) +
    v('Resumen', data.closureNotes),

  newStatus: 'CLOSED',
};

// ===== EXPORTAR TODAS LAS ACCIONES =====
export const ACTIONS: Record<string, any> = {
  COMPENSATE,
  INDICATE_GPN,
  INDICATE_LOCAL_SEARCH,
  INDICATE_WT_SEARCH,
  INDICATE_FOUND,
  DELIVER,
  SEND_TO_REPAIR,
  PICKUP_REPAIRED,
  TRANSFER_TO_CBB,
  CLOSE_CLAIM,
};