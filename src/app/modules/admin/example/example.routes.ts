import { Routes } from "@angular/router"
import { ExampleComponent } from "./example.component"

const routes: Routes = [
  {
    path: "",
    component: ExampleComponent,
    data: { title: "Dashboard de Operador" },
  },
  {
    path: "reclamo/:id",
    loadComponent: () => import("../detalle-reclamo/detalle-reclamo.component").then((c) => c.DetalleReclamoComponent),
    data: { title: "Detalle de Reclamo" },
  }
]

export default routes
