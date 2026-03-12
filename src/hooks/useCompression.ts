import { useState, useCallback, useMemo } from 'react';

// ── Types ──
export interface CompressionSuggestion {
    id: string;
    chapterId: string;
    chapterTitle: string;
    paragraphIndex: number;
    type: 'redundancy' | 'tightening' | 'scene-level';
    originalText: string;
    suggestedText?: string;
    reason: string;
    impactScore: {
        plot: number;        // 1-10
        character: number;
        worldbuilding: number;
        emotion: number;
        pacing: number;
        overall: number;
    };
    wordsSaved: number;
    status: 'pending' | 'accepted' | 'rejected' | 'modified';
}

// ── Filter-word / weak-prose detection ──
const FILTER_WORDS = ['just', 'really', 'very', 'quite', 'rather', 'somewhat', 'basically', 'actually', 'literally', 'totally', 'completely', 'absolutely', 'definitely', 'certainly', 'simply', 'practically'];
const WEAK_OPENINGS = ['there was', 'there were', 'there is', 'there are', 'it was', 'it is', 'it seemed'];
const ADVERB_SUFFIX = /ly\b/gi;

// ── Similarity (Jaccard on 4+ char words) ──
function jaccardSimilarity(a: string, b: string): number {
    const setA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 4));
    const setB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 4));
    if (setA.size === 0 || setB.size === 0) return 0;
    const intersection = [...setA].filter(w => setB.has(w));
    return intersection.length / Math.max(setA.size, setB.size);
}

// ── Analysis functions ──
function detectRedundancies(
    chapters: { id: string; title: string; plainText: string }[]
): CompressionSuggestion[] {
    const suggestions: CompressionSuggestion[] = [];
    const allParagraphs: { chId: string; chTitle: string; idx: number; text: string }[] = [];

    // Flatten all paragraphs
    for (const ch of chapters) {
        const paras = (ch.plainText || '').split(/\n\n+/).filter(p => p.trim().length > 30);
        paras.forEach((p, i) => allParagraphs.push({ chId: ch.id, chTitle: ch.title, idx: i, text: p.trim() }));
    }

    // Compare every paragraph against all previous ones
    for (let i = 1; i < allParagraphs.length; i++) {
        for (let j = Math.max(0, i - 50); j < i; j++) {
            const sim = jaccardSimilarity(allParagraphs[i].text, allParagraphs[j].text);
            if (sim > 0.35) {
                suggestions.push({
                    id: `red-${i}-${j}`,
                    chapterId: allParagraphs[i].chId,
                    chapterTitle: allParagraphs[i].chTitle,
                    paragraphIndex: allParagraphs[i].idx,
                    type: 'redundancy',
                    originalText: allParagraphs[i].text,
                    reason: `~${Math.round(sim * 100)}% similarity with an earlier passage in "${allParagraphs[j].chTitle}". The reader already received this information.`,
                    impactScore: {
                        plot: 2,
                        character: 2,
                        worldbuilding: 3,
                        emotion: 2,
                        pacing: 7,
                        overall: Math.round(2 + sim * 5),
                    },
                    wordsSaved: allParagraphs[i].text.split(/\s+/).length,
                    status: 'pending',
                });
                break; // One match per paragraph is enough
            }
        }
    }

    return suggestions;
}

