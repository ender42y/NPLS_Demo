import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BallService } from '../../services/ball.service';
import { CoreService } from '../../services/core.service';
import { Ball } from '../../models/ball.model';
import { Observable, map, combineLatest } from 'rxjs';

interface DashboardStats {
  totalProducts: number;
  productsByBrand: { brand: string; count: number }[];
  productsByType: { type: string; count: number }[];
  recentProducts: Ball[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard</h1>
        <button mat-raised-button color="primary" routerLink="/npls/new">
          <mat-icon>add</mat-icon>
          New Product
        </button>
      </div>

      @if (loading$ | async) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="card-grid stats-section">
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="stat-icon">sports_baseball</mat-icon>
              <mat-card-title>Total Products</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ (stats$ | async)?.totalProducts || 0 }}</div>
              <div class="stat-label">Bowling balls in system</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="stat-icon">settings</mat-icon>
              <mat-card-title>Core Specifications</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ (coreCount$ | async) || 0 }}</div>
              <div class="stat-label">Unique cores available</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="stat-icon">category</mat-icon>
              <mat-card-title>Brands</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ (stats$ | async)?.productsByBrand?.length || 0 }}</div>
              <div class="stat-label">Active brands</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Brand Distribution -->
        <mat-card class="distribution-card">
          <mat-card-header>
            <mat-card-title>Products by Brand</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="brand-chips">
              @for (brand of (stats$ | async)?.productsByBrand; track brand.brand) {
                <mat-chip-set>
                  <mat-chip>
                    <span class="chip-label">{{ brand.brand }}</span>
                    <span class="chip-count">{{ brand.count }}</span>
                  </mat-chip>
                </mat-chip-set>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Recent Products -->
        <mat-card class="recent-products-card">
          <mat-card-header>
            <mat-card-title>Recent Products</mat-card-title>
            <span class="spacer"></span>
            <button mat-button color="primary" routerLink="/products">
              View All
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="(stats$ | async)?.recentProducts || []">
                <ng-container matColumnDef="ballName">
                  <th mat-header-cell *matHeaderCellDef>Ball Name</th>
                  <td mat-cell *matCellDef="let ball">
                    <a [routerLink]="['/npls', ball.id]" class="ball-link">
                      {{ ball.ballName }}
                    </a>
                  </td>
                </ng-container>

                <ng-container matColumnDef="brand">
                  <th mat-header-cell *matHeaderCellDef>Brand</th>
                  <td mat-cell *matCellDef="let ball">{{ ball.brand }}</td>
                </ng-container>

                <ng-container matColumnDef="coverstock">
                  <th mat-header-cell *matHeaderCellDef>Coverstock</th>
                  <td mat-cell *matCellDef="let ball">{{ ball.coverstock }}</td>
                </ng-container>

                <ng-container matColumnDef="core">
                  <th mat-header-cell *matHeaderCellDef>Core</th>
                  <td mat-cell *matCellDef="let ball">{{ ball.core }}</td>
                </ng-container>

                <ng-container matColumnDef="releaseType">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let ball">
                    <mat-chip [class]="ball.releaseType === 'OEM' ? 'oem-chip' : 'wwr-chip'">
                      {{ ball.releaseType }}
                    </mat-chip>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="quick-actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-stroked-button color="primary" routerLink="/npls/new">
                <mat-icon>add_circle</mat-icon>
                Create Product
              </button>
              <button mat-stroked-button color="primary" routerLink="/products">
                <mat-icon>search</mat-icon>
                Search Products
              </button>
              <button mat-stroked-button color="primary" routerLink="/cores">
                <mat-icon>settings_applications</mat-icon>
                Core Specs
              </button>
              <button mat-stroked-button color="primary" routerLink="/reference">
                <mat-icon>list_alt</mat-icon>
                Reference Data
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .stats-section {
      margin-bottom: 24px;
    }

    .stat-card {
      .stat-icon {
        background: linear-gradient(135deg, #3f51b5, #5c6bc0);
        color: white;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-size: 24px;
      }
    }

    .distribution-card {
      margin-bottom: 24px;
    }

    .brand-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      mat-chip {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .chip-label {
        font-weight: 500;
      }

      .chip-count {
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
      }
    }

    .recent-products-card {
      margin-bottom: 24px;

      mat-card-header {
        display: flex;
        align-items: center;
      }

      .spacer {
        flex: 1;
      }
    }

    .ball-link {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .oem-chip {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .wwr-chip {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
    }

    .quick-actions-card {
      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        button {
          flex: 1;
          min-width: 180px;
        }
      }
    }

    table {
      width: 100%;
    }

    @media (max-width: 768px) {
      .quick-actions-card .action-buttons button {
        min-width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private ballService = inject(BallService);
  private coreService = inject(CoreService);

  loading$ = this.ballService.loading$;
  displayedColumns = ['ballName', 'brand', 'coverstock', 'core', 'releaseType'];

  stats$!: Observable<DashboardStats>;
  coreCount$!: Observable<number>;

  ngOnInit(): void {
    this.stats$ = this.ballService.balls$.pipe(
      map(balls => {
        const brandCounts: Record<string, number> = {};
        const typeCounts: Record<string, number> = {};

        balls.forEach(ball => {
          brandCounts[ball.brand] = (brandCounts[ball.brand] || 0) + 1;
          if (ball.coverstockType) {
            typeCounts[ball.coverstockType] = (typeCounts[ball.coverstockType] || 0) + 1;
          }
        });

        const productsByBrand = Object.entries(brandCounts)
          .map(([brand, count]) => ({ brand, count }))
          .sort((a, b) => b.count - a.count);

        const productsByType = Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);

        return {
          totalProducts: balls.length,
          productsByBrand,
          productsByType,
          recentProducts: balls.slice(0, 10)
        };
      })
    );

    this.coreCount$ = this.coreService.cores$.pipe(
      map(cores => cores.length)
    );
  }
}
