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
    { name: 'pricePerKg', label: 'Precio por kg (Bs.)', type: 'number', placeholder: 'Ej: 104.4', required: true },
    { name: 'total', label: 'Total a pagar (Bs.)', type: 'number', readonly: true }
  ],

  getMessage: (data: any) =>
    `Se procedió con la indemnización por ${data.weightDifference}kg de equipaje perdido. Total pagado: Bs. ${data.total}`,

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

  autofill: {
    worldTracerCode: 'worldTracerCode'
  },

  fields: [
    { name: 'worldTracerCode', label: 'Código World Tracer', type: 'text', placeholder: 'Ej: WT123456', required: true},
    { name: 'searchDate', label: 'Fecha de registro', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16), required:true},
    { name: 'notes', label: 'Observaciones', type: 'textarea' }
  ],

  getMessage: (data: any) =>
    `Se registró en World Tracer en fecha: ${data.searchDate}. ${data.notes || ''}`,

  newStatus: 'SEARCHING'
};

export const INDICATE_FOUND = {
  id: 'INDICATE_FOUND',
  title: 'Indicar Equipaje Encontrado',

  fields: [
    { name: 'foundLocation', label: 'Lugar donde se encontró', type: 'text', placeholder: 'Ej: Bodega Aeropuerto CBBA' },
    { name: 'foundDate', label: 'Fecha de hallazgo', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16), required: true},
    { name: 'condition', label: 'Condición del equipaje', type: 'select', required:true,
      options: ['Buena', 'Regular', 'Dañada'] },
    { name: 'notes', label: 'Observaciones', type: 'textarea' }
  ],

  getMessage: (data: any) =>
    `Equipaje encontrado en ${data.foundLocation || ''} Fecha: ${data.foundDate}. Condición: ${data.condition}. ${data.notes || ''}`,

  newStatus: 'FOUND'
};

export const INDICATE_RECEIVED = {
  id: 'INDICATE_RECEIVED',
  title: 'Indicar Equipaje Recibido',

  fields: [
    { name: 'receivedLocation', label: 'Lugar de destino', type: 'text', placeholder: 'Ej: Oficina de equipajes CBB', required: true },
    { name: 'receivedDate', label: 'Fecha de recepción', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16), required: true },
    { name: 'receivedBy', label: 'Recibido por', type: 'text', placeholder: 'Nombre del responsable', required: true },
    { name: 'notes', label: 'Observaciones', type: 'textarea' }
  ],

  getMessage: (data: any) =>
    `Equipaje recibido en ${data.receivedLocation}. Fecha: ${data.receivedDate}. Responsable: ${data.receivedBy}. ${data.notes || ''}`,

  newStatus: 'RECEIVED'
};

export const ASSIGN_TRANSPORT = {
  id: 'ASSIGN_TRANSPORT',
  title: 'Asignar Empresa de Transporte',

  fields: [
    { name: 'transportCompanyId', label: 'Empresa de transporte', type: 'select', required: true, optionsFrom: 'transportCompanies' },
    { name: 'assignedDate', label: 'Fecha de asignación', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16), required: true },
    { name: 'responsiblePerson', label: 'Responsable', type: 'select', required: true, optionsFrom: 'transportCompanyUsers' },
    { name: 'notes', label: 'Observaciones', type: 'textarea' }
  ],

  getMessage: (data: any) =>
    `Equipaje asignado a la empresa de transporte ${data.transportCompanyName || 'seleccionada'}. Responsable: ${data.responsiblePerson}. Fecha: ${data.assignedDate}. ${data.notes || ''}`,

  newStatus: 'ASSIGNED'
};

export const AIRPORT_PICKUP = {
  id: 'AIRPORT_PICKUP',
  title: 'Recojo en Aeropuerto',

  fields: [
    { name: 'pickupDate', label: 'Fecha de recojo', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16), required: true},
    { name: 'pickedUpBy', label: 'Recogido por', type: 'text', required: true, placeholder: 'Nombre del pasajero o responsable'},
    { name: 'notes', label: 'Observaciones', type: 'textarea', placeholder: 'Condición del equipaje, notas...' }
  ],

  getMessage: (data: any) =>
    `Equipaje recogido en aeropuerto el ${data.pickupDate}. Recogido por: ${data.pickedUpBy}. ${data.notes || ''}`,

  newStatus: 'CLOSED'
};

export const DELIVER = {
  id: 'DELIVER',
  title: 'Realizar Entrega',

  autofill: {
    recipientName: 'passengerName',
    deliveryAddress: 'permanentAddress'
  },

  fields: [
    { name: 'deliveryDate', label: 'Fecha de entrega', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16), required: true},
    { name: 'deliveryAddressType', label: 'Dirección de entrega', type: 'select', required: true,
      defaultValue: 'PERMANENT',
      options: [
        { value: 'PERMANENT', label: 'Dirección permanente' },
        { value: 'TEMPORARY', label: 'Dirección temporal' },
        { value: 'OTHER', label: 'Otros' }
      ] },
    { name: 'deliveryAddress', label: 'Dirección a la cual dejar', type: 'textarea', required: true, placeholder: 'Ingrese la dirección de entrega' },
    { name: 'recipientName', label: 'Nombre de quien recibe', type: 'text', required: true},

    { name: 'notes', label: 'Observaciones', type: 'textarea', placeholder: 'Condición del equipaje, notas...' }
  ],

  getMessage: (data: any) =>
    `Equipaje entregado por ${data.deliveryCompanyName || 'empresa de transporte'} en ${data.deliveryAddress}. Recibe ${data.recipientName}, siendo ${data.relationship}. ${data.notes || ''}`,

  newStatus: 'DELIVERED'
};

