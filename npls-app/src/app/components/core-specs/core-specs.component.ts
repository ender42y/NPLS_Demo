import { Component, inject, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CoreService } from '../../services/core.service';
import { Core, CoreWeightSpec } from '../../models/core.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-core-specs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatExpansionModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="core-specs-container">
      <div class="page-header">
        <h1>Core Specifications</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="toggleView()">
            <mat-icon>{{ viewMode() === 'table' ? 'view_module' : 'view_list' }}</mat-icon>
            {{ viewMode() === 'table' ? 'Card View' : 'Table View' }}
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Cores</mat-label>
              <input matInput
                     [(ngModel)]="searchQuery"
                     (ngModelChange)="applyFilter($event)"
                     placeholder="Search by name, core #...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Line</mat-label>
              <mat-select [(ngModel)]="selectedLine" (ngModelChange)="applyLineFilter($event)">
                <mat-option value="">All Lines</mat-option>
                @for (line of lines(); track line) {
                  <mat-option [value]="line">{{ line }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Core Type</mat-label>
              <mat-select [(ngModel)]="selectedType" (ngModelChange)="applyTypeFilter($event)">
                <mat-option value="">All Types</mat-option>
                <mat-option value="symmetric">Symmetric</mat-option>
                <mat-option value="asymmetric">Asymmetric</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Results Count -->
      <div class="results-summary">
        <span class="count">{{ dataSource.filteredData.length }} cores</span>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else {
        @if (viewMode() === 'table') {
          <!-- Table View -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="marketingName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Core Name</th>
                <td mat-cell *matCellDef="let core">
                  <span class="core-name">{{ core.marketingName }}</span>
                  @if (core.isSymmetric) {
                    <mat-chip class="sym-chip">SYM</mat-chip>
                  } @else {
                    <mat-chip class="asym-chip">ASYM</mat-chip>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="coreNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Core #</th>
                <td mat-cell *matCellDef="let core">{{ core.coreNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="weightBlockNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>WB #</th>
                <td mat-cell *matCellDef="let core">{{ core.weightBlockNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="line">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Line</th>
                <td mat-cell *matCellDef="let core">{{ core.line }}</td>
              </ng-container>

              <ng-container matColumnDef="rg16">
                <th mat-header-cell *matHeaderCellDef>RG (16lb)</th>
                <td mat-cell *matCellDef="let core">{{ getSpec(core, 16)?.rg || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="diff16">
                <th mat-header-cell *matHeaderCellDef>Diff (16lb)</th>
                <td mat-cell *matCellDef="let core">{{ getSpec(core, 16)?.differential || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="int16">
                <th mat-header-cell *matHeaderCellDef>Int (16lb)</th>
                <td mat-cell *matCellDef="let core">{{ getSpec(core, 16)?.intermediate || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="weights">
                <th mat-header-cell *matHeaderCellDef>Weights</th>
                <td mat-cell *matCellDef="let core">
                  <span class="weight-range">{{ getWeightRange(core) }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="expand">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let core">
                  <button mat-icon-button
                          (click)="toggleExpand(core); $event.stopPropagation()"
                          matTooltip="View all weights">
                    <mat-icon>{{ expandedCore === core ? 'expand_less' : 'expand_more' }}</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  [class.expanded]="expandedCore === row"
                  (click)="toggleExpand(row)"></tr>

              <!-- Expanded detail row -->
              <ng-container matColumnDef="expandedDetail">
                <td mat-cell *matCellDef="let core" [attr.colspan]="displayedColumns.length">
                  @if (expandedCore === core) {
                    <div class="expanded-detail" @detailExpand>
                      <h4>Specifications by Weight</h4>
                      <div class="specs-grid">
                        @for (spec of core.specs; track spec.weight) {
                          <div class="spec-card">
                            <div class="weight-label">{{ spec.weight }} lb</div>
                            <div class="spec-row">
                              <span class="label">RG:</span>
                              <span class="value">{{ spec.rg }}</span>
                            </div>
                            <div class="spec-row">
                              <span class="label">Diff:</span>
                              <span class="value">{{ spec.differential }}</span>
                            </div>
                            <div class="spec-row">
                              <span class="label">Int:</span>
                              <span class="value">{{ spec.intermediate || 'N/A' }}</span>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </td>
              </ng-container>

              <tr mat-row *matRowDef="let row; columns: ['expandedDetail']"
                  class="detail-row"></tr>
            </table>

            <mat-paginator
              [pageSizeOptions]="[10, 25, 50]"
              [pageSize]="25"
              showFirstLastButtons>
            </mat-paginator>
          </div>
        } @else {
          <!-- Card View -->
          <div class="card-grid">
            @for (core of dataSource.filteredData; track core.id) {
              <mat-card class="core-card">
                <mat-card-header>
                  <mat-card-title>{{ core.marketingName }}</mat-card-title>
                  <mat-card-subtitle>
                    Core #{{ core.coreNumber }} | WB #{{ core.weightBlockNumber }}
                  </mat-card-subtitle>
                  <div class="card-badges">
                    <mat-chip class="line-chip">{{ core.line }}</mat-chip>
                    @if (core.isSymmetric) {
                      <mat-chip class="sym-chip">Symmetric</mat-chip>
                    } @else {
                      <mat-chip class="asym-chip">Asymmetric</mat-chip>
                    }
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="specs-table-small">
                    <table>
                      <thead>
                        <tr>
                          <th>Wt</th>
                          <th>RG</th>
                          <th>Diff</th>
                          <th>Int</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (spec of core.specs; track spec.weight) {
                          <tr>
                            <td>{{ spec.weight }}</td>
                            <td>{{ spec.rg }}</td>
                            <td>{{ spec.differential }}</td>
                            <td>{{ spec.intermediate || '-' }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .core-specs-container {
      max-width: 1600px;
      margin: 0 auto;
    }

    .filters-card {
      margin-bottom: 16px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .search-field {
        flex: 2;
        min-width: 250px;
      }

      mat-form-field {
        flex: 1;
        min-width: 150px;
      }
    }

    .results-summary {
      margin-bottom: 16px;

      .count {
        font-weight: 500;
        color: #666;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    table {
      width: 100%;
    }

    .core-name {
      font-weight: 500;
      margin-right: 8px;
    }

    .sym-chip {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
      font-size: 0.7rem !important;
    }

    .asym-chip {
      background-color: #fff3e0 !important;
      color: #e65100 !important;
      font-size: 0.7rem !important;
    }

    .line-chip {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
      font-size: 0.7rem !important;
    }

    .weight-range {
      font-size: 0.85rem;
      color: #666;
    }

    .detail-row {
      height: 0;
    }

    .expanded-detail {
      padding: 16px 24px;
      background: #fafafa;

      h4 {
        margin: 0 0 16px 0;
        color: #1a237e;
      }

      .specs-grid {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        .spec-card {
          background: white;
          border-radius: 8px;
          padding: 12px;
          min-width: 100px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);

          .weight-label {
            font-weight: 600;
            color: #1a237e;
            margin-bottom: 8px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 8px;
          }

          .spec-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;

            .label {
              color: #666;
              font-size: 0.85rem;
            }

            .value {
              font-weight: 500;
            }
          }
        }
      }
    }

    // Card view
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .core-card {
      mat-card-header {
        margin-bottom: 12px;

        .card-badges {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
      }

      .specs-table-small {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;

          th, td {
            padding: 6px 8px;
            text-align: center;
            font-size: 0.85rem;
          }

          th {
            background: #e8eaf6;
            color: #1a237e;
            font-weight: 500;
          }

          tr:nth-child(even) {
            background: #f5f5f5;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .filters-row {
        flex-direction: column;

        .search-field,
        mat-form-field {
          min-width: 100%;
        }
      }

      .card-grid {
        grid-template-columns: 1fr;
      }

      table {
        .mat-column-rg16,
        .mat-column-diff16,
        .mat-column-int16 {
          display: none;
        }
      }
    }
  `]
})
export class CoreSpecsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private coreService = inject(CoreService);

  loading = toSignal(this.coreService.loading$, { initialValue: false });
  cores = toSignal(this.coreService.cores$, { initialValue: [] });

  dataSource = new MatTableDataSource<Core>([]);
  displayedColumns = [
    'marketingName',
    'coreNumber',
    'weightBlockNumber',
    'line',
    'rg16',
    'diff16',
    'int16',
    'weights',
    'expand'
  ];

  viewMode = signal<'table' | 'card'>('table');
  searchQuery = '';
  selectedLine = '';
  selectedType = '';
  expandedCore: Core | null = null;
  lines = signal<string[]>([]);

  ngOnInit(): void {
    this.coreService.cores$.subscribe(cores => {
      this.dataSource.data = cores;

      // Extract unique lines
      const uniqueLines = [...new Set(cores.map(c => c.line).filter(Boolean))];
      this.lines.set(uniqueLines as string[]);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: Core, filter: string) => {
      const filters = JSON.parse(filter);

      const matchesSearch = !filters.search ||
        data.marketingName.toLowerCase().includes(filters.search) ||
        String(data.coreNumber).includes(filters.search);

      const matchesLine = !filters.line || data.line === filters.line;

      const matchesType = !filters.type ||
        (filters.type === 'symmetric' && data.isSymmetric) ||
        (filters.type === 'asymmetric' && !data.isSymmetric);

      return matchesSearch && matchesLine && matchesType;
    };
  }

  toggleView(): void {
    this.viewMode.set(this.viewMode() === 'table' ? 'card' : 'table');
  }

  applyFilter(value: string): void {
    this.updateFilter();
  }

  applyLineFilter(value: string): void {
    this.updateFilter();
  }

  applyTypeFilter(value: string): void {
    this.updateFilter();
  }

  private updateFilter(): void {
    const filter = JSON.stringify({
      search: this.searchQuery.toLowerCase(),
      line: this.selectedLine,
      type: this.selectedType
    });
    this.dataSource.filter = filter;
  }

  toggleExpand(core: Core): void {
    this.expandedCore = this.expandedCore === core ? null : core;
  }

  getSpec(core: Core, weight: number): CoreWeightSpec | undefined {
    return core.specs.find(s => s.weight === weight);
  }

  getWeightRange(core: Core): string {
    if (!core.specs || core.specs.length === 0) return '-';
    const weights = core.specs.map(s => s.weight).sort((a, b) => b - a);
    return `${weights[0]}-${weights[weights.length - 1]} lb`;
  }
}
