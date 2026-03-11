import { Clock, Eye, BookOpen, FileSearch, Star, MessageSquare, Send, Handshake, FileText, Printer, CheckCircle, XCircle, LogOut, type LucideIcon } from 'lucide-react';

// ─── 17-Status Lifecycle ────────────────────────────
export const STATUSES = [
    'received', 'first_read', 'first_read_pass', 'second_read', 'second_read_pass',
    'editorial_review', 'revision_requested', 'revision_received',
    'acquisitions_meeting', 'offer_pending', 'offer_sent', 'negotiation',
    'contracted', 'in_production', 'published', 'declined', 'withdrawn',
] as const;

export type SubmissionStatus = typeof STATUSES[number];

export interface StatusConfig {
    label: string; color: string; bg: string; icon: LucideIcon; phase: string;
}

export const STATUS_MAP: Record<SubmissionStatus, StatusConfig> = {
    received: { label: 'Received', color: 'text-text-secondary', bg: 'bg-surface-elevated', icon: Clock, phase: 'inbox' },
    first_read: { label: 'First Read', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Eye, phase: 'first_read' },
    first_read_pass: { label: 'First Read Pass', color: 'text-amber-300', bg: 'bg-amber-400/10', icon: CheckCircle, phase: 'first_read' },
    second_read: { label: 'Second Read', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: BookOpen, phase: 'second_read' },
    second_read_pass: { label: 'Second Read Pass', color: 'text-orange-300', bg: 'bg-orange-400/10', icon: CheckCircle, phase: 'second_read' },
    editorial_review: { label: 'Editorial Review', color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10', icon: FileSearch, phase: 'editorial' },
    revision_requested: { label: 'Revisions Requested', color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10', icon: MessageSquare, phase: 'editorial' },
    revision_received: { label: 'Revisions Received', color: 'text-violet-400', bg: 'bg-violet-500/10', icon: FileText, phase: 'editorial' },
    acquisitions_meeting: { label: 'Acquisitions Meeting', color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', icon: Star, phase: 'acquisitions' },
    offer_pending: { label: 'Offer Pending', color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', icon: Send, phase: 'acquisitions' },
    offer_sent: { label: 'Offer Sent', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Send, phase: 'acquisitions' },
    negotiation: { label: 'Negotiation', color: 'text-yellow-300', bg: 'bg-yellow-400/10', icon: Handshake, phase: 'acquisitions' },
    contracted: { label: 'Contracted', color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', icon: CheckCircle, phase: 'contracted' },
    in_production: { label: 'In Production', color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', icon: Printer, phase: 'contracted' },
    published: { label: 'Published', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle, phase: 'contracted' },
    declined: { label: 'Declined', color: 'text-forge-red', bg: 'bg-forge-red/10', icon: XCircle, phase: 'declined' },
    withdrawn: { label: 'Withdrawn', color: 'text-text-muted', bg: 'bg-surface', icon: LogOut, phase: 'declined' },
};

// Legacy status mapping
export function normalizeStatus(s: string): SubmissionStatus {
    const map: Record<string, SubmissionStatus> = {
        pending: 'received', reviewing: 'first_read', accepted: 'contracted', rejected: 'declined',
    };
    return map[s] || (STATUSES.includes(s as SubmissionStatus) ? s as SubmissionStatus : 'received');
}

// ─── Queue View Definitions ────────────────────────
export interface QueueTab { id: string; label: string; phases: string[]; }

export const QUEUE_TABS: QueueTab[] = [
    { id: 'inbox', label: 'Inbox', phases: ['inbox'] },
    { id: 'first_read', label: 'First Read', phases: ['first_read'] },
    { id: 'second_read', label: 'Second Read', phases: ['second_read'] },
    { id: 'editorial', label: 'Editorial', phases: ['editorial'] },
    { id: 'acquisitions', label: 'Acquisitions', phases: ['acquisitions'] },
    { id: 'contracted', label: 'Contracted', phases: ['contracted'] },
    { id: 'declined', label: 'Declined', phases: ['declined'] },
    { id: 'all', label: 'All', phases: [] },
];

// ─── Status Advancement ────────────────────────────
export const NEXT_STATUS: Partial<Record<SubmissionStatus, SubmissionStatus>> = {
    received: 'first_read', first_read: 'first_read_pass', first_read_pass: 'second_read',
    second_read: 'second_read_pass', second_read_pass: 'editorial_review',
    editorial_review: 'revision_requested', revision_requested: 'revision_received',
    revision_received: 'acquisitions_meeting', acquisitions_meeting: 'offer_pending',
    offer_pending: 'offer_sent', offer_sent: 'negotiation', negotiation: 'contracted',
    contracted: 'in_production', in_production: 'published',
};

// ─── Communication Templates ───────────────────────
export const COMM_TEMPLATES: { id: string; label: string; subject: string; body: string; }[] = [
    { id: 'received', label: 'Received Confirmation', subject: 'Submission Received', body: 'Dear {authorName},\n\nThank you for submitting "{title}" to Rüna Atlas. Your manuscript has been received and logged under tracking ID {trackingId}.\n\nWe aim to respond within 8-12 weeks. We appreciate your patience and interest.\n\nWarmly,\nThe Rüna Atlas Editorial Team' },
    { id: 'first_read_pass', label: 'First Read Pass', subject: 'Advancing to Second Read', body: 'Dear {authorName},\n\nWe are pleased to inform you that "{title}" has passed our first read evaluation and is advancing to a second read.\n\nThis is an exciting step! We will be in touch with further updates.\n\nBest,\nThe Rüna Atlas Editorial Team' },
    { id: 'full_ms_request', label: 'Full Manuscript Request', subject: 'Full Manuscript Request', body: 'Dear {authorName},\n\nAfter careful consideration, we would like to request the full manuscript of "{title}." Please reply to this message with the complete manuscript attached as a Word document (.docx).\n\nWe look forward to reading more.\n\nBest,\nThe Rüna Atlas Editorial Team' },
    { id: 'revision_request', label: 'Revision Request', subject: 'Revision Request', body: 'Dear {authorName},\n\nThank you for your patience as we reviewed "{title}." We see strong potential in your manuscript but would like to suggest some revisions before proceeding.\n\nPlease see the editorial notes attached. We would appreciate a revised manuscript within 4-6 weeks.\n\nBest,\nThe Rüna Atlas Editorial Team' },
    { id: 'acquisitions', label: 'Acquisitions Notification', subject: 'Acquisitions Committee Review', body: 'Dear {authorName},\n\nWe are thrilled to share that "{title}" has been selected for review by our acquisitions committee. This is a significant milestone.\n\nWe will be in touch shortly with next steps.\n\nExcitedly,\nThe Rüna Atlas Editorial Team' },
    { id: 'offer', label: 'Offer Letter', subject: 'Publication Offer', body: 'Dear {authorName},\n\nIt is our great pleasure to extend a publication offer for "{title}." We believe your story will be a powerful addition to the Rüna Atlas constellation.\n\nPlease find the offer details below. We look forward to discussing terms.\n\nWith excitement,\nThe Rüna Atlas Editorial Team' },
    { id: 'contract_sent', label: 'Contract Sent', subject: 'Contract for Review', body: 'Dear {authorName},\n\nPlease find attached the contract for "{title}." We kindly ask you to review it and return a signed copy within two weeks.\n\nDo not hesitate to reach out with any questions.\n\nBest,\nThe Rüna Atlas Editorial Team' },
    { id: 'production_update', label: 'Production Update', subject: 'Production Update', body: 'Dear {authorName},\n\nWe wanted to share an update on "{title}" as it moves through production. [Insert update details here.]\n\nWe are excited to bring your story to readers.\n\nBest,\nThe Rüna Atlas Editorial Team' },
    { id: 'decline_standard', label: 'Decline (Standard)', subject: 'Regarding Your Submission', body: 'Dear {authorName},\n\nThank you for submitting "{title}" to Rüna Atlas. After careful consideration, we have decided not to move forward with this manuscript at this time.\n\nThis is not a reflection of the quality of your writing; our list is highly selective. We encourage you to continue submitting elsewhere.\n\nWishing you the best,\nThe Rüna Atlas Editorial Team' },
    { id: 'decline_personalized', label: 'Decline (Personalized)', subject: 'Regarding Your Submission', body: 'Dear {authorName},\n\nThank you for sharing "{title}" with us. We truly enjoyed [specific element], but ultimately, we did not feel it was the right fit for our current list.\n\nWe would welcome future submissions from you and hope to see more of your work.\n\nWith appreciation,\nThe Rüna Atlas Editorial Team' },
];

// ─── Evaluation Criteria ───────────────────────────
export const EVAL_CRITERIA = [
    { id: 'voice', label: 'Voice & Style' },
    { id: 'plot', label: 'Plot & Structure' },
    { id: 'character', label: 'Character Development' },
    { id: 'worldbuilding', label: 'Worldbuilding' },
    { id: 'pacing', label: 'Pacing' },
    { id: 'originality', label: 'Originality' },
    { id: 'market', label: 'Market Viability' },
] as const;

export type EvalCriterionId = typeof EVAL_CRITERIA[number]['id'];

export interface Evaluation {
    id: string;
    criteria: Record<EvalCriterionId, number>;
    recommendation: 'pass' | 'consider' | 'decline';
    notes: string;
    evaluatorName: string;
    createdAt: any;
}

// ─── Submission Type ───────────────────────────────
export interface EditorSubmission {
    id: string;
    trackingId?: string;
    title: string;
    authorName: string;
    authorId?: string;
    penName?: string;
    email: string;
    genre: string;
    wordCount: number;
    status: SubmissionStatus;
    priority?: boolean;
    assignedTo?: string;
    synopsis?: string;
    queryLetter?: string;
    compTitles?: string;
    contentWarnings?: string;
    representationStatus?: string;
    previouslyPublished?: string;
    targetAudience?: string;
    synopsisFileUrl?: string;
    sampleFileUrl?: string;
    createdAt: any;
}
