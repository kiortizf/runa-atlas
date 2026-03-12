import { useState, useCallback, useMemo } from 'react';

// ── Types ──
export type SceneTempo = 'fast' | 'moderate' | 'slow' | 'reflective';

export interface ChapterPacing {
    chapterId: string;
    chapterTitle: string;
    wordCount: number;
    readingMinutes: number;
    tensionScore: number;          // 0-100
    tempo: SceneTempo;
    dialogueRatio: number;         // 0-1
    actionDensity: number;         // 0-1
    descriptionWeight: number;     // 0-1
    avgSentenceLength: number;
    sentenceLengthVariance: number;
}

export interface DragZone {
    startChapter: number;
    endChapter: number;
    severity: 'mild' | 'moderate' | 'severe';
    avgTension: number;
    suggestion: string;
}

export interface PacingProfile {
    chapters: ChapterPacing[];
    tensionCurve: number[];
    dragZones: DragZone[];
    overallTempo: SceneTempo;
    avgTension: number;
    peakChapter: number;
    valleyChapter: number;
}

// ── Genre benchmark curves (normalized 0-100) ──
const GENRE_BENCHMARKS: Record<string, number[]> = {
    'Dark Fantasy': [30, 40, 50, 45, 55, 65, 60, 70, 75, 85, 80, 90, 95, 70, 50],
    'Cyberpunk': [50, 60, 55, 70, 65, 75, 80, 70, 85, 90, 75, 95, 80, 60, 45],
    'Literary Fiction': [20, 30, 35, 40, 45, 50, 55, 50, 60, 55, 65, 70, 75, 60, 40],
    'Thriller': [60, 70, 65, 75, 80, 70, 85, 80, 90, 85, 95, 90, 100, 75, 50],
    'Romance': [25, 35, 45, 50, 40, 55, 60, 50, 65, 70, 75, 85, 90, 70, 45],
    'Sci-Fi': [35, 45, 50, 55, 60, 65, 70, 60, 75, 80, 85, 90, 95, 65, 40],
    'Epic Fantasy': [25, 35, 40, 45, 50, 55, 50, 60, 65, 70, 80, 85, 90, 70, 45],
};

// ── Analysis functions ──
const ACTION_VERBS = ['ran', 'fought', 'grabbed', 'slammed', 'dodged', 'leaped', 'crashed', 'struck', 'threw', 'charged', 'sprinted', 'lunged', 'blocked', 'swung', 'fired', 'attacked', 'screamed', 'shouted', 'exploded', 'shattered'];

function analyzeSentences(text: string): { avgLength: number; variance: number; count: number } {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length === 0) return { avgLength: 0, variance: 0, count: 0 };

    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;

    return { avgLength: avg, variance: Math.sqrt(variance), count: sentences.length };
}

function calculateDialogueRatio(text: string): number {
    const totalChars = text.length;
    if (totalChars === 0) return 0;

    // Count characters inside quotes
    let inQuote = false;
    let dialogueChars = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"' || text[i] === '"' || text[i] === '"') {
            inQuote = !inQuote;
        } else if (inQuote) {
            dialogueChars++;
        }
    }

    return dialogueChars / totalChars;
}

function calculateActionDensity(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    if (words.length === 0) return 0;
    const actionCount = words.filter(w => ACTION_VERBS.includes(w)).length;
    return Math.min(1, actionCount / (words.length / 100)); // Normalize per 100 words
}

function calculateTensionScore(
    dialogueRatio: number,
    actionDensity: number,
    sentenceVariance: number,
    avgSentenceLength: number,
    exclamationCount: number,
    questionCount: number,
    wordCount: number
): number {
    let score = 30; // baseline

    // Short sentences + high variance = tense
    if (avgSentenceLength < 12) score += 15;
    else if (avgSentenceLength < 18) score += 5;
    else score -= 10;

    score += sentenceVariance * 2;

    // Dialogue drives tension
    score += dialogueRatio * 30;

    // Action verbs
    score += actionDensity * 40;

    // Punctuation
    const exclamPerWord = exclamationCount / Math.max(1, wordCount / 100);
    const questPerWord = questionCount / Math.max(1, wordCount / 100);
    score += exclamPerWord * 5;
    score += questPerWord * 3;

    return Math.max(0, Math.min(100, Math.round(score)));
}

