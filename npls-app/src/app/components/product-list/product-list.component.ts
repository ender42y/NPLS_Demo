import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { BallService } from '../../services/ball.service';
import { ReferenceDataService } from '../../services/reference-data.service';
import { Ball } from '../../models/ball.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="product-list-container">
      <div class="page-header">
        <h1>Products</h1>
        <button mat-raised-button color="primary" routerLink="/npls/new">
          <mat-icon>add</mat-icon>
          New Product
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input matInput
                     [(ngModel)]="searchQuery"
                     (ngModelChange)="onSearchChange($event)"
                     placeholder="Search by name, coverstock, core...">
              <mat-icon matPrefix>search</mat-icon>
              @if (searchQuery) {
                <button matSuffix mat-icon-button (click)="clearSearch()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Brand</mat-label>
              <mat-select [(ngModel)]="selectedBrand" (ngModelChange)="applyFilters()">
                <mat-option value="">All Brands</mat-option>
                @for (brand of brands(); track brand) {
                  <mat-option [value]="brand">{{ brand }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="selectedType" (ngModelChange)="applyFilters()">
                <mat-option value="">All Types</mat-option>
                @for (type of coverstockTypes(); track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Release</mat-label>
              <mat-select [(ngModel)]="selectedReleaseType" (ngModelChange)="applyFilters()">
                <mat-option value="">All</mat-option>
                <mat-option value="OEM">OEM</mat-option>
                <mat-option value="WWR">WWR</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()" matTooltip="Clear all filters">
              <mat-icon>filter_alt_off</mat-icon>
              Clear
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Results Summary -->
      <div class="results-summary">
        <span class="count">{{ dataSource.filteredData.length }} products</span>
        @if (hasActiveFilters()) {
          <mat-chip-set>
            @if (selectedBrand) {
              <mat-chip (removed)="selectedBrand = ''; applyFilters()">
                Brand: {{ selectedBrand }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            }
            @if (selectedType) {
              <mat-chip (removed)="selectedType = ''; applyFilters()">
                Type: {{ selectedType }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            }
            @if (selectedReleaseType) {
              <mat-chip (removed)="selectedReleaseType = ''; applyFilters()">
                Release: {{ selectedReleaseType }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            }
          </mat-chip-set>
        }
      </div>

      <!-- Products Table -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort>
            <!-- Ball Name Column -->
            <ng-container matColumnDef="ballName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Ball Name</th>
              <td mat-cell *matCellDef="let ball">
                <a [routerLink]="['/npls', ball.id]" class="ball-link">
                  {{ ball.ballName }}
                </a>
              </td>
            </ng-container>

            <!-- Brand Column -->
            <ng-container matColumnDef="brand">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Brand</th>
              <td mat-cell *matCellDef="let ball">{{ ball.brand }}</td>
            </ng-container>

            <!-- Release Type Column -->
            <ng-container matColumnDef="releaseType">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Release</th>
              <td mat-cell *matCellDef="let ball">
                <mat-chip [class]="ball.releaseType === 'OEM' ? 'oem-chip' : 'wwr-chip'">
                  {{ ball.releaseType }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Coverstock Column -->
            <ng-container matColumnDef="coverstock">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Coverstock</th>
              <td mat-cell *matCellDef="let ball">{{ ball.coverstock }}</td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="coverstockType">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let ball">{{ ball.coverstockType || '-' }}</td>
            </ng-container>

            <!-- Core Column -->
            <ng-container matColumnDef="core">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Core</th>
              <td mat-cell *matCellDef="let ball">{{ ball.core }}</td>
            </ng-container>

            <!-- Finish Column -->
            <ng-container matColumnDef="finish">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Finish</th>
              <td mat-cell *matCellDef="let ball">{{ ball.finish }}</td>
            </ng-container>

            <!-- Color Column -->
            <ng-container matColumnDef="marketingColorName">
              <th mat-header-cell *matHeaderCellDef>Color</th>
              <td mat-cell *matCellDef="let ball">{{ ball.marketingColorName || '-' }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let ball">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/npls', ball.id]">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="duplicateProduct(ball)">
                    <mat-icon>content_copy</mat-icon>
                    <span>Duplicate</span>
                  </button>
                  <button mat-menu-item (click)="exportSpecSheet(ball)">
                    <mat-icon>download</mat-icon>
                    <span>Export Spec Sheet</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="deleteProduct(ball)" class="delete-action">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="product-row"
                [class.selected]="selectedRow === row"
                (click)="selectedRow = row"></tr>

            <!-- No data row -->
            <tr class="mat-row no-data-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                <div class="no-data">
                  <mat-icon>search_off</mat-icon>
                  <p>No products found matching your criteria</p>
                  <button mat-stroked-button (click)="clearFilters()">Clear Filters</button>
                </div>
              </td>
            </tr>
          </table>

          <mat-paginator
            [pageSizeOptions]="[10, 25, 50, 100]"
            [pageSize]="25"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-list-container {
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
      align-items: center;

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
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;

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
      font-size: 0.75rem !important;
    }

    .wwr-chip {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
      font-size: 0.75rem !important;
    }

    .product-row {
      cursor: pointer;

      &:hover {
        background-color: #f5f5f5;
      }

      &.selected {
        background-color: #e8eaf6;
      }
    }

    .delete-action {
      color: #f44336;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #666;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      p {
        margin: 0 0 16px 0;
      }
    }

    @media (max-width: 1024px) {
      .filters-row {
        mat-form-field {
          min-width: 120px;
        }
      }
    }

    @media (max-width: 768px) {
      .filters-row {
        flex-direction: column;

        .search-field,
        mat-form-field {
          width: 100%;
          min-width: 100%;
        }
      }

      table {
        .mat-column-coverstockType,
        .mat-column-finish,
        .mat-column-marketingColorName {
          display: none;
        }
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private ballService = inject(BallService);
  private referenceDataService = inject(ReferenceDataService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private searchSubject = new Subject<string>();

  loading = toSignal(this.ballService.loading$, { initialValue: false });
  referenceData = toSignal(this.referenceDataService.referenceData$);

  brands = computed(() => this.referenceData()?.brands || []);
  coverstockTypes = computed(() => this.referenceData()?.coverstockTypes || []);

  dataSource = new MatTableDataSource<Ball>([]);
  displayedColumns = [
    'ballName',
    'brand',
    'releaseType',
    'coverstock',
    'coverstockType',
    'core',
    'finish',
    'marketingColorName',
    'actions'
  ];

  searchQuery = '';
  selectedBrand = '';
  selectedType = '';
  selectedReleaseType = '';
  selectedRow: Ball | null = null;

  ngOnInit(): void {
    this.ballService.balls$.subscribe(balls => {
      this.dataSource.data = balls;
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Ball, filter: string) => {
      const searchTerms = JSON.parse(filter);

      const matchesSearch = !searchTerms.search ||
        data.ballName.toLowerCase().includes(searchTerms.search) ||
        data.coverstock?.toLowerCase().includes(searchTerms.search) ||
        data.core?.toLowerCase().includes(searchTerms.search) ||
        data.brand?.toLowerCase().includes(searchTerms.search);

      const matchesBrand = !searchTerms.brand || data.brand === searchTerms.brand;
      const matchesType = !searchTerms.type || data.coverstockType === searchTerms.type;
      const matchesRelease = !searchTerms.releaseType || data.releaseType === searchTerms.releaseType;

      return matchesSearch && matchesBrand && matchesType && matchesRelease;
    };
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  applyFilters(): void {
    const filterValue = JSON.stringify({
      search: this.searchQuery.toLowerCase(),
      brand: this.selectedBrand,
      type: this.selectedType,
      releaseType: this.selectedReleaseType
    });

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedBrand = '';
    this.selectedType = '';
    this.selectedReleaseType = '';
    this.dataSource.filter = '';
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedBrand || this.selectedType || this.selectedReleaseType);
  }

  duplicateProduct(ball: Ball): void {
    this.ballService.duplicate(ball.id!).subscribe({
      next: (newBall) => {
        if (newBall) {
          this.snackBar.open(`Duplicated: ${newBall.ballName}`, 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.snackBar.open('Error duplicating product', 'Close', { duration: 3000 });
      }
    });
  }

  exportSpecSheet(ball: Ball): void {
    // Generate spec sheet data
    const specSheet = this.generateSpecSheet(ball);

    // Create blob and download
    const blob = new Blob([specSheet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ball.ballName.replace(/[^a-z0-9]/gi, '_')}_spec_sheet.txt`;
    a.click();
    URL.revokeObjectURL(url);

    this.snackBar.open('Spec sheet exported', 'Close', { duration: 3000 });
  }

  private generateSpecSheet(ball: Ball): string {
    const lines = [
      '═══════════════════════════════════════════════════════════════',
      '                    PRODUCT SPECIFICATION SHEET',
      '                      Storm Products, Inc.',
      '═══════════════════════════════════════════════════════════════',
      '',
      `Ball Name:        ${ball.ballName}`,
      `Brand:            ${ball.brand}`,
      `SKU:              ${ball.sku || 'N/A'}`,
      `Release Type:     ${ball.releaseType}`,
      `Line:             ${ball.line || 'N/A'}`,
      '',
      '───────────────────────────────────────────────────────────────',
      '                    TECHNICAL SPECIFICATIONS',
      '───────────────────────────────────────────────────────────────',
      '',
      `Coverstock:       ${ball.coverstock}`,
      `Coverstock Type:  ${ball.coverstockType || 'N/A'}`,
      `Finish:           ${ball.finish}`,
      `Core:             ${ball.core}`,
      '',
      '───────────────────────────────────────────────────────────────',
      '                         COLORS',
      '───────────────────────────────────────────────────────────────',
      '',
      `Marketing Name:   ${ball.marketingColorName || 'N/A'}`,
      `Pin Color:        ${ball.pinColor || 'N/A'}`,
    ];

    if (ball.colors && ball.colors.length > 0) {
      ball.colors.forEach((color, i) => {
        lines.push(`Color ${i + 1}:          ${color.color}${color.shade ? ` (${color.shade})` : ''}`);
      });
    }

    lines.push('');
    lines.push(`Fragrance:        ${ball.fragrance || 'N/A'}`);

    if (ball.specialNotes) {
      lines.push('');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('                       SPECIAL NOTES');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('');
      lines.push(ball.specialNotes);
    }

    if (ball.drillInstructions) {
      lines.push('');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('                    DRILL INSTRUCTIONS');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('');
      lines.push(ball.drillInstructions);
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push('CONFIDENTIAL - Storm Products, Inc.');
    lines.push('═══════════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  deleteProduct(ball: Ball): void {
    if (confirm(`Are you sure you want to delete "${ball.ballName}"?`)) {
      this.ballService.delete(ball.id!).subscribe({
        next: () => {
          this.snackBar.open('Product deleted', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
