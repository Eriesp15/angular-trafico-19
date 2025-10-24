import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmpresasService } from 'app/modules/reclamo/empresas/servicios/empresas.service';
import { ModalConfirmacionComponent } from 'app/modules/reclamo/empresas/modales/modal-confirmacion/modal-confirmacion.component';
import { EstadoAsignacion } from '../modelos/empresas.model';

@Component({
    selector: 'app-lista-asignaciones',
    standalone: true,
    imports: [CommonModule, ModalConfirmacionComponent],
    styleUrls: ['./lista-asignaciones.component.scss', '../modales/modales.scss'],
    templateUrl: './lista-asignaciones.component.html',
})
export class ListaAsignacionesComponent {
    route = inject(ActivatedRoute);
    router = inject(Router);
    svc = inject(EmpresasService);

    empresaId = this.route.snapshot.paramMap.get('id')!;
    empresa = this.svc.empresas().find(e => e.id === this.empresaId)!;
    filas = signal(this.svc.asignacionesPorEmpresa(this.empresaId));

    // confirmación
    confirmarAbierto = false;
    confirmarMsg = '';
    accion?: () => void;

    abrirConfirmacion(msg: string, fn: () => void){ this.confirmarMsg = msg; this.accion = fn; this.confirmarAbierto = true; }
    cerrarConfirmacion(){ this.confirmarAbierto = false; this.accion = undefined; }
    confirmar(){ this.accion?.(); this.cerrarConfirmacion(); this.filas.set(this.svc.asignacionesPorEmpresa(this.empresaId)); }

    cambiarEstado(id: string, actual: EstadoAsignacion, pir: string) {
        const nuevo: EstadoAsignacion =
            actual === EstadoAsignacion.Pendiente
                ? EstadoAsignacion.Entregado
                : EstadoAsignacion.Pendiente;

        this.abrirConfirmacion(
            `¿Está seguro que desea cambiar el estado de ${pir}?`,
            () => this.svc.cambiarEstadoAsignacion(id, nuevo)   // ahora existe en el service
        );
    }
    eliminar(id: string, pir: string) {
        this.abrirConfirmacion(`¿Eliminar la asignación ${pir}?`, () => this.svc.eliminarAsignacion(id));
    }

}
