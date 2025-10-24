import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import  { Router } from "@angular/router"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatListModule } from "@angular/material/list"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"

interface MenuItem {
  label: string
  icon: string
  route: string
}

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
  @Input() opened = false
  @Output() closeSidebar = new EventEmitter<void>()

  menuItems: MenuItem[] = [
    {
      label: "Visualizar Reclamo",
      icon: "visibility",
      route: "/example/visualizar-reclamo",
    },
    {
      label: "Realizar Reclamo",
      icon: "add_circle",
      route: "/example/realizar-reclamo",
    },
    {
      label: "Lista de Reclamos",
      icon: "list",
      route: "/example/lista-reclamos",
    },
  ]

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route])
    this.closeSidebar.emit()
  }

  close(): void {
    this.closeSidebar.emit()
  }
}
