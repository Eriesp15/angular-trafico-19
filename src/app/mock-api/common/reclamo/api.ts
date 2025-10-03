import { Injectable } from '@angular/core';
import { ErpMockApiService } from '@erp/lib/mock-api';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class ReclamoMockApi {
    private _reclamos: any[] = [];

    constructor(private _erpMockApiService: ErpMockApiService) {
        this._createMockData();
        this.registerHandlers();
    }

    private _createMockData(): void {
        // Definimos datos de ejemplo para los reclamos
        this._reclamos = [
            {
                id: 1,
                codigo: 'R-2025-0001',
                tipo: 'DPR',
                estado: 'investigacion',
                subestado: 'pendiente_docs',
                fecha_creacion: '2025-09-18T10:15:00Z',
                fechaLimite: '2025-10-09T23:59:59Z',
                pasajero: {
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    documento: 'CI 1234567',
                    telefono: '63878701',
                    email: 'juan.perez@mail.com',
                    direccion: 'Av. Siempre Viva 123'
                },
                vuelo: {
                    numero: 'OB612',
                    aerolinea: 'BoA',
                    fecha: '2025-09-15',
                    origen: { nombre: 'CBB', codigo: 'CBB' },
                    destino: { nombre: 'VVI', codigo: 'VVI' }
                },
                equipaje: {
                    bagtag: '9301234567',
                    tipo: 'Maleta',
                    marca: 'Samsonite',
                    color: 'Negro',
                    peso: 23,
                    descripcion: 'Maleta mediana dura',
                    problema: 'Maleta dañada'
                },
                documentos: [{ id: 'd1', nombre: 'PIR.pdf', tipo: 'PIR', fecha: '2025-09-15' }],
                costos: { reparacion: 150, transporte: 40, compensacion: 0, total: 190, moneda: 'BOB' },
                historial: [
                    { id: 'h1', fecha: '2025-09-15T14:15:00Z', agente: 'María Santos', tipo: 'nota', descripcion: 'Se indica que debe traer maleta dañada.' },
                    { id: 'h2', fecha: '2025-09-16T15:26:00Z', agente: 'María Santos', tipo: 'nota', descripcion: 'Ingreso de formulario de contenido de equipaje.' }
                ],
                seguimiento: [
                    { id: 's1', fecha: '2025-09-15', hora: '14:15', encargado: 'Velasco', info: 'Se indica traer maleta dañada.' },
                    { id: 's2', fecha: '2025-09-16', hora: '15:26', encargado: 'Montaño', info: 'Formulario de contenido ingresado.' }
                ]
            }
        ];
    }

    // Registrar los handlers para las rutas de la API mock
    registerHandlers(): void {
        // GET todos los reclamos
        this._erpMockApiService.onGet('api/reclamos').reply(() => {
            return [200, cloneDeep(this._reclamos)];
        });

        // GET reclamo por id
        this._erpMockApiService.onGet('api/reclamos/:id').reply(({ request }) => {
            const url = request.url;
            const parts = url.split('/');
            const id = Number(parts[parts.length - 1]);
            const reclamo = this._reclamos.find((x) => x.id === id);
            return reclamo ? [200, cloneDeep(reclamo)] : [404, { message: 'Reclamo no encontrado' }];
        });

        // POST agregar seguimiento (simula insertar)
        this._erpMockApiService.onPost('api/reclamos/seguimiento').reply(({ request }) => {
            const body = request.body;
            const reclamo = this._reclamos.find((r) => r.id === body.reclamoId);
            if (!reclamo) return [404, { message: 'Reclamo no encontrado' }];
            const nuevo = {
                id: 's' + (reclamo.seguimiento.length + 1),
                fecha: body.fecha,
                hora: body.hora,
                encargado: body.encargado,
                info: body.info
            };
            reclamo.seguimiento.push(nuevo);
            return [200, cloneDeep(nuevo)];
        });
    }
}
