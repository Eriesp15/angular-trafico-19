// ===== CONFIGURACIÓN DE ACCIONES =====

export const COMPENSATE = {
  id: 'COMPENSATE',
  title: 'Indemnizar Equipaje',
  
  autofill: {
    checkedWeight: 'checkedBaggageWeight',
    deliveredWeight: 'deliveredBaggageWeight',
    weightDifference: 'weightDifference'
  },
  
  calculate: (formData: any) => {
    formData.total = (formData.weightDifference || 0) * (formData.pricePerKg || 0);
    return formData;
  },
  
  fields: [
    { name: 'checkedWeight', label: 'Peso facturado (kg)', type: 'number', readonly: true },
    { name: 'deliveredWeight', label: 'Peso entregado (kg)', type: 'number', readonly: true },
    { name: 'weightDifference', label: 'Diferencia (kg)', type: 'number', readonly: true },
    { name: 'pricePerKg', label: 'Precio por kg ($)', type: 'number', placeholder: 'Ej: 50' },
    { name: 'total', label: 'Total a pagar ($)', type: 'number', readonly: true }
  ],
  
  getMessage: (data: any) => 
    `Se procedió con la indemnización por ${data.weightDifference}kg de equipaje perdido. Total pagado: $${data.total}`,
  
  newStatus: 'COMPENSATED'
};

export const INDICATE_LOCAL_SEARCH = {
  id: 'INDICATE_LOCAL_SEARCH',
  title: 'Indicar Búsqueda Local',
  
  fields: [
    { name: 'notes', label: 'Observaciones', type: 'textarea', placeholder: 'Detalles adicionales...' }
  ],
  
  getMessage: (data: any) => 
    `Se inició la búsqueda local. ${data.notes || ''}`,
  
  newStatus: 'SEARCHING'
};

export const INDICATE_WT_SEARCH = {
  id: 'INDICATE_WT_SEARCH',
  title: 'Indicar Búsqueda World Tracer',
  
  fields: [
    { name: 'wtReference', label: 'Referencia World Tracer', type: 'text', placeholder: 'Ej: WT123456' },
    { name: 'searchDate', label: 'Fecha de registro', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)},
    { name: 'notes', label: 'Observaciones', type: 'textarea' }
  ],
  
  getMessage: (data: any) => 
    `Se registró en World Tracer con referencia: ${data.wtReference}. ${data.notes || ''}`,
  
  newStatus: 'SEARCHING'
};

export const INDICATE_FOUND = {
  id: 'INDICATE_FOUND',
  title: 'Indicar Equipaje Encontrado',
  
  fields: [
    { name: 'foundLocation', label: 'Lugar donde se encontró', type: 'text', placeholder: 'Ej: Bodega Terminal 1' },
    { name: 'foundDate', label: 'Fecha de hallazgo', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)},
    { name: 'condition', label: 'Condición del equipaje', type: 'select',
      options: ['Buena', 'Regular', 'Dañada'] },
    { name: 'notes', label: 'Observaciones', type: 'textarea' }
  ],
  
  getMessage: (data: any) => 
    `Equipaje encontrado en ${data.foundLocation}. Condición: ${data.condition}. ${data.notes || ''}`,
  
  newStatus: 'FOUND'
};

export const DELIVER = {
  id: 'DELIVER',
  title: 'Realizar Entrega',
  
  autofill: {
    recipientName: 'passengerName'
  },
  
  fields: [
    { name: 'deliveryDate', label: 'Fecha de entrega', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)},
    { name: 'recipientName', label: 'Nombre de quien recibe', type: 'text' },
    { name: 'relationship', label: 'Relación con el pasajero', type: 'select',
      options: ['El mismo pasajero', 'Familiar', 'Persona autorizada'] },
    { name: 'notes', label: 'Observaciones', type: 'textarea', placeholder: 'Condición del equipaje, notas...' }
  ],
  
  getMessage: (data: any) => 
    `Equipaje entregado a ${data.recipientName}, siendo ${data.relationship}. ${data.notes || ''}`,
  
  newStatus: 'DELIVERED'
};

export const SEND_TO_REPAIR = {
  id: 'SEND_TO_REPAIR',
  title: 'Enviar a Reparación',
  
  fields: [
    { name: 'repairShop', label: 'Taller de reparación', type: 'text', placeholder: 'Nombre del taller' },
    { name: 'estimatedDate', label: 'Fecha estimada de retorno', type: 'date' },
    { name: 'damageDescription', label: 'Descripción del daño', type: 'textarea' },
    { name: 'estimatedCost', label: 'Costo estimado ($)', type: 'number' }
  ],
  
  getMessage: (data: any) => 
    `Enviado a reparación en ${data.repairShop}. Retorno estimado: ${data.estimatedDate}. Costo estimado: $${data.estimatedCost}.`,
  
  newStatus: 'REPAIRING'
};

export const PICKUP_REPAIRED = {
  id: 'PICKUP_REPAIRED',
  title: 'Recoger Maleta de Reparación',
  
  fields: [
    { name: 'pickupDate', label: 'Fecha de recogida', type: 'datetime-local' },
    { name: 'actualCost', label: 'Costo real ($)', type: 'number' },
    { name: 'condition', label: 'Estado después de reparación', type: 'select',
      options: ['Excelente', 'Buena', 'Aceptable'] },
    { name: 'notes', label: 'Notas de reparación', type: 'textarea' }
  ],
  
  getMessage: (data: any) => 
    `Recogido de reparación. Costo: $${data.actualCost}. Estado: ${data.condition}. ${data.notes || ''}`,
  
  newStatus: 'REPAIRED'
};

export const TRANSFER_TO_CBB = {
  id: 'TRANSFER_TO_CBB',
  title: 'Transferir a Cochabamba',
  
  fields: [
    { name: 'transferReason', label: 'Motivo de transferencia', type: 'textarea' },
    { name: 'transferDate', label: 'Fecha de transferencia', type: 'datetime-local' },
    { name: 'responsiblePerson', label: 'Responsable en Cochabamba', type: 'text' }
  ],
  
  getMessage: (data: any) => 
    `Transferido a Cochabamba. Motivo: ${data.transferReason}. Responsable: ${data.responsiblePerson}.`,
  
  newStatus: 'TRANSFERRED'
};

export const CLOSE_CLAIM = {
  id: 'CLOSE_CLAIM',
  title: 'Cerrar Reclamo',
  
  fields: [
    { name: 'closureReason', label: 'Motivo de cierre', type: 'select',
      options: ['Resuelto satisfactoriamente', 'Indemnizado', 'Equipaje entregado', 'Otro'] },
    { name: 'closureNotes', label: 'Notas de cierre', type: 'textarea', 
      placeholder: 'Resumen final del caso...' }
  ],
  
  getMessage: (data: any) => 
    `Reclamo cerrado. Motivo: ${data.closureReason}. ${data.closureNotes}`,
  
  newStatus: 'CLOSED'
};

// ===== EXPORTAR TODAS LAS ACCIONES =====
export const ACTIONS: Record<string, any> = {
  COMPENSATE,
  INDICATE_LOCAL_SEARCH,
  INDICATE_WT_SEARCH,
  INDICATE_FOUND,
  DELIVER,
  SEND_TO_REPAIR,
  PICKUP_REPAIRED,
  TRANSFER_TO_CBB,
  CLOSE_CLAIM
};