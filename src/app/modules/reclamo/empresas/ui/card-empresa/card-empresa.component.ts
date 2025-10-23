import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Empresa } from '../../modelos/empresas.model';

@Component({
    selector: 'app-card-empresa',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card-empresa.component.html',
    styleUrls: ['./card-empresa.component.scss'],
})
export class CardEmpresaComponent {
    @Input({ required: true }) empresa!: Empresa;
    @Output() verLista = new EventEmitter<Empresa>();
    @Output() editar  = new EventEmitter<Empresa>();
    @Output() toggleConfirmado = new EventEmitter<Empresa>();

    confirmarVisible = false;
    pendienteAEstado = false;

    // ⬇️ mantiene el switch siempre en pantalla y solo abre el modal
    onToggleClick(event: MouseEvent): void {
        event.preventDefault();
        this.pendienteAEstado = !this.empresa.activo;
        this.confirmarVisible = true;
    }

    cancelar(): void {
        this.confirmarVisible = false;
    }

    confirmarCambio(): void {
        this.toggleConfirmado.emit(this.empresa);
        this.confirmarVisible = false;
    }
}
