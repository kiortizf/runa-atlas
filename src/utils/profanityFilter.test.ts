import { describe, it, expect } from 'vitest';
import { checkProfanity, sanitizeText } from './profanityFilter';

// ═══════════════════════════════════════════
// Profanity Filter — Unit Tests
// ═══════════════════════════════════════════

describe('checkProfanity', () => {
  // ── Clean Text ──
  describe('clean text', () => {
    it('returns clean=true for normal text', () => {
      const result = checkProfanity('This is a perfectly normal sentence.');
      expect(result.clean).toBe(true);
      expect(result.flaggedWords).toHaveLength(0);
      expect(result.severity).toBe('none');
    });

    it('returns clean=true for empty string', () => {
      const result = checkProfanity('');
      expect(result.clean).toBe(true);
      expect(result.severity).toBe('none');
    });

    it('does not flag partial word matches', () => {
      // "class" contains "ass" but should NOT be flagged
      const result = checkProfanity('I went to class today');
      expect(result.clean).toBe(true);
    });

    it('does not flag "Scunthorpe problem" words', () => {
      const result = checkProfanity('The assessment was documented properly');
      expect(result.clean).toBe(true);
    });
  });

  // ── Mild Profanity ──
  describe('mild profanity', () => {
    it('detects common profanity', () => {
      const result = checkProfanity('What the fuck is this');
      expect(result.clean).toBe(false);
      expect(result.flaggedWords).toContain('fuck');
      expect(result.severity).toBe('mild');
    });

    it('detects profanity case-insensitively', () => {
      const result = checkProfanity('WHAT THE FUCK');
      expect(result.clean).toBe(false);
      expect(result.flaggedWords).toContain('fuck');
    });

    it('detects multiple profane words', () => {
      const result = checkProfanity('shit and bullshit');
      expect(result.clean).toBe(false);
      expect(result.flaggedWords.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Severe Content ──
  describe('severe content', () => {
    it('classifies slurs as severe', () => {
      const result = checkProfanity('You are a faggot');
      expect(result.clean).toBe(false);
      expect(result.severity).toBe('severe');
    });

    it('classifies self-harm language as severe', () => {
      const result = checkProfanity('just kys already');
      expect(result.clean).toBe(false);
      expect(result.severity).toBe('severe');
      expect(result.flaggedWords).toContain('kys');
    });

    it('severe overrides mild when both present', () => {
      const result = checkProfanity('fuck you nigger');
      expect(result.severity).toBe('severe');
    });
  });

  // ── Leet-Speak Detection ──
  describe('leet-speak normalization', () => {
    it('detects leet-speak substitutions', () => {
      const result = checkProfanity('You are a f@gg0t');
      expect(result.clean).toBe(false);
      expect(result.severity).toBe('severe');
    });

    it('detects dollar-sign substitution', () => {
      const result = checkProfanity('bull$hit');
      expect(result.clean).toBe(false);
    });
  });

  // ── Spam Patterns ──
  describe('spam detection', () => {
    it('catches "buy now" spam', () => {
      const result = checkProfanity('Click here and buy now for free money');
      expect(result.clean).toBe(false);
      expect(result.flaggedWords).toContain('buy now');
    });

    it('catches crypto spam', () => {
      const result = checkProfanity('Invest in crypto and nft today');
      expect(result.clean).toBe(false);
      expect(result.flaggedWords).toContain('crypto');
      expect(result.flaggedWords).toContain('nft');
    });
  });
});

describe('sanitizeText', () => {
  it('replaces profanity with asterisks', () => {
    const result = sanitizeText('What the fuck is this shit');
    expect(result).not.toContain('fuck');
    expect(result).not.toContain('shit');
    expect(result).toContain('****'); // 'fuck' → 4 asterisks
  });

  it('preserves clean text', () => {
    const text = 'This is a lovely book about gardening';
    expect(sanitizeText(text)).toBe(text);
  });

  it('handles case-insensitive replacement', () => {
    const result = sanitizeText('FUCK this');
    expect(result).not.toMatch(/fuck/i);
    expect(result).toContain('****');
  });

  it('leaves empty string unchanged', () => {
    expect(sanitizeText('')).toBe('');
  });
});
