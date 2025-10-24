import type { Route } from "@angular/router"
import { initialDataResolver } from "app/app.resolvers"
import { AuthGuard } from "app/core/auth/guards/auth.guard"
import { NoAuthGuard } from "app/core/auth/guards/noAuth.guard"
import { LayoutComponent } from "app/layout/layout.component"
import { CerradoComponent } from "app/modules/reclamo/cerrado/cerrado.component"
import { SeguimientoComponent } from "app/modules/reclamo/seguimiento/seguimiento.component"

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
  // Redirect empty path to '/dashboard'
  { path: "", pathMatch: "full", redirectTo: "dashboard" },

  // Redirect signed-in user to the '/dashboard'
  { path: "signed-in-redirect", pathMatch: "full", redirectTo: "example" },

  // Auth routes for guests
  {
    path: "",
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "confirmation-required",
        loadChildren: () => import("app/modules/auth/confirmation-required/confirmation-required.routes"),
      },
      {
        path: "forgot-password",
        loadChildren: () => import("app/modules/auth/forgot-password/forgot-password.routes"),
      },
      { path: "reset-password", loadChildren: () => import("app/modules/auth/reset-password/reset-password.routes") },
      { path: "sign-in", loadChildren: () => import("app/modules/auth/sign-in/sign-in.routes") },
    ],
  },

  // Auth routes for authenticated users
  {
    path: "",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      { path: "sign-out", loadChildren: () => import("app/modules/auth/sign-out/sign-out.routes") },
      { path: "unlock-session", loadChildren: () => import("app/modules/auth/unlock-session/unlock-session.routes") },
    ],
  },

  // Admin routes - Combined from both branches
  {
    path: "",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: initialDataResolver,
    },
    children: [
      { path: "dashboard", loadChildren: () => import("app/modules/admin/example/example.routes") },
      {
        path: "reclamo/empresas",
        loadComponent: () => import("app/modules/reclamo/empresas/empresas.component").then((m) => m.EmpresasComponent),
      },
      {
        path: "reclamo/empresas/:id/asignaciones",
        loadComponent: () =>
          import("app/modules/reclamo/empresas/lista-asignaciones/lista-asignaciones.component").then(
            (m) => m.ListaAsignacionesComponent,
          ),
      },
      { path: "reclamo/:id/hoja", component: SeguimientoComponent },
      {
        path: "claim",
        loadChildren: () => import("app/modules/reclamo/reclamo.module").then((m) => m.ReclamoModule),
      },
      { path: "reclamo/:id/cerrado", component: CerradoComponent },
    ],
  },
]
