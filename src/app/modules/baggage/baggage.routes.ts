import type { Routes } from "@angular/router"
import { BaggageComponent } from "./baggage.component"
import { FollowComponent } from "./follow/follow.component"
import { ListComponent } from "./claim/list/list.component"
import { NewClaimComponent } from "./claim/new-claim/new-claim.component"
import { ViewClaimComponent } from "./claim/view-claim/view-claim.component"
import { AddExpenseComponent } from "./claim/add-expense/add-expense.component"
import { ExpensesComponent } from "./claim/expenses/expenses.component"
import { SupplierComponent } from "./supplier/supplier.component"
import { ListSupplierComponent } from "./supplier/list-supplier/list-supplier.component"
import { ClosingReceiptComponent } from "./closing-receipt/closing-receipt.component"
import { ContentComponent } from "./claim/content/content.component"
import { StationContactComponent } from "./station-contact/station-contact.component"
import { ReportsComponent } from "./reports/reports.component"
import { NewOhdComponent } from "./ohd/new-ohd/new-ohd.component"
import { DerivationsComponent } from './derivations/derivations.component';
import { RepairFlowComponent } from './repair-flow/repair-flow.component';
import { TrackingSheetComponent } from "./claim/tracking-sheet/tracking-sheet.component"

export default [
  {
    path: "",
    component: BaggageComponent,
  },
  {
    path: "claim/trackingsheet/:id",
    component: TrackingSheetComponent,
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
    path: "claim/follow/:pir",
    component: FollowComponent,
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
    path: "ohd/new",
    component: NewOhdComponent,
  },
  {
    path: "repair",
    component: SendToRepairDialogComponent,
  },
    {
        path: 'claim/derivations/:pirNumber',
        loadComponent: () =>
            import('./derivations/derivations.component').then(m => m.DerivationsComponent)
    },
    {
        path: 'claim/repair-flow/:pirNumber',
        loadComponent: () =>
            import('./repair-flow/repair-flow.component').then(m => m.RepairFlowComponent)
    }

] as Routes
