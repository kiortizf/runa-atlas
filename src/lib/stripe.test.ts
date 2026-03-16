import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatCurrency } from './stripe';

// ═══════════════════════════════════════════
// Stripe Utilities — Unit Tests
// ═══════════════════════════════════════════

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(12.99)).toBe('$12.99');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large amounts with comma separators', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('rounds to 2 decimal places', () => {
    const result = formatCurrency(9.999);
    expect(result).toBe('$10.00');
  });

  it('handles negative values', () => {
    const result = formatCurrency(-5.50);
    expect(result).toContain('5.50');
  });

  it('supports EUR currency', () => {
    const result = formatCurrency(29.99, 'EUR');
    // Intl formats vary by locale, but should contain the amount
    expect(result).toContain('29.99');
  });

  it('supports GBP currency', () => {
    const result = formatCurrency(15.00, 'GBP');
    expect(result).toContain('15.00');
  });
});

// ═══════════════════════════════════════════
// calculateOrderTotal — Tests with Firestore mock
// ═══════════════════════════════════════════
// We mock Firestore's getDoc to test discount logic
// without needing a real database connection.

// Mock Firebase modules
vi.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: null },
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}));

import { getDoc } from 'firebase/firestore';
import { calculateOrderTotal, type CartItem } from './stripe';

const mockGetDoc = vi.mocked(getDoc);

const SAMPLE_ITEMS: CartItem[] = [
  { id: '1', title: 'Book A', author: 'Author A', price: 15.00, cover: '', quantity: 1, format: 'ebook' },
  { id: '2', title: 'Book B', author: 'Author B', price: 25.00, cover: '', quantity: 2, format: 'paperback' },
];

describe('calculateOrderTotal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calculates correct subtotal from items', async () => {
    const result = await calculateOrderTotal(SAMPLE_ITEMS);
    // 15*1 + 25*2 = 65
    expect(result.subtotal).toBe(65.00);
  });

  it('applies 8% tax correctly', async () => {
    const result = await calculateOrderTotal(SAMPLE_ITEMS);
    // Tax = 65 * 0.08 = 5.20
    expect(result.tax).toBe(5.20);
  });

  it('calculates correct total (subtotal + tax)', async () => {
    const result = await calculateOrderTotal(SAMPLE_ITEMS);
    // Total = 65 + 5.20 = 70.20
    expect(result.total).toBe(70.20);
  });

  it('returns zero discount when no code provided', async () => {
    const result = await calculateOrderTotal(SAMPLE_ITEMS);
    expect(result.discountAmount).toBe(0);
  });

  it('handles empty cart', async () => {
    const result = await calculateOrderTotal([]);
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });

  it('applies percentage discount correctly', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ active: true, type: 'percentage', value: 10 }),
    } as any);

    const result = await calculateOrderTotal(SAMPLE_ITEMS, 'SAVE10');
    // Subtotal: 65, Discount: 6.50, Discounted: 58.50
    // Tax: 58.50 * 0.08 = 4.68, Total: 63.18
    expect(result.discountAmount).toBe(6.50);
    expect(result.tax).toBe(4.68);
    expect(result.total).toBe(63.18);
  });

  it('applies fixed discount correctly', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ active: true, type: 'fixed', value: 10 }),
    } as any);

    const result = await calculateOrderTotal(SAMPLE_ITEMS, 'FLAT10');
    // Subtotal: 65, Discount: 10, Discounted: 55
    // Tax: 55 * 0.08 = 4.40, Total: 59.40
    expect(result.discountAmount).toBe(10);
    expect(result.tax).toBe(4.40);
    expect(result.total).toBe(59.40);
  });

  it('caps fixed discount at subtotal', async () => {
    const cheapItem: CartItem[] = [
      { id: '1', title: 'Book', author: 'Author', price: 5.00, cover: '', quantity: 1, format: 'ebook' },
    ];
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ active: true, type: 'fixed', value: 100 }),
    } as any);

    const result = await calculateOrderTotal(cheapItem, 'BIG');
    // Fixed $100 discount on $5 item → capped at $5
    expect(result.discountAmount).toBe(5.00);
    expect(result.total).toBe(0);
  });

  it('ignores inactive discount codes', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ active: false, type: 'percentage', value: 50 }),
    } as any);

    const result = await calculateOrderTotal(SAMPLE_ITEMS, 'INACTIVE');
    expect(result.discountAmount).toBe(0);
  });

  it('ignores non-existent discount codes', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => false,
      data: () => null,
    } as any);

    const result = await calculateOrderTotal(SAMPLE_ITEMS, 'FAKECODE');
    expect(result.discountAmount).toBe(0);
  });

  it('handles Firestore error gracefully', async () => {
    mockGetDoc.mockRejectedValueOnce(new Error('Network error'));

    const result = await calculateOrderTotal(SAMPLE_ITEMS, 'ERROR');
    // Should fall through to no-discount path
    expect(result.discountAmount).toBe(0);
    expect(result.subtotal).toBe(65.00);
  });
});