export const SEND_TO_REPAIR = {
  id: 'SEND_TO_REPAIR',
  title: 'Enviar a Reparación',

  fields: [
    { name: 'repairShop', label: 'Taller de reparación', type: 'text', placeholder: 'Nombre del taller' },
    { name: 'estimatedDate', label: 'Fecha estimada de retorno', type: 'date', defaultValue: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000) - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10)},
    { name: 'damageDescription', label: 'Descripción del daño', type: 'textarea', required: true},
    { name: 'estimatedCost', label: 'Costo estimado ($)', type: 'number' }
  ],

  getMessage: (data: any) =>
    `Enviado a reparación en ${data.repairShop}. Retorno estimado: ${data.estimatedDate}.`,

  newStatus: 'REPAIRING'
};

export const PICKUP_REPAIRED = {
  id: 'PICKUP_REPAIRED',
  title: 'Recibido de Reparación',

  fields: [
    { name: 'pickupDate', label: 'Fecha de recepción de reparación', type: 'datetime-local', defaultValue: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16), required:true},
    { name: 'pickupDay', label: 'Día de recepción', type: 'text', readonly: true },
    { name: 'receivedBy', label: 'Recibido por', type: 'text', placeholder: 'Nombre del responsable', required: true },
    { name: 'notes', label: 'Observaciones', type: 'textarea' }
  ],

  getMessage: (data: any) =>
    `Equipaje recibido de reparación el ${data.pickupDate}. Día: ${data.pickupDay}. Recibido por: ${data.receivedBy}. ${data.notes || ''}`,

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

// ===== CIERRE DE RECLAMO
export const CLOSE_CLAIM = {
    id: 'CLOSE_CLAIM',
    title: 'Cerrar reclamo',

    autofill: {
        registeredBy: 'loggedUserName',
        closedAt: 'todayFlightDate',
        sendPassengerMessage: 'sendPassengerMessageDefault'
    },

    fields: [
        {
            name: 'registeredBy',
            label: 'Usuario que cierra',
            type: 'text',
            readonly: true,
            required: true
        },
        {
            name: 'closedAt',
            label: 'Fecha y hora de cierre',
            type: 'datetime-local',
            readonly: true,
            required: true
        },
        {
            name: 'closureReason',
            label: 'Motivo de cierre',
            type: 'datalist',
            required: true,
            options: [
                'Reclamo resuelto satisfactoriamente',
                'Indemnización pagada',
                'Pasajero conforme con la solución',
                'Equipaje entregado al pasajero',
                'Cierre administrativo',
                'Otro'
            ],
            placeholder: 'Seleccione o escriba un motivo'
        },
        {
            name: 'sendPassengerMessage',
            label: 'Enviar mensaje al pasajero',
            type: 'select',
            required: true,
            options: ['Sí', 'No']
        },
        {
            name: 'notes',
            label: 'Observaciones',
            type: 'textarea',
            placeholder: 'Detalle adicional del cierre...'
        }
    ],

    getMessage: (data: any) =>
        `Reclamo cerrado por ${data.registeredBy}. Fecha: ${data.closedAt}. Motivo: ${data.closureReason}. Mensaje al pasajero: ${data.sendPassengerMessage}. ${data.notes || ''}`,

    newStatus: 'CLOSED'
};



// ===== PROBANDO  envios a otra estacion MELVI =====

export const TRANSFER_BAG = {
    id: 'TRANSFER_BAG',
    title: 'Enviar equipaje',

    autofill: {
        originStation: 'currentOffice',
        registeredBy: 'loggedUserName',
        flightDate: 'todayFlightDate'
    },

    fields: [
        {
            name: 'registeredBy',
            label: 'Usuario que envia',
            type: 'text',
            readonly: true,
            required: true,

        },
        {
            name: 'originStation',
            label: 'Estación donde se encuentra actualmente la maleta',
            type: 'text',
            readonly: true,
            required: true
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
            name: 'notes',
            label: 'Observaciones',
            type: 'textarea',
            placeholder: 'Detalle adicional...'
        }
    ],

    getMessage: (data: any) =>
        `Se envio equipaje desde ${data.originStation} hacia ${data.destinationStation}. Motivo: ${data.reason}. BagTag: ${data.bagTag}. Vuelo: ${data.flightNumber}. Fecha de vuelo: ${data.flightDate}. ${data.notes || ''}`,
    //talvez deberia haber otro estado como enviado? o que se quede en reparacion ?
    //newStatus: 'REPAIRING'
};

