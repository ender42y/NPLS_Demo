import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  description?: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="sidenav"
      >
        <div class="sidenav-header">
          <img src="assets/logo.svg" alt="NPLS" class="logo" onerror="this.style.display='none'">
          <h2>NPLS</h2>
          <p class="subtitle">Product Layout System</p>
        </div>

        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active"
              [matTooltip]="item.description || ''"
              matTooltipPosition="right"
              (click)="isMobile() && sidenav.close()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider></mat-divider>
          <p class="version">v1.0.0</p>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          @if (isMobile()) {
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
          }

          <span class="toolbar-title">Storm Products - NPLS</span>

          <span class="spacer"></span>

          <button mat-icon-button matTooltip="Refresh Data">
            <mat-icon>refresh</mat-icon>
          </button>

          <button mat-icon-button [matMenuTriggerFor]="settingsMenu" matTooltip="Settings">
            <mat-icon>settings</mat-icon>
          </button>

          <mat-menu #settingsMenu="matMenu">
            <button mat-menu-item>
              <mat-icon>storage</mat-icon>
              <span>Clear Cache</span>
            </button>
            <button mat-menu-item>
              <mat-icon>cloud_sync</mat-icon>
              <span>Sync with Server</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item>
              <mat-icon>help</mat-icon>
              <span>Help</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background: linear-gradient(180deg, #1a237e 0%, #283593 100%);
      color: white;
    }

    .sidenav-header {
      padding: 24px 16px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .logo {
        width: 64px;
        height: 64px;
        margin-bottom: 12px;
      }

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: 2px;
      }

      .subtitle {
        margin: 4px 0 0;
        font-size: 0.75rem;
        opacity: 0.7;
        letter-spacing: 1px;
      }
    }

    mat-nav-list {
      padding-top: 8px;

      a {
        color: rgba(255, 255, 255, 0.85);
        margin: 4px 8px;
        border-radius: 8px;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        &.active {
          background: rgba(255, 255, 255, 0.2);
          color: white;

          mat-icon {
            color: #ffca28;
          }
        }

        mat-icon {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      text-align: center;

      .version {
        margin: 8px 0 0;
        font-size: 0.75rem;
        opacity: 0.5;
      }
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-title {
      font-weight: 500;
      margin-left: 8px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 24px;
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
    }

    @media (max-width: 768px) {
      .content {
        padding: 16px;
      }

      .toolbar-title {
        font-size: 0.9rem;
      }
    }
  `]
})
export class LayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);

  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      description: 'Overview and statistics'
    },
    {
      label: 'New Product',
      icon: 'add_circle',
      route: '/npls/new',
      description: 'Create new product layout'
    },
    {
      label: 'Products',
      icon: 'sports_baseball',
      route: '/products',
      description: 'View all products'
    },
    {
      label: 'Core Specs',
      icon: 'settings_applications',
      route: '/cores',
      description: 'Core specifications'
    },
    {
      label: 'Reference Data',
      icon: 'list_alt',
      route: '/reference',
      description: 'Manage lookup data'
    }
  ];
}
