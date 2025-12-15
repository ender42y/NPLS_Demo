import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly prefix = 'npls_';

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    keys.forEach(k => localStorage.removeItem(k));
  }

  exists(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  getWithExpiry<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const { value, expiry } = JSON.parse(item);
      if (expiry && Date.now() > expiry) {
        this.remove(key);
        return null;
      }
      return value as T;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  }

  setWithExpiry<T>(key: string, value: T, ttlMs: number): void {
    try {
      const item = {
        value,
        expiry: Date.now() + ttlMs
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  }
}
