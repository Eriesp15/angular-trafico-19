export const COMPENSATE = {
  id: 'COMPENSATE',
  title: 'Indemnizar Equipaje',
  
  // Mapeo simple: campo del formulario → campo del PIR
  autofill: {
    checkedWeight: 'checkedBaggageWeight',
    deliveredWeight: 'deliveredBaggageWeight'
  },
  
  fields: [
    { name: 'checkedWeight', label: 'Peso facturado (kg)', type: 'number', readonly: true },
    { name: 'deliveredWeight', label: 'Peso entregado (kg)', type: 'number', readonly: true },
    { name: 'pricePerKg', label: 'Precio por kg', type: 'number' },
    { name: 'paymentMethod', label: 'Método de pago', type: 'select', 
      options: ['Efectivo', 'Transferencia', 'Cheque'] }
  ],
  
  getMessage: (data) => 
    `Indemnizado por ${data.checkedWeight - data.deliveredWeight}kg. Total: $${(data.checkedWeight - data.deliveredWeight) * data.pricePerKg}`,
  
  newStatus: 'COMPENSATED'
};

export const DELIVER = {
  id: 'DELIVER',
  title: 'Realizar Entrega',
  
  // Auto-llenar nombre del pasajero
  autofill: {
    recipientName: 'passengerName'
  },
  
  fields: [
    { name: 'recipientName', label: 'Quien recibe', type: 'text' },
    { name: 'recipientId', label: 'CI/Pasaporte', type: 'text' },
    { name: 'notes', label: 'Observaciones', type: 'textarea' }
  ],
  
  getMessage: (data) => `Entregado a ${data.recipientName} (${data.recipientId})`,
  
  newStatus: 'DELIVERED'
};

export const ACTIONS: Record<string, any> = {
  COMPENSATE,
  DELIVER,
};