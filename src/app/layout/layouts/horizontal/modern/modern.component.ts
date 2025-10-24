import { Component, type OnDestroy, type OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { Router, RouterOutlet } from "@angular/router";
import type { MatSidenav } from "@angular/material/sidenav";
import { ErpFullscreenComponent } from '@erp/components/fullscreen';
import { ErpLoadingBarComponent } from '@erp/components/loading-bar';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { SchemeComponent } from 'app/layout/common/scheme/scheme.component';
import { ThemeComponent } from 'app/layout/common/theme/theme.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: "modern-layout",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    ErpLoadingBarComponent,
    LanguagesComponent,
    ErpFullscreenComponent,
    SearchComponent,
    NotificationsComponent,
    UserComponent,
    SchemeComponent,
    ThemeComponent,
  ],
  templateUrl: "./modern.component.html",
})
export class ModernLayoutComponent implements OnInit, OnDestroy {
  @ViewChild("sidenav") sidenav!: MatSidenav;

  sidebarOpened = false;

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
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  toggleSidebar(): void {
    this.sidebarOpened = !this.sidebarOpened;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeSidebar();
  }

  closeSidebar(): void {
    this.sidebarOpened = false;
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}