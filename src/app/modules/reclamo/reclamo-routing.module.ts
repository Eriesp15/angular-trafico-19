import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';

const routes: Routes = [
    // /reclamo/:id/hoja
    { path: ':id/hoja', component: SeguimientoComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReclamoRoutingModule {}
