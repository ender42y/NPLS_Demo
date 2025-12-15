import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, map, tap } from 'rxjs';
import { Ball, BallListItem } from '../models/ball.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class BallService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private readonly STORAGE_KEY = 'balls';
  private readonly API_URL = '/api/balls'; // Will be replaced with actual API

  private ballsSubject = new BehaviorSubject<Ball[]>([]);
  balls$ = this.ballsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Try to load from localStorage first
    const cachedBalls = this.storage.get<Ball[]>(this.STORAGE_KEY);
    if (cachedBalls && cachedBalls.length > 0) {
      this.ballsSubject.next(cachedBalls);
    } else {
      // Load seed data from assets
      this.loadSeedData();
    }
  }

  private loadSeedData(): void {
    this.loadingSubject.next(true);
    this.http.get<any[]>('assets/balls-seed.json').pipe(
      map(data => this.transformSeedData(data)),
      tap(balls => {
        this.storage.set(this.STORAGE_KEY, balls);
        this.ballsSubject.next(balls);
      }),
      catchError(error => {
        console.error('Error loading seed data:', error);
        return of([]);
      })
    ).subscribe(() => this.loadingSubject.next(false));
  }

  private transformSeedData(data: any[]): Ball[] {
    return data.map((item, index) => ({
      id: `ball-${index + 1}`,
      ballName: item['Ball Name'] || '',
      brand: item['Brand'] || '',
      releaseType: item['998       Release'] || 'OEM',
      releaseDate: item['Approx. Date'],
      coverstock: item['Coverstock'] || '',
      coverstockType: item['Type'] || '',
      finish: item['Finish'] || '',
      core: item['Core'] || '',
      marketingColorName: item['MKT Color Name'] || '',
      colors: this.extractColors(item),
      fragrance: item['Fragrance'],
      createdAt: new Date().toISOString()
    }));
  }

  private extractColors(item: any): { colorNumber: number; color: string; shade?: string }[] {
    const colors: { colorNumber: number; color: string; shade?: string }[] = [];

    if (item['Color 1']) {
      colors.push({ colorNumber: 1, color: item['Color 1'], shade: item['Shade 1'] });
    }
    if (item['Color 2']) {
      colors.push({ colorNumber: 2, color: item['Color 2'], shade: item['Shade 2'] });
    }
    if (item['Color 3']) {
      colors.push({ colorNumber: 3, color: item['Color 3'], shade: item['Shade 3'] });
    }

    return colors;
  }

  getAll(): Observable<Ball[]> {
    return this.balls$;
  }

  getById(id: string): Observable<Ball | undefined> {
    return this.balls$.pipe(
      map(balls => balls.find(b => b.id === id))
    );
  }

  search(query: string): Observable<Ball[]> {
    const lowerQuery = query.toLowerCase();
    return this.balls$.pipe(
      map(balls => balls.filter(ball =>
        ball.ballName.toLowerCase().includes(lowerQuery) ||
        ball.brand.toLowerCase().includes(lowerQuery) ||
        ball.coverstock?.toLowerCase().includes(lowerQuery) ||
        ball.core?.toLowerCase().includes(lowerQuery)
      ))
    );
  }

  filterByBrand(brand: string): Observable<Ball[]> {
    return this.balls$.pipe(
      map(balls => balls.filter(ball => ball.brand === brand))
    );
  }

  create(ball: Omit<Ball, 'id'>): Observable<Ball> {
    const newBall: Ball = {
      ...ball,
      id: `ball-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const currentBalls = this.ballsSubject.value;
    const updatedBalls = [newBall, ...currentBalls];

    this.ballsSubject.next(updatedBalls);
    this.storage.set(this.STORAGE_KEY, updatedBalls);

    // TODO: When API is ready, sync with backend
    // return this.http.post<Ball>(this.API_URL, newBall);

    return of(newBall);
  }

  update(id: string, updates: Partial<Ball>): Observable<Ball | undefined> {
    const currentBalls = this.ballsSubject.value;
    const index = currentBalls.findIndex(b => b.id === id);

    if (index === -1) {
      return of(undefined);
    }

    const updatedBall: Ball = {
      ...currentBalls[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const updatedBalls = [...currentBalls];
    updatedBalls[index] = updatedBall;

    this.ballsSubject.next(updatedBalls);
    this.storage.set(this.STORAGE_KEY, updatedBalls);

    // TODO: When API is ready, sync with backend
    // return this.http.put<Ball>(`${this.API_URL}/${id}`, updatedBall);

    return of(updatedBall);
  }

  delete(id: string): Observable<boolean> {
    const currentBalls = this.ballsSubject.value;
    const updatedBalls = currentBalls.filter(b => b.id !== id);

    this.ballsSubject.next(updatedBalls);
    this.storage.set(this.STORAGE_KEY, updatedBalls);

    // TODO: When API is ready, sync with backend
    // return this.http.delete(`${this.API_URL}/${id}`);

    return of(true);
  }

  duplicate(id: string): Observable<Ball | undefined> {
    const ball = this.ballsSubject.value.find(b => b.id === id);

    if (!ball) {
      return of(undefined);
    }

    const { id: _, createdAt, updatedAt, ...ballData } = ball;
    return this.create({
      ...ballData,
      ballName: `${ball.ballName} (Copy)`
    });
  }

  refreshFromApi(): Observable<Ball[]> {
    this.loadingSubject.next(true);

    // TODO: When API is ready, fetch from backend
    // return this.http.get<Ball[]>(this.API_URL).pipe(
    //   tap(balls => {
    //     this.storage.set(this.STORAGE_KEY, balls);
    //     this.ballsSubject.next(balls);
    //   }),
    //   finalize(() => this.loadingSubject.next(false))
    // );

    // For now, reload from seed data
    this.loadSeedData();
    return this.balls$;
  }

  clearCache(): void {
    this.storage.remove(this.STORAGE_KEY);
    this.ballsSubject.next([]);
  }

  getStats(): Observable<{ total: number; byBrand: Record<string, number>; byType: Record<string, number> }> {
    return this.balls$.pipe(
      map(balls => {
        const byBrand: Record<string, number> = {};
        const byType: Record<string, number> = {};

        balls.forEach(ball => {
          byBrand[ball.brand] = (byBrand[ball.brand] || 0) + 1;
          if (ball.coverstockType) {
            byType[ball.coverstockType] = (byType[ball.coverstockType] || 0) + 1;
          }
        });

        return { total: balls.length, byBrand, byType };
      })
    );
  }
}
