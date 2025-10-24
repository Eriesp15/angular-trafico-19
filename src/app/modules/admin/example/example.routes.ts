import { Routes } from "@angular/router"
import { ExampleComponent } from "./example.component"

const routes: Routes = [
  {
    path: "",
    component: ExampleComponent,
    data: { title: "Dashboard de Operador" },
  },
  {
    path: "claim/:id",
    loadComponent: () => import("../detalle-reclamo/detalle-reclamo.component").then((c) => c.DetalleReclamoComponent),
    data: { title: "Detalle de Reclamo" },
  },
  {
    path: "claim-view",
    loadComponent: () => import("../detalle-reclamo/detalle-reclamo.component").then((c) => c.DetalleReclamoComponent),
    data: { title: "Visualizar Reclamo PIR" },
  },
  {
    path: "make-claim",
    loadComponent: () =>
      import("../realizar-reclamo/realizar-reclamo.component").then((c) => c.RealizarReclamoComponent),
    data: { title: "Realizar Reclamo" },
  },
  {
    path: "claims-list",
    loadComponent: () => import("../lista-reclamos/lista-reclamos.component").then((c) => c.ListaReclamosComponent),
    data: { title: "Lista de Reclamos" },
  },
]

export default routes