// ===== PROBANDO REPARACIÓN melvi=====

export const ASSIGN_REPAIR_COMPANY = {
    id: 'ASSIGN_REPAIR_COMPANY',
    title: 'Asignar a empresa reparadora',

    autofill: {
        registeredBy: 'loggedUserName',
        assignmentDate: 'todayFlightDate',
        sendWhatsapp: 'sendWhatsappDefault'
    },

    fields: [
        {
            name: 'registeredBy',
            label: 'Usuario que asigna',
            type: 'text',
            readonly: true,
            required: true
        },
        {
            name: 'assignmentDate',
            label: 'Fecha de asignación',
            type: 'datetime-local',
            readonly: true,
            required: true
        },
        {
            name: 'repairCompanyId',
            label: 'Empresa reparadora',
            type: 'select',
            required: true,
            optionsFrom: 'repairCompanies'
        },
        {
            name: 'sendWhatsapp',
            label: 'Notificar por WhatsApp',
            type: 'select',
            required: true,
            options: ['Sí', 'No']
        },
        {
            name: 'notes',
            label: 'Observaciones',
            type: 'textarea'
        }
    ],

    getMessage: (data: any) =>
        `Se asignó el equipaje a la empresa reparadora ${data.repairCompanyName || 'seleccionada'}. Fecha: ${data.assignmentDate}. Notificación por WhatsApp: ${data.sendWhatsapp}. ${data.notes || ''}`,
    newStatus: 'REPAIRING'
};

export const DELIVER_TO_REPAIR_COMPANY = {
    id: 'DELIVER_TO_REPAIR_COMPANY',
    title: 'Entregar a reparadora',

    autofill: {
        registeredBy: 'loggedUserName',
        deliveryDate: 'todayFlightDate',
        estimatedReturnDate: 'estimatedReturnDateDefault'
    },

    fields: [
        { name: 'registeredBy', label: 'Usuario que entrega', type: 'text', readonly: true, required: true },
        { name: 'deliveryDate', label: 'Fecha de entrega', type: 'datetime-local', required: true },
        { name: 'estimatedReturnDate', label: 'Fecha estimada de devolución', type: 'date', required: true },
        { name: 'notes', label: 'Observaciones', type: 'textarea' }
    ],

    getMessage: (data: any) =>
        `Se entregó el equipaje a la reparadora el ${data.deliveryDate}. Fecha estimada de devolución: ${data.estimatedReturnDate}. ${data.notes || ''}`,

    newStatus: 'REPAIRING'
};

export const RECEIVE_FROM_REPAIR_COMPANY = {
    id: 'RECEIVE_FROM_REPAIR_COMPANY',
    title: 'Recibir desde reparadora',

    autofill: {
        registeredBy: 'loggedUserName',
        receivedDate: 'todayFlightDate'
    },

    fields: [
        { name: 'registeredBy', label: 'Usuario que recibe', type: 'text', readonly: true, required: true },
        { name: 'receivedDate', label: 'Fecha de recepción', type: 'datetime-local', required: true },
        {
            name: 'repairResult',
            label: 'Resultado',
            type: 'select',
            required: true,
            options: ['REPAIRED', 'IRREPARABLE']
        },
        { name: 'notes', label: 'Observaciones', type: 'textarea' }
    ],

    getMessage: (data: any) =>
        `Se recibió el equipaje desde la reparadora el ${data.receivedDate}. Resultado: ${data.repairResult}. ${data.notes || ''}`,

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
export const CHANGE_CLAIM_TYPE = {
  id: 'CHANGE_CLAIM_TYPE',
  title: 'Cambiar Tipo de Reclamo',

  fields: [
    {
      name: 'newClaimType',
      label: 'Nuevo tipo de reclamo',
      type: 'select',
      required: true,
      options: ['AHL', 'DPR', 'PILFERED']
    }
  ],

  getMessage: (data: any) =>
    `Se cambió el tipo de reclamo a ${data.newClaimType}. El estado se reinició a Pendiente.`,

  newStatus: 'PENDING'
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
    newStatus: 'PURCHASE'
};
// ===== EXPORTAR TODAS LAS ACCIONES =====
export const ACTIONS: Record<string, any> = {
  COMPENSATE,
  INDICATE_LOCAL_SEARCH,
  INDICATE_WT_SEARCH,
  INDICATE_FOUND,
  INDICATE_RECEIVED,
  ASSIGN_TRANSPORT,
  DELIVER,
  AIRPORT_PICKUP,
  SEND_TO_REPAIR,
  PICKUP_REPAIRED,
  TRANSFER_TO_CBB,
  CLOSE_CLAIM,

    TRANSFER_BAG,
    ASSIGN_REPAIR_COMPANY,
    DELIVER_TO_REPAIR_COMPANY,
    RECEIVE_FROM_REPAIR_COMPANY,
    CHANGE_CLAIM_TYPE,
    MARK_IRREPARABLE
};

