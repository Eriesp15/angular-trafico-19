import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { CerradoComponent } from 'app/modules/reclamo/cerrado/cerrado.component';
import { SeguimientoComponent } from 'app/modules/reclamo/seguimiento/seguimiento.component';


// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'baggage'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'baggage'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [
            { path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes') },
            { path: 'reclamo/empresas', loadComponent: () => import('app/modules/reclamo/empresas/empresas.component').then(m => m.EmpresasComponent), },
            { path: 'reclamo/empresas/:id/asignaciones', loadComponent: () => import('app/modules/reclamo/empresas/lista-asignaciones/lista-asignaciones.component').then(m => m.ListaAsignacionesComponent), },
            { path: 'reclamo/:id/hoja', component: SeguimientoComponent },
            { path: 'reclamo', loadChildren: () => import('app/modules/reclamo/reclamo.module').then(m => m.ReclamoModule) },
            { path: 'reclamo/:id/cerrado', component: CerradoComponent },  // Ruta de cerrado

            {path: 'baggage', loadChildren: () => import('app/modules/baggage/baggage.routes')},
        ]
    }
];
