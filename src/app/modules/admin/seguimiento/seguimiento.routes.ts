import { Routes } from '@angular/router';
import { SeguimientoComponent } from 'app/modules/admin/seguimiento/seguimiento.component';

export default [
  {
    path: '',
    component: SeguimientoComponent,
    // 👇 Si "example.routes.ts" tiene data/resolve, ponlo igual aquí
    // data: { layout: 'admin' },
    // resolve: { initialData: SomeResolver },
  },
] as Routes;