function classifyTempo(tension: number, dialogueRatio: number): SceneTempo {
    if (tension > 70 || dialogueRatio > 0.4) return 'fast';
    if (tension > 45) return 'moderate';
    if (tension > 25) return 'slow';
    return 'reflective';
}

function detectDragZones(tensionCurve: number[]): DragZone[] {
    const zones: DragZone[] = [];
    let i = 0;

    while (i < tensionCurve.length) {
        if (tensionCurve[i] < 35) {
            const start = i;
            while (i < tensionCurve.length && tensionCurve[i] < 35) i++;
            const length = i - start;

            if (length >= 2) {
                const avgTension = tensionCurve.slice(start, i).reduce((a, b) => a + b, 0) / length;
                zones.push({
                    startChapter: start,
                    endChapter: i - 1,
                    severity: length >= 4 ? 'severe' : length >= 3 ? 'moderate' : 'mild',
                    avgTension,
                    suggestion: length >= 4
                        ? `${length} consecutive low-tension chapters. Consider injecting a plot twist, conflict escalation, or dramatic reveal.`
                        : length >= 3
                            ? `${length} chapters of low tension. The reader may disengage — try adding a subplot advancement or cliffhanger.`
                            : `Brief pacing dip. Consider tightening prose or adding dialogue to increase energy.`,
                });
            }
        } else {
            i++;
        }
    }

    return zones;
}

// ── Main Hook ──
export function usePacing() {
    const [profile, setProfile] = useState<PacingProfile | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<string>('Dark Fantasy');

    const analyze = useCallback((chapters: { id: string; title: string; plainText: string }[]) => {
        setAnalyzing(true);

        const chapterPacings: ChapterPacing[] = chapters.map(ch => {
            const text = ch.plainText || '';
            const wordCount = text.split(/\s+/).filter(Boolean).length;
            const { avgLength, variance } = analyzeSentences(text);
            const dialogueRatio = calculateDialogueRatio(text);
            const actionDensity = calculateActionDensity(text);
            const exclamationCount = (text.match(/!/g) || []).length;
            const questionCount = (text.match(/\?/g) || []).length;

            const tensionScore = calculateTensionScore(
                dialogueRatio, actionDensity, variance, avgLength,
                exclamationCount, questionCount, wordCount
            );

            return {
                chapterId: ch.id,
                chapterTitle: ch.title,
                wordCount,
                readingMinutes: Math.ceil(wordCount / 250),
                tensionScore,
                tempo: classifyTempo(tensionScore, dialogueRatio),
                dialogueRatio,
                actionDensity,
                descriptionWeight: 1 - dialogueRatio - Math.min(0.3, actionDensity),
                avgSentenceLength: avgLength,
                sentenceLengthVariance: variance,
            };
        });

        const tensionCurve = chapterPacings.map(c => c.tensionScore);
        const dragZones = detectDragZones(tensionCurve);
        const avgTension = tensionCurve.length > 0
            ? tensionCurve.reduce((a, b) => a + b, 0) / tensionCurve.length
            : 0;

        const peakIdx = tensionCurve.indexOf(Math.max(...tensionCurve));
        const valleyIdx = tensionCurve.indexOf(Math.min(...tensionCurve));

        const overallTempo = classifyTempo(avgTension, chapterPacings.reduce((s, c) => s + c.dialogueRatio, 0) / Math.max(1, chapterPacings.length));

        setProfile({
            chapters: chapterPacings,
            tensionCurve,
            dragZones,
            overallTempo,
            avgTension,
            peakChapter: peakIdx,
            valleyChapter: valleyIdx,
        });

        setAnalyzing(false);
    }, []);

    // Get genre benchmark for comparison
    const genreBenchmark = useMemo(() => {
        return GENRE_BENCHMARKS[selectedGenre] || GENRE_BENCHMARKS['Dark Fantasy'];
    }, [selectedGenre]);

    const availableGenres = Object.keys(GENRE_BENCHMARKS);

    return {
        profile,
        analyzing,
        analyze,
        selectedGenre,
        setSelectedGenre,
        genreBenchmark,
        availableGenres,
    };
}
