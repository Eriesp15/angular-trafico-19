import type { Routes } from "@angular/router"
import { DetalleReclamoComponent } from "./detalle-reclamo.component"

export const detalleReclamoRoutes: Routes = [
  {
    path: ":id",
    component: DetalleReclamoComponent,
    data: { title: "Detalle de Reclamo" },
  },
]
