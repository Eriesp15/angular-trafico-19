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
  },
  {
    path: "visualizar-reclamo",
    loadComponent: () => import("../detalle-reclamo/detalle-reclamo.component").then((c) => c.DetalleReclamoComponent),
    data: { title: "Visualizar Reclamo PIR" },
  },
  {
    path: "realizar-reclamo",
    loadComponent: () =>
      import("../realizar-reclamo/realizar-reclamo.component").then((c) => c.RealizarReclamoComponent),
    data: { title: "Realizar Reclamo" },
  },
  {
    path: "lista-reclamos",
    loadComponent: () => import("../lista-reclamos/lista-reclamos.component").then((c) => c.ListaReclamosComponent),
    data: { title: "Lista de Reclamos" },
  },
]

export default routes
