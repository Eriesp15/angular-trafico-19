import type { Routes } from "@angular/router"
import { BaggageComponent } from "./baggage.component"
import { FollowComponent } from "./follow/follow.component"
import { ListComponent } from "./claim/list/list.component"
import { NewClaimComponent } from "./claim/new-claim/new-claim.component"
import { ViewClaimComponent } from "./claim/view-claim/view-claim.component"
import { MakeDeliveryComponent } from "./claim/make-delivery/make-delivery.component"
import { CompensationComponent } from "./claim/compensation/compensation.component"
import { ExpensesComponent } from "./claim/expenses/expenses.component"

export default [
  {
    path: "",
    component: BaggageComponent,},
      {
        path: "follow",
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
        path: "claim/compensation/:id",
        component: CompensationComponent,
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
] as Routes
