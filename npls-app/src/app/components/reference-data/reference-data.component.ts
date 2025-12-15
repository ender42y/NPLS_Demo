import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReferenceDataService } from '../../services/reference-data.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reference-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="reference-data-container">
      <div class="page-header">
        <h1>Reference Data</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else {
        <mat-tab-group animationDuration="200ms">
          <!-- Coverstocks Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>layers</mat-icon>
              <span>Coverstocks ({{ referenceData()?.coverstocks?.length || 0 }})</span>
            </ng-template>
            <div class="tab-content">
              <div class="add-form">
                <mat-form-field appearance="outline">
                  <mat-label>Add New Coverstock</mat-label>
                  <input matInput [(ngModel)]="newCoverstock" placeholder="Enter coverstock name">
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="addCoverstock()" [disabled]="!newCoverstock">
                  <mat-icon>add</mat-icon>
                  Add
                </button>
              </div>

              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Filter coverstocks</mat-label>
                <input matInput [(ngModel)]="coverstockFilter" placeholder="Type to filter...">
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <div class="items-list">
                @for (item of filteredCoverstocks(); track item) {
                  <mat-chip-set>
                    <mat-chip>{{ item }}</mat-chip>
                  </mat-chip-set>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Finishes Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>brush</mat-icon>
              <span>Finishes ({{ referenceData()?.finishes?.length || 0 }})</span>
            </ng-template>
            <div class="tab-content">
              <div class="add-form">
                <mat-form-field appearance="outline">
                  <mat-label>Add New Finish</mat-label>
                  <input matInput [(ngModel)]="newFinish" placeholder="Enter finish name">
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="addFinish()" [disabled]="!newFinish">
                  <mat-icon>add</mat-icon>
                  Add
                </button>
              </div>

              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Filter finishes</mat-label>
                <input matInput [(ngModel)]="finishFilter" placeholder="Type to filter...">
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <div class="items-list">
                @for (item of filteredFinishes(); track item) {
                  <mat-chip-set>
                    <mat-chip>{{ item }}</mat-chip>
                  </mat-chip-set>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Weight Blocks Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>fitness_center</mat-icon>
              <span>Weight Blocks ({{ referenceData()?.weightBlocks?.length || 0 }})</span>
            </ng-template>
            <div class="tab-content">
              <div class="add-form">
                <mat-form-field appearance="outline">
                  <mat-label>Add New Weight Block</mat-label>
                  <input matInput [(ngModel)]="newWeightBlock" placeholder="Enter weight block name">
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="addWeightBlock()" [disabled]="!newWeightBlock">
                  <mat-icon>add</mat-icon>
                  Add
                </button>
              </div>

              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Filter weight blocks</mat-label>
                <input matInput [(ngModel)]="weightBlockFilter" placeholder="Type to filter...">
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <div class="items-list">
                @for (item of filteredWeightBlocks(); track item) {
                  <mat-chip-set>
                    <mat-chip>{{ item }}</mat-chip>
                  </mat-chip-set>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Brands Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>business</mat-icon>
              <span>Brands ({{ referenceData()?.brands?.length || 0 }})</span>
            </ng-template>
            <div class="tab-content">
              <div class="brand-cards">
                @for (brand of referenceData()?.brands; track brand) {
                  <mat-card class="brand-card">
                    <mat-card-content>
                      <mat-icon>business</mat-icon>
                      <span>{{ brand }}</span>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Lines Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>category</mat-icon>
              <span>Lines ({{ referenceData()?.lines?.length || 0 }})</span>
            </ng-template>
            <div class="tab-content">
              <div class="items-grid">
                @for (line of referenceData()?.lines; track line) {
                  <mat-card class="line-card">
                    <mat-card-content>
                      <span class="line-name">{{ line }}</span>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Coverstock Types Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>science</mat-icon>
              <span>Types ({{ referenceData()?.coverstockTypes?.length || 0 }})</span>
            </ng-template>
            <div class="tab-content">
              <div class="type-list">
                @for (type of referenceData()?.coverstockTypes; track type) {
                  <mat-card class="type-card">
                    <mat-card-content>
                      <mat-icon [class]="getTypeClass(type)">{{ getTypeIcon(type) }}</mat-icon>
                      <span>{{ type }}</span>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .reference-data-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    mat-tab-group {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .tab-content {
      padding: 24px;
    }

    .add-form {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;

      mat-form-field {
        flex: 1;
      }

      button {
        height: 56px;
      }
    }

    .search-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .items-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      mat-chip-set {
        display: inline;
      }
    }

    .brand-cards,
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }

    .brand-card,
    .line-card {
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;

        mat-icon {
          color: #3f51b5;
        }

        span {
          font-weight: 500;
        }
      }
    }

    .line-card {
      .line-name {
        color: #1a237e;
      }
    }

    .type-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .type-card {
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;

        mat-icon {
          &.pearl { color: #9c27b0; }
          &.solid { color: #f44336; }
          &.hybrid { color: #ff9800; }
          &.urethane { color: #4caf50; }
        }

        span {
          font-weight: 500;
        }
      }
    }

    mat-tab-label {
      mat-icon {
        margin-right: 8px;
      }
    }

    @media (max-width: 768px) {
      .add-form {
        flex-direction: column;

        button {
          width: 100%;
        }
      }

      .brand-cards,
      .items-grid,
      .type-list {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReferenceDataComponent {
  private referenceDataService = inject(ReferenceDataService);
  private snackBar = inject(MatSnackBar);

  loading = toSignal(this.referenceDataService.loading$, { initialValue: false });
  referenceData = toSignal(this.referenceDataService.referenceData$);

  // New item inputs
  newCoverstock = '';
  newFinish = '';
  newWeightBlock = '';

  // Filters
  coverstockFilter = '';
  finishFilter = '';
  weightBlockFilter = '';

  filteredCoverstocks = signal<string[]>([]);
  filteredFinishes = signal<string[]>([]);
  filteredWeightBlocks = signal<string[]>([]);

  constructor() {
    // Watch for reference data changes
    this.referenceDataService.referenceData$.subscribe(data => {
      if (data) {
        this.updateFilteredLists();
      }
    });
  }

  private updateFilteredLists(): void {
    const data = this.referenceData();
    if (!data) return;

    this.filteredCoverstocks.set(
      this.filterList(data.coverstocks, this.coverstockFilter)
    );
    this.filteredFinishes.set(
      this.filterList(data.finishes, this.finishFilter)
    );
    this.filteredWeightBlocks.set(
      this.filterList(data.weightBlocks, this.weightBlockFilter)
    );
  }

  private filterList(items: string[], filter: string): string[] {
    if (!filter) return items;
    const lowerFilter = filter.toLowerCase();
    return items.filter(item => item.toLowerCase().includes(lowerFilter));
  }

  addCoverstock(): void {
    if (this.newCoverstock.trim()) {
      this.referenceDataService.addCoverstock(this.newCoverstock.trim());
      this.snackBar.open(`Added coverstock: ${this.newCoverstock}`, 'Close', { duration: 3000 });
      this.newCoverstock = '';
      this.updateFilteredLists();
    }
  }

  addFinish(): void {
    if (this.newFinish.trim()) {
      this.referenceDataService.addFinish(this.newFinish.trim());
      this.snackBar.open(`Added finish: ${this.newFinish}`, 'Close', { duration: 3000 });
      this.newFinish = '';
      this.updateFilteredLists();
    }
  }

  addWeightBlock(): void {
    if (this.newWeightBlock.trim()) {
      this.referenceDataService.addWeightBlock(this.newWeightBlock.trim());
      this.snackBar.open(`Added weight block: ${this.newWeightBlock}`, 'Close', { duration: 3000 });
      this.newWeightBlock = '';
      this.updateFilteredLists();
    }
  }

  refreshData(): void {
    this.referenceDataService.refreshFromApi().subscribe(() => {
      this.snackBar.open('Reference data refreshed', 'Close', { duration: 3000 });
      this.updateFilteredLists();
    });
  }

  getTypeIcon(type: string): string {
    const lower = type.toLowerCase();
    if (lower.includes('pearl')) return 'blur_on';
    if (lower.includes('solid')) return 'circle';
    if (lower.includes('hybrid')) return 'blur_circular';
    if (lower.includes('urethane')) return 'radio_button_checked';
    return 'lens';
  }

  getTypeClass(type: string): string {
    const lower = type.toLowerCase();
    if (lower.includes('pearl')) return 'pearl';
    if (lower.includes('solid')) return 'solid';
    if (lower.includes('hybrid')) return 'hybrid';
    if (lower.includes('urethane')) return 'urethane';
    return '';
  }
}
