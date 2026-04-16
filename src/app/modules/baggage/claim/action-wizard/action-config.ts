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
    `Se inició búsqueda local en ${data.searchArea}. ${data.notes || ''}`,

  newStatus: 'SEARCHING'
};

export const INDICATE_WT_SEARCH = {
  id: 'INDICATE_WT_SEARCH',
  title: 'Indicar Búsqueda World Tracer',

  fields: [
    { name: 'wtReference', label: 'Referencia World Tracer', type: 'text', placeholder: 'Ej: WT123456' },
    { name: 'searchDate', label: 'Fecha de registro', type: 'datetime-local' },
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
    { name: 'foundDate', label: 'Fecha de hallazgo', type: 'datetime-local' },
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
    { name: 'deliveryDate', label: 'Fecha de entrega', type: 'datetime-local' },
    { name: 'recipientName', label: 'Nombre de quien recibe', type: 'text' },
    { name: 'relationship', label: 'Relación con el pasajero', type: 'select',
      options: ['El mismo pasajero', 'Familiar', 'Persona autorizada'] },
    { name: 'notes', label: 'Observaciones', type: 'textarea', placeholder: 'Condición del equipaje, notas...' }
  ],

  getMessage: (data: any) =>
    `Equipaje entregado a ${data.recipientName} (${data.recipientId}). ${data.notes || ''}`,

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



// ===== PROBANDO  DERIVACIONES MELVI =====

export const TRANSFER_BAG = {
    id: 'TRANSFER_BAG',
    title: 'Derivar equipaje',

    autofill: {
        originStation: 'currentOffice',
        registeredBy: 'loggedUserName',
        flightDate: 'todayFlightDate'
    },

    fields: [
        {
            name: 'originStation',
            label: 'Estación origen',
            type: 'select',
            required: true,
            options: [
                'CBB - Cochabamba',
                'VVI - Santa Cruz',
                'LPB - La Paz',
                'SRE - Sucre',
                'TJA - Tarija',
                'POI - Potosí',
                'ORU - Oruro',
                'TDD - Trinidad',
                'CIJ - Cobija'
            ]
        },
        {
            name: 'destinationStation',
            label: 'Estación destino',
            type: 'select',
            required: true,
            options: [
                'CBB - Cochabamba',
                'VVI - Santa Cruz',
                'LPB - La Paz',
                'SRE - Sucre',
                'TJA - Tarija',
                'POI - Potosí',
                'ORU - Oruro',
                'TDD - Trinidad',
                'CIJ - Cobija'
            ]
        },
        {
            name: 'reason',
            label: 'Motivo',
            type: 'datalist',
            required: true,
            options: [
                'Reparación',
                'Continuación de trámite',
                'Entrega en otra estación',
                'Reenvío operativo',
                'Otro'
            ],
            placeholder: 'Seleccione o escriba un motivo'
        },

        {
            name: 'bagTag',
            label: 'BagTag',
            type: 'text',
            required: true,
            placeholder: 'Ej: OB123456'
        },
        {
            name: 'flightNumber',
            label: 'Número de vuelo',
            type: 'text',
            required: true,
            placeholder: 'Ej: OB660'
        },
        {
            name: 'flightDate',
            label: 'Fecha de vuelo',
            type: 'datetime-local',
            required: true

        },
        {
            name: 'registeredBy',
            label: 'Usuario que registra',
            type: 'text',
            readonly: true,
            required: true,

        },
        {
            name: 'notes',
            label: 'Observaciones',
            type: 'textarea',
            placeholder: 'Detalle adicional...'
        }
    ],

    getMessage: (data: any) =>
        `Se derivó equipaje desde ${data.originStation} hacia ${data.destinationStation}. Motivo: ${data.reason}. BagTag: ${data.bagTag}. Vuelo: ${data.flightNumber}. Fecha de vuelo: ${data.flightDate}. Registrado por: ${data.registeredBy}. ${data.notes || ''}`,

    newStatus: 'IN_PROCESS'
};

// ===== PROBANDO REPARACIÓN melvi=====

export const ASSIGN_REPAIR_COMPANY = {
    id: 'ASSIGN_REPAIR_COMPANY',
    title: 'Asignar a empresa reparadora',

    fields: [
        { name: 'repairCompany', label: 'Empresa reparadora', type: 'text', placeholder: 'Nombre de la empresa' },
        { name: 'assignmentDate', label: 'Fecha de asignación', type: 'datetime-local' },
        { name: 'sendWhatsapp', label: 'Notificar por WhatsApp', type: 'select',
            options: ['Sí', 'No'] },
        { name: 'notes', label: 'Observaciones', type: 'textarea' }
    ],

    getMessage: (data: any) =>
        `Se asignó el equipaje a la empresa reparadora ${data.repairCompany}. Notificación por WhatsApp: ${data.sendWhatsapp}. ${data.notes || ''}`,

    newStatus: 'IN_PROCESS'
};

export const DELIVER_TO_REPAIR_COMPANY = {
    id: 'DELIVER_TO_REPAIR_COMPANY',
    title: 'Entregar a reparadora',

    fields: [
        { name: 'deliveryDate', label: 'Fecha de entrega', type: 'datetime-local' },
        { name: 'deliveredTo', label: 'Nombre de quien recoge', type: 'text', placeholder: 'Representante de la reparadora' },
        { name: 'estimatedReturnDate', label: 'Fecha estimada de devolución', type: 'date' },
        { name: 'damageDescription', label: 'Descripción del daño', type: 'textarea' },
        { name: 'notes', label: 'Observaciones', type: 'textarea' }
    ],

    getMessage: (data: any) =>
        `Se entregó el equipaje a la reparadora el ${data.deliveryDate}. Recibió: ${data.deliveredTo}. Fecha estimada de devolución: ${data.estimatedReturnDate}. ${data.notes || ''}`,

    newStatus: 'REPAIRING'
};

export const RECEIVE_FROM_REPAIR_COMPANY = {
    id: 'RECEIVE_FROM_REPAIR_COMPANY',
    title: 'Recibir desde reparadora',

    fields: [
        { name: 'receivedDate', label: 'Fecha de recepción', type: 'datetime-local' },
        { name: 'repairResult', label: 'Resultado', type: 'select',
            options: ['REPAIRED', 'IRREPARABLE'] },
        { name: 'reportNumber', label: 'Número de informe', type: 'text', placeholder: 'Opcional' },
        { name: 'notes', label: 'Observaciones', type: 'textarea' }
    ],

    getMessage: (data: any) =>
        `Se recibió el equipaje desde la reparadora el ${data.receivedDate}. Resultado: ${data.repairResult}. Informe: ${data.reportNumber || 'Sin número'}. ${data.notes || ''}`,

    newStatus: 'REPAIRED'
};
export const MARK_AS_REPAIRED = {
    id: 'MARK_AS_REPAIRED',
    title: 'Marcar como reparado',
    fields: [
        { name: 'repairDate', label: 'Fecha', type: 'datetime-local' },
        { name: 'notes', label: 'Observaciones', type: 'textarea' }
    ],
    getMessage: (data: any) =>
        `Se confirmó la reparación del equipaje con fecha ${data.repairDate}. ${data.notes || ''}`,
    newStatus: 'REPAIRED'
};
export const MARK_IRREPARABLE = {
    id: 'MARK_IRREPARABLE',
    title: 'Marcar como irreparable',

    fields: [
        { name: 'reportDate', label: 'Fecha del informe', type: 'datetime-local' },
        { name: 'reason', label: 'Motivo', type: 'textarea', placeholder: 'Detalle del daño irreversible' }
    ],

    getMessage: (data: any) =>
        `La empresa reparadora emitió informe de irreparabilidad con fecha ${data.reportDate}. Motivo: ${data.reason}. Se procede con compra del equipaje.`,

    newStatus: 'PURCHASED'
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
  CLOSE_CLAIM,

    TRANSFER_BAG,
    ASSIGN_REPAIR_COMPANY,
    DELIVER_TO_REPAIR_COMPANY,
    RECEIVE_FROM_REPAIR_COMPANY,
    MARK_IRREPARABLE
};
