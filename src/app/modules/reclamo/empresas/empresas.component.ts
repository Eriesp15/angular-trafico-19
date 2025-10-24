import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Tipo, Empresa } from './modelos/empresas.model';
import { CardEmpresaComponent } from './ui/card-empresa/card-empresa.component';

@Component({
    selector: 'app-empresas',
    standalone: true,
    imports: [CommonModule, CardEmpresaComponent],
    templateUrl: './empresas.component.html',
    styleUrls: ['./empresas.component.scss'],
})
export class EmpresasComponent {

    constructor(private router: Router) {}

    // --- Datos locales (mock) ---
    tipos: Tipo[] = [
        { id: 't1', nombre: 'Transporte', activo: true },
        { id: 't2', nombre: 'Reparación', activo: true },
    ];

    empresas: Empresa[] = [
        { id: 'e1', tipoId: 't1', nombre: 'TransBolivia', telefono: '70123456', email: 'info@transbolivia.com', razonSocial: 'Transportadora Bolivia', direccion: 'Av. los Angeles N 965', activo: true },
        { id: 'e2', tipoId: 't1', nombre: 'TransCochabamba', telefono: '63878787', email: 'info@transcochabamba.com', razonSocial: 'Transportadora Cochabamba', direccion: 'Av. Blanco Galindo N 965', activo: false },
        { id: 'e3', tipoId: 't2', nombre: 'ReparaYa', telefono: '65875552', email: 'info@reparaya.com', razonSocial: 'Reparación', direccion: 'Calle Camaro N 657', activo: true },
    ];

    // --- Helpers de vista ---
    empresasPorTipo(tipoId: string): Empresa[] {
        return this.empresas.filter(e => e.tipoId === tipoId);
    }

    verLista(e: Empresa) {
        this.router.navigate(['/reclamo/empresas', e.id, 'asignaciones']);
    }

    // Acciones de botones superiores (ahora solo demo)
    agregarTipo() {
        alert('Abrir modal: Agregar Tipo de Empresa');
    }
    agregarEmpresa(tipoId: string) {
        alert(`Abrir modal: Nueva empresa para tipo ${tipoId}`);
    }

    // Cambiar estado (confirmado) desde la card
    confirmarToggle(empresa: Empresa) {
        const nuevo = !empresa.activo;
        empresa.activo = nuevo;
        // aquí luego llamas a tu API si lo necesitas
    }
}
