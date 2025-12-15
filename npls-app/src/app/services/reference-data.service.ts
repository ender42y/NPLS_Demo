import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, tap } from 'rxjs';
import { ReferenceData } from '../models/reference-data.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private readonly STORAGE_KEY = 'reference_data';
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private referenceDataSubject = new BehaviorSubject<ReferenceData | null>(null);
  referenceData$ = this.referenceDataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    // Check cache first
    const cached = this.storage.getWithExpiry<ReferenceData>(this.STORAGE_KEY);
    if (cached) {
      this.referenceDataSubject.next(cached);
      return;
    }

    this.loadFromAssets();
  }

  private loadFromAssets(): void {
    this.loadingSubject.next(true);
    this.http.get<ReferenceData>('assets/reference-data.json').pipe(
      tap(data => {
        this.storage.setWithExpiry(this.STORAGE_KEY, data, this.CACHE_TTL);
        this.referenceDataSubject.next(data);
      }),
      catchError(error => {
        console.error('Error loading reference data:', error);
        return of(this.getDefaultReferenceData());
      })
    ).subscribe(() => this.loadingSubject.next(false));
  }

  private getDefaultReferenceData(): ReferenceData {
    return {
      coverstocks: [],
      finishes: [],
      weightBlocks: [],
      brands: ['Storm', 'Roto Grip', '900 Global'],
      lines: ['Premier', 'Prime', 'Hot'],
      coverstockTypes: ['Pearl Reactive', 'Solid Reactive', 'Hybrid Reactive']
    };
  }

  getReferenceData(): Observable<ReferenceData | null> {
    return this.referenceData$;
  }

  getCoverstocks(): Observable<string[]> {
    return new Observable(observer => {
      this.referenceData$.subscribe(data => {
        observer.next(data?.coverstocks || []);
      });
    });
  }

  getFinishes(): Observable<string[]> {
    return new Observable(observer => {
      this.referenceData$.subscribe(data => {
        observer.next(data?.finishes || []);
      });
    });
  }

  getWeightBlocks(): Observable<string[]> {
    return new Observable(observer => {
      this.referenceData$.subscribe(data => {
        observer.next(data?.weightBlocks || []);
      });
    });
  }

  getBrands(): Observable<string[]> {
    return new Observable(observer => {
      this.referenceData$.subscribe(data => {
        observer.next(data?.brands || []);
      });
    });
  }

  getLines(): Observable<string[]> {
    return new Observable(observer => {
      this.referenceData$.subscribe(data => {
        observer.next(data?.lines || []);
      });
    });
  }

  getCoverstockTypes(): Observable<string[]> {
    return new Observable(observer => {
      this.referenceData$.subscribe(data => {
        observer.next(data?.coverstockTypes || []);
      });
    });
  }

  addCoverstock(coverstock: string): void {
    const current = this.referenceDataSubject.value;
    if (current && !current.coverstocks.includes(coverstock)) {
      const updated = {
        ...current,
        coverstocks: [...current.coverstocks, coverstock]
      };
      this.updateAndSave(updated);
    }
  }

  addFinish(finish: string): void {
    const current = this.referenceDataSubject.value;
    if (current && !current.finishes.includes(finish)) {
      const updated = {
        ...current,
        finishes: [...current.finishes, finish]
      };
      this.updateAndSave(updated);
    }
  }

  addWeightBlock(weightBlock: string): void {
    const current = this.referenceDataSubject.value;
    if (current && !current.weightBlocks.includes(weightBlock)) {
      const updated = {
        ...current,
        weightBlocks: [...current.weightBlocks, weightBlock]
      };
      this.updateAndSave(updated);
    }
  }

  private updateAndSave(data: ReferenceData): void {
    this.referenceDataSubject.next(data);
    this.storage.setWithExpiry(this.STORAGE_KEY, data, this.CACHE_TTL);
  }

  refreshFromApi(): Observable<ReferenceData | null> {
    this.storage.remove(this.STORAGE_KEY);
    this.loadFromAssets();
    return this.referenceData$;
  }

  clearCache(): void {
    this.storage.remove(this.STORAGE_KEY);
    this.referenceDataSubject.next(null);
  }
}
