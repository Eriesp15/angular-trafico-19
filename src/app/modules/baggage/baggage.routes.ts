import type { Routes } from "@angular/router"
import { BaggageComponent } from "./baggage.component"
import { FollowComponent } from "./follow/follow.component"
import { ListComponent } from "./claim/list/list.component"
import { NewClaimComponent } from "./claim/new-claim/new-claim.component"
import { ViewClaimComponent } from "./claim/view-claim/view-claim.component"
import { MakeDeliveryComponent } from "./claim/make-delivery/make-delivery.component"
import { AddExpenseComponent } from "./claim/add-expense/add-expense.component"
import { ExpensesComponent } from "./claim/expenses/expenses.component"
import { SupplierComponent } from "./supplier/supplier.component"
import { ListSupplierComponent } from "./supplier/list-supplier/list-supplier.component"
import { ClosingReceiptComponent } from "./closing-receipt/closing-receipt.component"
import { ContentComponent } from "./claim/content/content.component"
import { StationContactComponent } from "./station-contact/station-contact.component"
import { ReportsComponent } from "./reports/reports.component"
import { NewOhlComponent } from "./ohl/new-ohl/new-ohl.component"
import { SearchComponent } from "./search/search.component"

export default [
  {
    path: "",
    component: BaggageComponent,
  },
  {
    path: "claim/follow/:pir",
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
    path: "claim/content/:id",
    component: ContentComponent,
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
    path: "claim/station-contact/:id",
    component: StationContactComponent,
  },
  {
    path: "claim/supplier",
    component: SupplierComponent,
  },
  {
    path: "claim/supplier/list",
    component: ListSupplierComponent,
  },
  {
    path: "claim/closing-receipt/:pir",
    component: ClosingReceiptComponent,
  },
  {
    path: "reports",
    component: ReportsComponent,
  },
  {
    path: "ohl/new",
    component: NewOhlComponent,
  },
  {
    path: "search",
    component: SearchComponent,
  },
] as Routes
