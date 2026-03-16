import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// ═══════════════════════════════════════════
// App — Route Integrity Tests
// ═══════════════════════════════════════════

// Mock heavy dependencies to keep the test fast
vi.mock('./firebase', () => ({
  db: {},
  auth: { currentUser: null, onAuthStateChanged: vi.fn(() => () => {}) },
  storage: {},
  googleProvider: {},
  handleFirestoreError: vi.fn(),
  OperationType: { CREATE: 'create', UPDATE: 'update', DELETE: 'delete', LIST: 'list', GET: 'get', WRITE: 'write' },
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_, cb) => { cb(null); return () => {}; }),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  setPersistence: vi.fn(() => Promise.resolve()),
  browserLocalPersistence: {},
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
}));

/**
 * Route Uniqueness Test
 *
 * Instead of rendering the full App (which requires complex Firebase mocking),
 * we parse the App.tsx source to verify route integrity at the structural level.
 * This catches the most common route bugs: duplicates and typos.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Route Integrity', () => {
  const appSource = readFileSync(resolve(__dirname, 'App.tsx'), 'utf-8');

  // Extract all path="..." values from JSX
  const routePaths = [...appSource.matchAll(/path=["']([^"']+)["']/g)].map(m => m[1]);

  it('has routes defined', () => {
    expect(routePaths.length).toBeGreaterThan(0);
  });

  it('has no duplicate route paths', () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const path of routePaths) {
      if (seen.has(path)) {
        duplicates.push(path);
      }
      seen.add(path);
    }
    expect(duplicates).toEqual([]);
  });

  it('all route paths start with /', () => {
    const invalid = routePaths.filter(p => p !== '*' && !p.startsWith('/'));
    expect(invalid).toEqual([]);
  });

  it('no route paths contain double slashes', () => {
    const bad = routePaths.filter(p => p.includes('//'));
    expect(bad).toEqual([]);
  });

  it('has a wildcard catch-all route', () => {
    expect(routePaths).toContain('*');
  });

  it('has core routes defined', () => {
    const coreRoutes = ['/', '/catalog', '/about', '/contact', '/portal'];
    for (const route of coreRoutes) {
      expect(routePaths).toContain(route);
    }
  });
});
