import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-realizar-reclamo",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./realizar-reclamo.component.html",
  styleUrls: ["./realizar-reclamo.component.scss"],
})
export class RealizarReclamoComponent {
  constructor() {}
}
