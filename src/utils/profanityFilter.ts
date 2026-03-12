// ═══════════════════════════════════════════
// Profanity Filter — Client-Side Word List
// ═══════════════════════════════════════════
// Lightweight profanity check. NOT exhaustive — meant to catch obvious violations.
// For production, pair with a server-side moderation API.

const PROFANITY_LIST = new Set([
  // Slurs and hate speech (abbreviated patterns)
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded',
  'tranny', 'chink', 'spic', 'wetback', 'kike',
  // Common profanity
  'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker',
  'shit', 'shitty', 'bullshit', 'horseshit',
  'asshole', 'bitch', 'bastard', 'damn', 'dickhead',
  'cunt', 'cock', 'dick', 'pussy', 'whore', 'slut',
  // Threats / violence
  'kill yourself', 'kys', 'die', 'rape',
  // Spam patterns
  'buy now', 'click here', 'free money', 'crypto', 'nft',
]);

// Patterns that should be caught even with l33tspeak substitutions
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
  '7': 't', '@': 'a', '$': 's', '!': 'i',
};

function normalizeLeet(text: string): string {
  return text.split('').map(ch => LEET_MAP[ch] || ch).join('');
}

export interface ProfanityResult {
  clean: boolean;
  flaggedWords: string[];
  severity: 'none' | 'mild' | 'severe';
}

const SEVERE_WORDS = new Set([
  'nigger', 'nigga', 'faggot', 'tranny', 'chink', 'spic',
  'wetback', 'kike', 'kill yourself', 'kys', 'rape',
]);

export function checkProfanity(text: string): ProfanityResult {
  const normalized = normalizeLeet(text.toLowerCase());
  // Remove extra spaces and special chars for matching
  const cleaned = normalized.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
  const flaggedWords: string[] = [];
  let severity: ProfanityResult['severity'] = 'none';

  for (const word of PROFANITY_LIST) {
    // Check both exact word boundaries and within the cleaned text
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(cleaned) || regex.test(normalized)) {
      flaggedWords.push(word);
      if (SEVERE_WORDS.has(word)) {
        severity = 'severe';
      } else if (severity !== 'severe') {
        severity = 'mild';
      }
    }
  }

  return {
    clean: flaggedWords.length === 0,
    flaggedWords,
    severity,
  };
}

/**
 * Sanitize text by replacing profanity with asterisks.
 * Used for display purposes when content has already been posted.
 */
export function sanitizeText(text: string): string {
  let result = text;
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, '*'.repeat(word.length));
  }
  return result;
}
