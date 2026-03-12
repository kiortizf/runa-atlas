import { useState, useCallback, useMemo } from 'react';
import { doc, setDoc, onSnapshot, Timestamp, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect } from 'react';

// ── Narrative Function Tag Definitions ──
export const NARRATIVE_TAGS = [
    { id: 'foreshadowing', label: '🔮 Foreshadowing', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', description: 'Sets up a future payoff or reveal' },
    { id: 'subplot', label: '🧵 Subplot', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', description: 'Advances a secondary storyline' },
    { id: 'character-arc', label: '👤 Character Arc', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)', description: 'Develops a character\'s internal journey' },
    { id: 'easter-egg', label: '🥚 Easter Egg', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', description: 'Callback or hidden reference' },
    { id: 'worldbuilding', label: '🌍 Worldbuilding', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', description: 'Establishes setting, lore, or rules' },
    { id: 'plot-driver', label: '⚡ Plot Driver', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', description: 'Moves the main plot forward' },
    { id: 'tone', label: '🎭 Tone', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', description: 'Sets mood or atmosphere' },
    { id: 'exposition', label: '📝 Exposition', color: '#f97316', bg: 'rgba(249,115,22,0.15)', description: 'Delivers information to the reader' },
    { id: 'dialogue', label: '💬 Dialogue', color: '#ec4899', bg: 'rgba(236,72,153,0.15)', description: 'Character voice and conversation' },
    { id: 'redundant', label: '🔁 Redundant', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', description: 'Restates something already established' },
] as const;

export type NarrativeTagId = typeof NARRATIVE_TAGS[number]['id'];

export interface DependencyChain {
    sourceChapter: string;
    sourceParagraph: number;
    targetChapter: string;
    targetParagraph: number;
    type: 'foreshadowing' | 'setup-payoff' | 'callback' | 'arc-continuation';
    description: string;
}

export interface AnalyzedParagraph {
    index: number;
    text: string;
    tags: NarrativeTagId[];
    confidence: number;
    wordCount: number;
    dependencies: DependencyChain[];
}

export interface ChapterAnalysis {
    chapterId: string;
    paragraphs: AnalyzedParagraph[];
    analyzedAt: Date;
    stats: {
        totalParagraphs: number;
        tagDistribution: Record<string, number>;
        narrativeDensity: number; // 0-1
        redundancyScore: number;  // 0-1
    };
}

// ── Keyword-based heuristic analysis ──
const FORESHADOWING_KEYWORDS = ['would later', 'little did', 'someday', 'one day', 'foresee', 'omen', 'portent', 'prophecy', 'premonition', 'hint', 'warning', 'foretold', 'destiny', 'fate', 'inevitable'];
const WORLDBUILDING_KEYWORDS = ['the land of', 'ancient', 'tradition', 'kingdom', 'realm', 'magic', 'spell', 'enchant', 'ritual', 'custom', 'legend', 'mythology', 'the world', 'civilization', 'empire', 'history of'];
const CHARACTER_ARC_KEYWORDS = ['realized', 'understood', 'changed', 'grew', 'learned', 'transformed', 'overcame', 'forgave', 'accepted', 'inner', 'struggle', 'journey', 'growth', 'reflection', 'self-', 'becoming'];
const PLOT_DRIVER_KEYWORDS = ['suddenly', 'attack', 'discovered', 'revealed', 'betrayed', 'escaped', 'captured', 'died', 'battle', 'confronted', 'decision', 'chose', 'declared', 'war', 'rescue'];
const TONE_KEYWORDS = ['silence', 'shadow', 'light', 'darkness', 'mist', 'echo', 'whisper', 'atmosphere', 'the air', 'tension', 'calm', 'storm', 'peaceful', 'eerie', 'haunting'];

function countKeywordMatches(text: string, keywords: string[]): number {
    const lower = text.toLowerCase();
    return keywords.reduce((count, kw) => count + (lower.includes(kw) ? 1 : 0), 0);
}

function analyzeParagraph(text: string, index: number, allParagraphs: string[]): AnalyzedParagraph {
    const trimmed = text.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    const tags: NarrativeTagId[] = [];
    let confidence = 0.5;

    // Dialogue detection
    const dialogueRatio = (trimmed.match(/["'"]/g) || []).length / Math.max(1, trimmed.length);
    if (dialogueRatio > 0.02 || /^["'"]/.test(trimmed)) {
        tags.push('dialogue');
        confidence += 0.1;
    }

    // Keyword-based classification
    const foreshadowScore = countKeywordMatches(trimmed, FORESHADOWING_KEYWORDS);
    const worldbuildScore = countKeywordMatches(trimmed, WORLDBUILDING_KEYWORDS);
    const charArcScore = countKeywordMatches(trimmed, CHARACTER_ARC_KEYWORDS);
    const plotScore = countKeywordMatches(trimmed, PLOT_DRIVER_KEYWORDS);
    const toneScore = countKeywordMatches(trimmed, TONE_KEYWORDS);

    const scores: [NarrativeTagId, number][] = [
        ['foreshadowing', foreshadowScore],
        ['worldbuilding', worldbuildScore],
        ['character-arc', charArcScore],
        ['plot-driver', plotScore],
        ['tone', toneScore],
    ];

    // Sort by score descending
    scores.sort((a, b) => b[1] - a[1]);

    // Tag with top matches (score > 0)
    for (const [tag, score] of scores) {
        if (score > 0 && tags.length < 3) {
            tags.push(tag);
            confidence += score * 0.05;
        }
    }

    // Exposition detection: long paragraphs with few dialogue markers and info-dense content
    if (wordCount > 80 && dialogueRatio < 0.01 && !tags.includes('plot-driver')) {
        tags.push('exposition');
    }

    // Redundancy detection: check similarity with earlier paragraphs
    if (index > 0) {
        const words = new Set(trimmed.toLowerCase().split(/\s+/));
        for (let i = Math.max(0, index - 20); i < index; i++) {
            const prevWords = new Set(allParagraphs[i].toLowerCase().split(/\s+/));
            const intersection = [...words].filter(w => prevWords.has(w) && w.length > 4);
            const similarity = intersection.length / Math.max(words.size, prevWords.size);
            if (similarity > 0.4) {
                tags.push('redundant');
                confidence += 0.15;
                break;
            }
        }
    }

    // If nothing matched, classify as tone/atmosphere
    if (tags.length === 0) {
        tags.push('tone');
        confidence = 0.3;
    }

    return {
        index,
        text: trimmed,
        tags: [...new Set(tags)],
        confidence: Math.min(1, confidence),
        wordCount,
        dependencies: [],
    };
}

function detectDependencies(chapters: { id: string; paragraphs: AnalyzedParagraph[] }[]): DependencyChain[] {
    const chains: DependencyChain[] = [];

    // Find foreshadowing → payoff connections across chapters
    for (let ci = 0; ci < chapters.length; ci++) {
        for (const para of chapters[ci].paragraphs) {
            if (para.tags.includes('foreshadowing')) {
                // Look for related plot-driver or character-arc in later chapters
                const keyWords = para.text.toLowerCase().split(/\s+/).filter(w => w.length > 5);
                for (let cj = ci + 1; cj < chapters.length; cj++) {
                    for (const targetPara of chapters[cj].paragraphs) {
                        if (targetPara.tags.includes('plot-driver') || targetPara.tags.includes('character-arc')) {
                            const targetWords = new Set(targetPara.text.toLowerCase().split(/\s+/));
                            const overlap = keyWords.filter(w => targetWords.has(w));
                            if (overlap.length >= 3) {
                                chains.push({
                                    sourceChapter: chapters[ci].id,
                                    sourceParagraph: para.index,
                                    targetChapter: chapters[cj].id,
                                    targetParagraph: targetPara.index,
                                    type: 'foreshadowing',
                                    description: `Foreshadowing connects to payoff via shared elements: ${overlap.slice(0, 3).join(', ')}`,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    return chains;
}

// ── Main Hook ──
export function useNarrativeAnalysis(manuscriptId?: string) {
    const [analyses, setAnalyses] = useState<Record<string, ChapterAnalysis>>({});
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Load saved analyses from Firestore
    useEffect(() => {
        if (!manuscriptId) return;
        const unsub = onSnapshot(
            collection(db, 'manuscripts', manuscriptId, 'analysis'),
            (snap) => {
                const data: Record<string, ChapterAnalysis> = {};
                snap.docs.forEach(d => {
                    const raw = d.data();
                    data[d.id] = {
                        ...raw,
                        analyzedAt: raw.analyzedAt?.toDate?.() || new Date(),
                    } as ChapterAnalysis;
                });
                setAnalyses(data);
            },
            () => {}
        );
        return () => unsub();
    }, [manuscriptId]);

    // Run analysis on all chapters
    const analyzeChapters = useCallback(async (
        chapters: { id: string; title: string; content: string; plainText: string }[]
    ) => {
        if (!manuscriptId || chapters.length === 0) return;
        setAnalyzing(true);
        setProgress(0);

        const allChapterAnalyses: { id: string; paragraphs: AnalyzedParagraph[] }[] = [];

        for (let i = 0; i < chapters.length; i++) {
            const ch = chapters[i];
            const paragraphs = (ch.plainText || '').split(/\n\n+/).filter(p => p.trim().length > 20);
            const analyzed = paragraphs.map((p, idx) => analyzeParagraph(p, idx, paragraphs));

            const tagDist: Record<string, number> = {};
            analyzed.forEach(p => p.tags.forEach(t => { tagDist[t] = (tagDist[t] || 0) + 1; }));
            const redundantCount = tagDist['redundant'] || 0;

            const analysis: ChapterAnalysis = {
                chapterId: ch.id,
                paragraphs: analyzed,
                analyzedAt: new Date(),
                stats: {
                    totalParagraphs: analyzed.length,
                    tagDistribution: tagDist,
                    narrativeDensity: analyzed.filter(p => p.tags.some(t => ['plot-driver', 'character-arc', 'subplot'].includes(t))).length / Math.max(1, analyzed.length),
                    redundancyScore: redundantCount / Math.max(1, analyzed.length),
                },
            };

            allChapterAnalyses.push({ id: ch.id, paragraphs: analyzed });

            // Save to Firestore
            try {
                await setDoc(doc(db, 'manuscripts', manuscriptId, 'analysis', ch.id), {
                    ...analysis,
                    analyzedAt: Timestamp.now(),
                });
            } catch (e) {
                console.error('Failed to save analysis:', e);
            }

            setProgress(Math.round(((i + 1) / chapters.length) * 100));
        }

        // Detect cross-chapter dependencies
        const deps = detectDependencies(allChapterAnalyses);
        // Attach dependencies to source paragraphs
        for (const dep of deps) {
            const chAnalysis = allChapterAnalyses.find(c => c.id === dep.sourceChapter);
            if (chAnalysis) {
                const para = chAnalysis.paragraphs.find(p => p.index === dep.sourceParagraph);
                if (para) para.dependencies.push(dep);
            }
        }

        setAnalyzing(false);
        setProgress(100);
    }, [manuscriptId]);

    // Get analysis for a specific chapter
    const getChapterAnalysis = useCallback((chapterId: string): ChapterAnalysis | null => {
        return analyses[chapterId] || null;
    }, [analyses]);

    // Aggregate stats across all chapters
    const overallStats = useMemo(() => {
        const allAnalyses = Object.values(analyses);
        if (allAnalyses.length === 0) return null;

        const totalParagraphs = allAnalyses.reduce((sum, a) => sum + a.stats.totalParagraphs, 0);
        const tagDist: Record<string, number> = {};
        allAnalyses.forEach(a => {
            Object.entries(a.stats.tagDistribution).forEach(([tag, count]) => {
                tagDist[tag] = (tagDist[tag] || 0) + count;
            });
        });
        const avgDensity = allAnalyses.reduce((sum, a) => sum + a.stats.narrativeDensity, 0) / allAnalyses.length;
        const avgRedundancy = allAnalyses.reduce((sum, a) => sum + a.stats.redundancyScore, 0) / allAnalyses.length;

        return { totalParagraphs, tagDistribution: tagDist, avgDensity, avgRedundancy, chaptersAnalyzed: allAnalyses.length };
    }, [analyses]);

    return {
        analyses,
        analyzing,
        progress,
        analyzeChapters,
        getChapterAnalysis,
        overallStats,
        NARRATIVE_TAGS,
    };
}
