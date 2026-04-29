import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { ExpenseItem, ExpenseService } from "../../services/expense.service"

interface ExpenseGroup {
  title: string
  total: number
  items: ExpenseItem[]
}

@Component({
  selector: "app-expenses",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: "./expenses.component.html",
  styleUrls: ["./expenses.component.scss"],
})
export class ExpensesComponent implements OnInit {
  claimId = ""
  groups: ExpenseGroup[] = []
  totalGastos = 0
  cargando = false
  error = ""

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.params["id"]
    if (this.claimId) {
      this.cargarGastos()
    }
  }

  cargarGastos(): void {
    this.cargando = true
    this.error = ""

    this.expenseService.getByPir(this.claimId).subscribe({
      next: (response) => {
        this.cargando = false
        this.totalGastos = response.total
        this.groups = this.groupByTitle(response.items)
      },
      error: () => {
        this.cargando = false
        this.error = "No se pudo cargar el listado de gastos."
        this.groups = []
      },
    })
  }

  private groupByTitle(items: ExpenseItem[]): ExpenseGroup[] {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.title]) {
        acc[item.title] = {
          title: item.title,
          total: 0,
          items: [],
        }
      }
      acc[item.title].items.push(item)
      acc[item.title].total += item.cost
      return acc
    }, {} as Record<string, ExpenseGroup>)

    return Object.values(grouped)
  }

  agregarGasto(): void {
    this.router.navigate(["/baggage/claim/add-expense", this.claimId])
  }

  volver(): void {
    this.router.navigate(["/baggage/claim/view", this.claimId])
  }
}