function detectTighteningOpportunities(
    chapters: { id: string; title: string; plainText: string }[]
): CompressionSuggestion[] {
    const suggestions: CompressionSuggestion[] = [];

    for (const ch of chapters) {
        const paras = (ch.plainText || '').split(/\n\n+/).filter(p => p.trim().length > 30);

        for (let i = 0; i < paras.length; i++) {
            const text = paras[i].trim();
            const words = text.split(/\s+/);
            const wordCount = words.length;

            // Filter words
            const filterCount = words.filter(w => FILTER_WORDS.includes(w.toLowerCase())).length;
            const filterRatio = filterCount / wordCount;

            // Adverbs
            const adverbCount = (text.match(ADVERB_SUFFIX) || []).length;
            const adverbRatio = adverbCount / wordCount;

            // Weak openings
            const hasWeakOpening = WEAK_OPENINGS.some(wo => text.toLowerCase().startsWith(wo));

            // Passive voice (simple heuristic: "was/were + past participle")
            const passiveCount = (text.match(/\b(was|were|been|being)\s+\w+ed\b/gi) || []).length;

            // Score problems
            const problems: string[] = [];
            if (filterRatio > 0.04) problems.push(`${filterCount} filter words (${FILTER_WORDS.filter(fw => text.toLowerCase().includes(fw)).slice(0, 3).join(', ')})`);
            if (adverbRatio > 0.06) problems.push(`${adverbCount} adverbs — consider stronger verbs`);
            if (hasWeakOpening) problems.push('Weak opening ("There was…" / "It was…")');
            if (passiveCount > 2) problems.push(`${passiveCount} passive constructions`);

            if (problems.length >= 2 && wordCount > 40) {
                const potentialSavings = Math.round(wordCount * 0.15);
                suggestions.push({
                    id: `tight-${ch.id}-${i}`,
                    chapterId: ch.id,
                    chapterTitle: ch.title,
                    paragraphIndex: i,
                    type: 'tightening',
                    originalText: text,
                    reason: `This passage could be tightened: ${problems.join('; ')}.`,
                    impactScore: {
                        plot: 1,
                        character: 1,
                        worldbuilding: 1,
                        emotion: 2,
                        pacing: 6,
                        overall: 3,
                    },
                    wordsSaved: potentialSavings,
                    status: 'pending',
                });
            }
        }
    }

    return suggestions;
}

function detectSceneLevelIssues(
    chapters: { id: string; title: string; plainText: string }[]
): CompressionSuggestion[] {
    const suggestions: CompressionSuggestion[] = [];

    for (const ch of chapters) {
        const text = ch.plainText || '';
        const wordCount = text.split(/\s+/).filter(Boolean).length;

        // Very short chapters that might not pull their weight
        if (wordCount < 300 && wordCount > 50) {
            suggestions.push({
                id: `scene-short-${ch.id}`,
                chapterId: ch.id,
                chapterTitle: ch.title,
                paragraphIndex: 0,
                type: 'scene-level',
                originalText: text.substring(0, 200) + '...',
                reason: `This chapter is only ${wordCount} words. Consider whether its content could be merged into an adjacent chapter for better flow.`,
                impactScore: { plot: 3, character: 2, worldbuilding: 2, emotion: 3, pacing: 5, overall: 3 },
                wordsSaved: 0,
                status: 'pending',
            });
        }

        // Very long chapters
        if (wordCount > 8000) {
            suggestions.push({
                id: `scene-long-${ch.id}`,
                chapterId: ch.id,
                chapterTitle: ch.title,
                paragraphIndex: 0,
                type: 'scene-level',
                originalText: text.substring(0, 200) + '...',
                reason: `This chapter is ${wordCount.toLocaleString()} words. Consider splitting at a natural tension point for better pacing.`,
                impactScore: { plot: 2, character: 2, worldbuilding: 2, emotion: 4, pacing: 7, overall: 4 },
                wordsSaved: 0,
                status: 'pending',
            });
        }
    }

    return suggestions;
}

// ── Main Hook ──
export function useCompression() {
    const [suggestions, setSuggestions] = useState<CompressionSuggestion[]>([]);
    const [analyzing, setAnalyzing] = useState(false);

    const analyze = useCallback((chapters: { id: string; title: string; plainText: string }[]) => {
        setAnalyzing(true);

        // Run all three detectors
        const redundancies = detectRedundancies(chapters);
        const tightening = detectTighteningOpportunities(chapters);
        const sceneIssues = detectSceneLevelIssues(chapters);

        const all = [...redundancies, ...tightening, ...sceneIssues];
        // Sort by overall impact score descending
        all.sort((a, b) => b.impactScore.overall - a.impactScore.overall);
        setSuggestions(all);
        setAnalyzing(false);
    }, []);

    const updateStatus = useCallback((id: string, status: CompressionSuggestion['status']) => {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    }, []);

    const stats = useMemo(() => {
        const pending = suggestions.filter(s => s.status === 'pending');
        const totalWordsSaveable = pending.reduce((sum, s) => sum + s.wordsSaved, 0);
        const byType = {
            redundancy: suggestions.filter(s => s.type === 'redundancy').length,
            tightening: suggestions.filter(s => s.type === 'tightening').length,
            sceneLevel: suggestions.filter(s => s.type === 'scene-level').length,
        };
        return { total: suggestions.length, pending: pending.length, totalWordsSaveable, byType };
    }, [suggestions]);

    return { suggestions, analyzing, analyze, updateStatus, stats };
}
