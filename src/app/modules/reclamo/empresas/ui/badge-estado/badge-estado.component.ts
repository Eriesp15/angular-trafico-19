import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-badge-estado',
    standalone: true,
    template: `<span class="pill" [style.background]="colorBg" [style.color]="colorTx">{{texto}}</span>`,
})
export class BadgeEstadoComponent {
    @Input() activo = true;
    get texto() { return this.activo ? 'Activo' : 'Inactivo'; }
    get colorBg() { return this.activo ? '#DCFCE7' : '#F3F4F6'; }
    get colorTx() { return this.activo ? '#065F46' : '#6B7280'; }
}
