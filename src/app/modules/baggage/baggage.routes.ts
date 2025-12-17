import type { Routes } from "@angular/router"
import { BaggageComponent } from "./baggage.component"
import { FollowComponent } from "./follow/follow.component"
import { ListComponent } from "./claim/list/list.component"
import { NewClaimComponent } from "./claim/new-claim/new-claim.component"
import { ViewClaimComponent } from "./claim/view-claim/view-claim.component"
import { MakeDeliveryComponent } from "./claim/make-delivery/make-delivery.component"
import { AddExpenseComponent } from "./claim/add-expense/add-expense.component"
import { ExpensesComponent } from "./claim/expenses/expenses.component"
import { SupplierComponent } from './supplier/supplier.component';
import { ListSupplierComponent } from './supplier/list-supplier/list-supplier.component';
import { ClosingReceiptComponent } from "./closing-receipt/closing-receipt.component";

export default [
  {
    path: "",
    component: BaggageComponent,},
      {
        path: "claim/follow",
        component: FollowComponent,
        children: [
          {
            path: ":id",
            component: FollowComponent,
          },
        ],
      },
      {
        path: "claim/list",
        component: ListComponent,
      },
      {
        path: "claim/new",
        component: NewClaimComponent,
      },
      {
        path: "claim/add-expense/:id",
        component: AddExpenseComponent,
      },
      {
        path: "claim/view/:id",
        component: ViewClaimComponent,
      },
      {
        path: "claim/expenses/:id",
        component: ExpensesComponent,
      },
      {
        path: "claim/make-delivery/:id",
        component: MakeDeliveryComponent,
      },
      {
        path: "claim/supplier",
        component: SupplierComponent, // Ruta para registrar proveedores
      },
      {
        path: "claim/supplier/list",
        component: ListSupplierComponent, // Ruta para ver lista de proveedores
      },
      {
          path: 'claim/closing-receipt/:pir',
          component: ClosingReceiptComponent,
      },
] as Routes
