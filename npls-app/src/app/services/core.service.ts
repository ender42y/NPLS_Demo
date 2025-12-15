import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, map, tap } from 'rxjs';
import { Core, CoreWeightSpec } from '../models/core.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private readonly STORAGE_KEY = 'cores';

  private coresSubject = new BehaviorSubject<Core[]>([]);
  cores$ = this.coresSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const cachedCores = this.storage.get<Core[]>(this.STORAGE_KEY);
    if (cachedCores && cachedCores.length > 0) {
      this.coresSubject.next(cachedCores);
    } else {
      this.loadSeedData();
    }
  }

  private loadSeedData(): void {
    this.loadingSubject.next(true);
    this.http.get<any[]>('assets/rg-seed.json').pipe(
      map(data => this.transformSeedData(data)),
      tap(cores => {
        this.storage.set(this.STORAGE_KEY, cores);
        this.coresSubject.next(cores);
      }),
      catchError(error => {
        console.error('Error loading core seed data:', error);
        return of([]);
      })
    ).subscribe(() => this.loadingSubject.next(false));
  }

  private transformSeedData(data: any[]): Core[] {
    return data.map((item, index) => {
      const specs: CoreWeightSpec[] = [];

      // Extract specs for each weight (16, 15, 14, 13, 12, 11, 10)
      const weightConfigs = [
        { wt: 'Wt', rg: 'Rg', diff: 'Diff', int: 'Int' },
        { wt: 'Wt.1', rg: 'Rg.1', diff: 'Diff.1', int: 'Int.1' },
        { wt: 'Wt.2', rg: 'Rg.2', diff: 'Diff.2', int: 'Int.2' },
        { wt: 'Wt.3', rg: 'Rg.3', diff: 'Diff.3', int: 'Int.3' },
        { wt: 'Wt.4', rg: 'Rg.4', diff: 'Diff.4', int: 'Int.4' },
        { wt: 'Wt.5', rg: 'Rg.5', diff: 'Diff.5', int: 'Int.5' },
        { wt: 'Wt.6', rg: 'Rg.6', diff: 'Diff.6', int: 'Int.6' }
      ];

      weightConfigs.forEach(config => {
        const weight = item[config.wt];
        if (weight != null) {
          specs.push({
            weight: weight,
            rg: item[config.rg] || 0,
            differential: item[config.diff] || 0,
            intermediate: item[config.int] || 0
          });
        }
      });

      const marketingName = item['Marketing Name'] || '';
      const isSymmetric = marketingName.toLowerCase().includes('symmetric') &&
                         !marketingName.toLowerCase().includes('asymmetric');

      return {
        id: `core-${index + 1}`,
        marketingName,
        coreNumber: item['Core #'] || '',
        weightBlockNumber: item['WB #'] || '',
        line: item['Line'] || '',
        isSymmetric,
        specs
      };
    });
  }

  getAll(): Observable<Core[]> {
    return this.cores$;
  }

  getById(id: string): Observable<Core | undefined> {
    return this.cores$.pipe(
      map(cores => cores.find(c => c.id === id))
    );
  }

  getByName(name: string): Observable<Core | undefined> {
    const lowerName = name.toLowerCase();
    return this.cores$.pipe(
      map(cores => cores.find(c =>
        c.marketingName.toLowerCase().includes(lowerName)
      ))
    );
  }

  search(query: string): Observable<Core[]> {
    const lowerQuery = query.toLowerCase();
    return this.cores$.pipe(
      map(cores => cores.filter(core =>
        core.marketingName.toLowerCase().includes(lowerQuery) ||
        core.line?.toLowerCase().includes(lowerQuery) ||
        String(core.coreNumber).includes(lowerQuery)
      ))
    );
  }

  getByLine(line: string): Observable<Core[]> {
    return this.cores$.pipe(
      map(cores => cores.filter(c => c.line === line))
    );
  }

  getSymmetricCores(): Observable<Core[]> {
    return this.cores$.pipe(
      map(cores => cores.filter(c => c.isSymmetric))
    );
  }

  getAsymmetricCores(): Observable<Core[]> {
    return this.cores$.pipe(
      map(cores => cores.filter(c => !c.isSymmetric))
    );
  }

  create(core: Omit<Core, 'id'>): Observable<Core> {
    const newCore: Core = {
      ...core,
      id: `core-${Date.now()}`
    };

    const currentCores = this.coresSubject.value;
    const updatedCores = [newCore, ...currentCores];

    this.coresSubject.next(updatedCores);
    this.storage.set(this.STORAGE_KEY, updatedCores);

    return of(newCore);
  }

  update(id: string, updates: Partial<Core>): Observable<Core | undefined> {
    const currentCores = this.coresSubject.value;
    const index = currentCores.findIndex(c => c.id === id);

    if (index === -1) {
      return of(undefined);
    }

    const updatedCore: Core = {
      ...currentCores[index],
      ...updates
    };

    const updatedCores = [...currentCores];
    updatedCores[index] = updatedCore;

    this.coresSubject.next(updatedCores);
    this.storage.set(this.STORAGE_KEY, updatedCores);

    return of(updatedCore);
  }

  delete(id: string): Observable<boolean> {
    const currentCores = this.coresSubject.value;
    const updatedCores = currentCores.filter(c => c.id !== id);

    this.coresSubject.next(updatedCores);
    this.storage.set(this.STORAGE_KEY, updatedCores);

    return of(true);
  }

  clearCache(): void {
    this.storage.remove(this.STORAGE_KEY);
    this.coresSubject.next([]);
  }
}
