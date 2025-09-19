import type { Routes } from "@angular/router"
import { OperatorDashboardComponent } from "./operator-dashboard.component"

export const operatorDashboardRoutes: Routes = [
  {
    path: "",
    component: OperatorDashboardComponent,
    data: { title: "Dashboard de Operador" },
  },
]
