import { Injectable } from '@angular/core';
import { ErpMockApiService } from '@erp/lib/mock-api';
import { cloneDeep } from 'lodash-es';

// Simula datos de ejemplo para los reclamos inyectable es una funcion puede devolver cualquier cosa para que sea visible en cualquier parte del proyecto
@Injectable({ providedIn: 'root' })
export class ReclamoMockApi {
    private _reclamos: any[] = []; // Simulamos una lista de reclamos

    constructor(private _erpMockApiService: ErpMockApiService) {
        this._createMockData();  // Llenamos los datos de ejemplo
        this.registerHandlers();  // Registramos los handlers para las rutas mock
    }


    private _createMockData(): void {

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

    // Registramos los handlers para las rutas de la API
    registerHandlers(): void {

        this._erpMockApiService.onGet('api/reclamo/:id').reply(({ request }) => {
            const url = request.url;
            const parts = url.split('/');  // Divide la URL
            const id = Number(parts[parts.length - 1]);  // Obtiene el ID
            const reclamo = this._reclamos.find((x) => x.id === id);
            return reclamo ? [200, cloneDeep(reclamo)] : [404, { message: 'Reclamo no encontrado' }];
        });




    }
}
