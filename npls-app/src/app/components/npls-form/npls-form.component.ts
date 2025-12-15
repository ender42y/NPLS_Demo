import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BallService } from '../../services/ball.service';
import { CoreService } from '../../services/core.service';
import { ReferenceDataService } from '../../services/reference-data.service';
import { Ball, BallColor } from '../../models/ball.model';
import { Core } from '../../models/core.model';
import { map, startWith, switchMap, take } from 'rxjs/operators';
import { Observable, of, combineLatest } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-npls-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  template: `
    <div class="npls-form-container">
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()" matTooltip="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>{{ isEditMode() ? 'Edit Product' : 'New Product Layout Sheet' }}</h1>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="resetForm()">
            <mat-icon>refresh</mat-icon>
            Reset
          </button>
          <button mat-stroked-button color="accent" (click)="saveDraft()">
            <mat-icon>save</mat-icon>
            Save Draft
          </button>
          <button mat-raised-button color="primary" (click)="submitForm()" [disabled]="!form.valid || saving()">
            @if (saving()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>check</mat-icon>
              {{ isEditMode() ? 'Update Product' : 'Create Product' }}
            }
          </button>
        </div>
      </div>

      <form [formGroup]="form">
        <!-- Product Information Section -->
        <div class="form-section">
          <h3><mat-icon>info</mat-icon> Product Information</h3>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Ball Name</mat-label>
              <input matInput formControlName="ballName" placeholder="Enter ball name">
              @if (form.get('ballName')?.hasError('required')) {
                <mat-error>Ball name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Brand</mat-label>
              <mat-select formControlName="brand">
                @for (brand of brands(); track brand) {
                  <mat-option [value]="brand">{{ brand }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Line</mat-label>
              <mat-select formControlName="line">
                @for (line of lines(); track line) {
                  <mat-option [value]="line">{{ line }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>SKU</mat-label>
              <input matInput formControlName="sku" placeholder="e.g., TWS">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Release Type</mat-label>
              <mat-select formControlName="releaseType">
                <mat-option value="OEM">OEM</mat-option>
                <mat-option value="WWR">WWR</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Target Release Date</mat-label>
              <input matInput [matDatepicker]="releasePicker" formControlName="releaseDate">
              <mat-datepicker-toggle matIconSuffix [for]="releasePicker"></mat-datepicker-toggle>
              <mat-datepicker #releasePicker></mat-datepicker>
            </mat-form-field>
          </div>
        </div>

        <!-- Technical Specifications Section -->
        <div class="form-section">
          <h3><mat-icon>settings</mat-icon> Technical Specifications</h3>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Coverstock</mat-label>
              <input matInput formControlName="coverstock"
                     [matAutocomplete]="coverstockAuto"
                     placeholder="Start typing...">
              <mat-autocomplete #coverstockAuto="matAutocomplete">
                @for (cs of filteredCoverstocks(); track cs) {
                  <mat-option [value]="cs">{{ cs }}</mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Coverstock Type</mat-label>
              <mat-select formControlName="coverstockType">
                @for (type of coverstockTypes(); track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Finish</mat-label>
              <mat-select formControlName="finish">
                @for (finish of finishes(); track finish) {
                  <mat-option [value]="finish">{{ finish }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Production Finish</mat-label>
              <mat-select formControlName="productionFinish">
                @for (finish of finishes(); track finish) {
                  <mat-option [value]="finish">{{ finish }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Core / Weight Block</mat-label>
              <input matInput formControlName="core"
                     [matAutocomplete]="coreAuto"
                     placeholder="Start typing...">
              <mat-autocomplete #coreAuto="matAutocomplete" (optionSelected)="onCoreSelected($event)">
                @for (core of filteredCores(); track core.id) {
                  <mat-option [value]="core.marketingName">
                    <span>{{ core.marketingName }}</span>
                    <small class="core-line"> - {{ core.line }}</small>
                  </mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>
          </div>

          <!-- Core Specs Display -->
          @if (selectedCore()) {
            <div class="core-specs-preview">
              <h4>Core Specifications - {{ selectedCore()?.marketingName }}</h4>
              <div class="specs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Weight</th>
                      <th>RG</th>
                      <th>Differential</th>
                      <th>Intermediate</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (spec of selectedCore()?.specs; track spec.weight) {
                      <tr>
                        <td>{{ spec.weight }} lb</td>
                        <td>{{ spec.rg }}</td>
                        <td>{{ spec.differential }}</td>
                        <td>{{ spec.intermediate || 'N/A' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>

        <!-- Colors Section -->
        <div class="form-section">
          <h3><mat-icon>palette</mat-icon> Colors & Appearance</h3>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Marketing Color Name</mat-label>
              <input matInput formControlName="marketingColorName"
                     placeholder="e.g., Amethyst/Peridot">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Pin Color</mat-label>
              <input matInput formControlName="pinColor" placeholder="Pin color">
            </mat-form-field>
          </div>

          <div formArrayName="colors" class="colors-array">
            @for (color of colorsArray.controls; track $index; let i = $index) {
              <div class="color-row" [formGroupName]="i">
                <span class="color-number">Color {{ i + 1 }}</span>
                <mat-form-field appearance="outline">
                  <mat-label>Color</mat-label>
                  <input matInput formControlName="color" placeholder="e.g., Purple">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Shade</mat-label>
                  <input matInput formControlName="shade" placeholder="e.g., Amethyst">
                </mat-form-field>
                @if (i > 0) {
                  <button mat-icon-button color="warn" (click)="removeColor(i)" matTooltip="Remove color">
                    <mat-icon>remove_circle</mat-icon>
                  </button>
                }
              </div>
            }
            @if (colorsArray.length < 4) {
              <button mat-stroked-button type="button" (click)="addColor()">
                <mat-icon>add</mat-icon>
                Add Color
              </button>
            }
          </div>
        </div>

        <!-- Fragrance Section -->
        <div class="form-section">
          <h3><mat-icon>air</mat-icon> Fragrance</h3>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Fragrance</mat-label>
              <input matInput formControlName="fragrance" placeholder="e.g., Grape">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fragrance Marketing Name</mat-label>
              <input matInput formControlName="fragranceMarketing"
                     placeholder="Marketing description">
            </mat-form-field>
          </div>
        </div>

        <!-- Logos Section -->
        <mat-expansion-panel class="form-section logos-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>image</mat-icon>
              Logo Configuration
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div formGroupName="logos">
            @for (position of logoPositions; track position.key) {
              <div class="logo-config-row" [formGroupName]="position.key">
                <span class="logo-position">{{ position.label }}</span>
                <mat-form-field appearance="outline">
                  <mat-label>Logo</mat-label>
                  <input matInput formControlName="logo" [placeholder]="position.label + ' logo'">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Color</mat-label>
                  <input matInput formControlName="color" placeholder="Logo color">
                </mat-form-field>
              </div>
            }
          </div>
        </mat-expansion-panel>

        <!-- Notes Section -->
        <div class="form-section">
          <h3><mat-icon>notes</mat-icon> Additional Information</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Special Notes</mat-label>
            <textarea matInput formControlName="specialNotes" rows="3"
                      placeholder="Any special notes or instructions..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Drill Instructions</mat-label>
            <textarea matInput formControlName="drillInstructions" rows="3"
                      placeholder="Drill instructions for production..."></textarea>
          </mat-form-field>
        </div>

        <!-- Form Actions (Mobile) -->
        <div class="mobile-actions">
          <button mat-raised-button color="primary" (click)="submitForm()"
                  [disabled]="!form.valid || saving()" class="full-width">
            @if (saving()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ isEditMode() ? 'Update Product' : 'Create Product' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .npls-form-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 500;
          color: #1a237e;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    }

    .form-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      h3 {
        margin: 0 0 20px 0;
        color: #1a237e;
        font-weight: 500;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 10px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e0e0e0;

        mat-icon {
          color: #3f51b5;
        }
      }
    }

    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 8px;

      > mat-form-field {
        flex: 1;
        min-width: 200px;
      }
    }

    .colors-array {
      .color-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;

        .color-number {
          min-width: 60px;
          font-weight: 500;
          color: #666;
        }

        mat-form-field {
          flex: 1;
        }
      }

      button {
        margin-top: 8px;
      }
    }

    .core-specs-preview {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;

      h4 {
        margin: 0 0 12px 0;
        color: #1a237e;
        font-size: 0.95rem;
      }

      .specs-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;

          th, td {
            padding: 8px 12px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
          }

          th {
            background: #e8eaf6;
            font-weight: 500;
            color: #1a237e;
          }

          td {
            background: white;
          }
        }
      }
    }

    .logos-panel {
      margin-bottom: 20px;

      mat-panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #1a237e;
        font-weight: 500;
      }

      .logo-config-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;

        .logo-position {
          min-width: 80px;
          font-weight: 500;
          color: #666;
        }

        mat-form-field {
          flex: 1;
        }
      }
    }

    .core-line {
      color: #666;
      font-size: 0.85rem;
    }

    .mobile-actions {
      display: none;
      padding: 16px 0;
    }

    @media (max-width: 768px) {
      .page-header {
        .header-actions {
          display: none;
        }

        h1 {
          font-size: 1.25rem;
        }
      }

      .mobile-actions {
        display: block;
      }

      .form-row {
        flex-direction: column;

        > mat-form-field {
          min-width: 100%;
        }
      }

      .colors-array .color-row {
        flex-wrap: wrap;

        .color-number {
          width: 100%;
          margin-bottom: 8px;
        }
      }

      .logos-panel .logo-config-row {
        flex-wrap: wrap;

        .logo-position {
          width: 100%;
          margin-bottom: 8px;
        }
      }
    }
  `]
})
export class NplsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private ballService = inject(BallService);
  private coreService = inject(CoreService);
  private referenceDataService = inject(ReferenceDataService);

  form!: FormGroup;
  saving = signal(false);
  isEditMode = signal(false);
  editId = signal<string | null>(null);
  selectedCore = signal<Core | null>(null);

  // Reference data signals
  referenceData = toSignal(this.referenceDataService.referenceData$);

  brands = computed(() => this.referenceData()?.brands || []);
  lines = computed(() => this.referenceData()?.lines || []);
  coverstocks = computed(() => this.referenceData()?.coverstocks || []);
  finishes = computed(() => this.referenceData()?.finishes || []);
  coverstockTypes = computed(() => this.referenceData()?.coverstockTypes || []);

  // Cores list
  cores = toSignal(this.coreService.cores$, { initialValue: [] });
  filteredCores = signal<Core[]>([]);
  filteredCoverstocks = signal<string[]>([]);

  logoPositions = [
    { key: 'top', label: 'Top' },
    { key: 'left', label: 'Left' },
    { key: 'right', label: 'Right' },
    { key: 'mid', label: 'Middle' },
    { key: 'psa', label: 'PSA' }
  ];

  get colorsArray(): FormArray {
    return this.form.get('colors') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    this.setupAutocomplete();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      ballName: ['', Validators.required],
      brand: ['Storm'],
      line: [''],
      sku: [''],
      releaseType: ['OEM'],
      releaseDate: [null],

      coverstock: [''],
      coverstockType: [''],
      finish: [''],
      productionFinish: [''],

      core: [''],
      coreNumber: [''],
      weightBlockNumber: [''],

      marketingColorName: [''],
      pinColor: [''],
      colors: this.fb.array([this.createColorGroup()]),

      fragrance: [''],
      fragranceMarketing: [''],

      logos: this.fb.group({
        top: this.fb.group({ logo: [''], color: [''] }),
        left: this.fb.group({ logo: [''], color: [''] }),
        right: this.fb.group({ logo: [''], color: [''] }),
        mid: this.fb.group({ logo: [''], color: [''] }),
        psa: this.fb.group({ logo: [''], color: [''] })
      }),

      specialNotes: [''],
      drillInstructions: ['']
    });
  }

  private createColorGroup(): FormGroup {
    return this.fb.group({
      colorNumber: [this.colorsArray?.length + 1 || 1],
      color: [''],
      shade: ['']
    });
  }

  private setupAutocomplete(): void {
    // Filter coverstocks
    this.form.get('coverstock')?.valueChanges.pipe(
      startWith('')
    ).subscribe(value => {
      const filterValue = (value || '').toLowerCase();
      this.filteredCoverstocks.set(
        this.coverstocks().filter(cs => cs.toLowerCase().includes(filterValue))
      );
    });

    // Filter cores
    this.form.get('core')?.valueChanges.pipe(
      startWith('')
    ).subscribe(value => {
      const filterValue = (value || '').toLowerCase();
      this.filteredCores.set(
        this.cores().filter(core =>
          core.marketingName.toLowerCase().includes(filterValue)
        )
      );
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.editId.set(id);
      this.loadBall(id);
    }
  }

  private loadBall(id: string): void {
    this.ballService.getById(id).pipe(take(1)).subscribe(ball => {
      if (ball) {
        this.patchFormWithBall(ball);
      } else {
        this.snackBar.open('Product not found', 'Close', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    });
  }

  private patchFormWithBall(ball: Ball): void {
    // Clear existing colors
    while (this.colorsArray.length) {
      this.colorsArray.removeAt(0);
    }

    // Add colors from ball
    if (ball.colors && ball.colors.length > 0) {
      ball.colors.forEach(color => {
        this.colorsArray.push(this.fb.group({
          colorNumber: [color.colorNumber],
          color: [color.color],
          shade: [color.shade]
        }));
      });
    } else {
      this.colorsArray.push(this.createColorGroup());
    }

    this.form.patchValue({
      ballName: ball.ballName,
      brand: ball.brand,
      line: ball.line,
      sku: ball.sku,
      releaseType: ball.releaseType,
      releaseDate: ball.releaseDate ? new Date(ball.releaseDate) : null,
      coverstock: ball.coverstock,
      coverstockType: ball.coverstockType,
      finish: ball.finish,
      productionFinish: ball.productionFinish,
      core: ball.core,
      marketingColorName: ball.marketingColorName,
      pinColor: ball.pinColor,
      fragrance: ball.fragrance,
      fragranceMarketing: ball.fragranceMarketing,
      logos: ball.logos || {},
      specialNotes: ball.specialNotes,
      drillInstructions: ball.drillInstructions
    });

    // Load core specs if available
    if (ball.core) {
      this.coreService.getByName(ball.core).pipe(take(1)).subscribe(core => {
        if (core) {
          this.selectedCore.set(core);
        }
      });
    }
  }

  onCoreSelected(event: any): void {
    const coreName = event.option.value;
    const core = this.cores().find(c => c.marketingName === coreName);
    if (core) {
      this.selectedCore.set(core);
      this.form.patchValue({
        coreNumber: core.coreNumber,
        weightBlockNumber: core.weightBlockNumber
      });
    }
  }

  addColor(): void {
    if (this.colorsArray.length < 4) {
      this.colorsArray.push(this.createColorGroup());
    }
  }

  removeColor(index: number): void {
    this.colorsArray.removeAt(index);
    // Update color numbers
    this.colorsArray.controls.forEach((ctrl, i) => {
      ctrl.patchValue({ colorNumber: i + 1 });
    });
  }

  submitForm(): void {
    if (!this.form.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.saving.set(true);
    const formValue = this.form.value;

    const ball: Omit<Ball, 'id'> = {
      ballName: formValue.ballName,
      brand: formValue.brand,
      line: formValue.line,
      sku: formValue.sku,
      releaseType: formValue.releaseType,
      releaseDate: formValue.releaseDate?.toISOString(),
      coverstock: formValue.coverstock,
      coverstockType: formValue.coverstockType,
      finish: formValue.finish,
      productionFinish: formValue.productionFinish,
      core: formValue.core,
      coreNumber: formValue.coreNumber,
      weightBlockNumber: formValue.weightBlockNumber,
      marketingColorName: formValue.marketingColorName,
      pinColor: formValue.pinColor,
      colors: formValue.colors.filter((c: any) => c.color),
      fragrance: formValue.fragrance,
      fragranceMarketing: formValue.fragranceMarketing,
      logos: formValue.logos,
      specialNotes: formValue.specialNotes,
      drillInstructions: formValue.drillInstructions
    };

    const operation = this.isEditMode()
      ? this.ballService.update(this.editId()!, ball)
      : this.ballService.create(ball);

    operation.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.snackBar.open(
          this.isEditMode() ? 'Product updated successfully' : 'Product created successfully',
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open('Error saving product', 'Close', { duration: 3000 });
        console.error('Save error:', err);
      }
    });
  }

  saveDraft(): void {
    const formValue = this.form.value;
    localStorage.setItem('npls_draft', JSON.stringify(formValue));
    this.snackBar.open('Draft saved', 'Close', { duration: 2000 });
  }

  resetForm(): void {
    this.form.reset({
      brand: 'Storm',
      releaseType: 'OEM'
    });

    // Reset colors array to single empty color
    while (this.colorsArray.length > 1) {
      this.colorsArray.removeAt(1);
    }
    this.colorsArray.at(0).reset({ colorNumber: 1 });

    this.selectedCore.set(null);
    this.snackBar.open('Form reset', 'Close', { duration: 2000 });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
