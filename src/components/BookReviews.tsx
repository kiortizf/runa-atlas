import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, LogIn, Send, Trash2 } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, where, updateDoc, doc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface Review {
    id: string;
    bookId: string;
    userId: string;
    displayName: string;
    rating: number;
    text: string;
    helpfulVotes: number;
    createdAt: any;
}

interface Props {
    bookId: string;
}

export default function BookReviews({ bookId }: Props) {
    const { user, signIn } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [votedReviews, setVotedReviews] = useState<string[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Load reviews
    useEffect(() => {
        const q = query(collection(db, 'reviews'), where('bookId', '==', bookId), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        }, () => { });
        return () => unsub();
    }, [bookId]);

    // Load voted reviews from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('votedReviews');
        if (saved) setVotedReviews(JSON.parse(saved));
    }, []);

    // Calculate average
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const userHasReviewed = user && reviews.some(r => r.userId === user.uid);

    const submitReview = async () => {
        if (!user || !rating || !reviewText.trim()) return;
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'reviews'), {
                bookId, userId: user.uid, displayName: user.displayName || 'Anonymous',
                rating, text: reviewText.trim(), helpfulVotes: 0, createdAt: serverTimestamp(),
            });
            setRating(0); setReviewText(''); setSubmitted(true); setShowForm(false);
            setTimeout(() => setSubmitted(false), 3000);
        } catch { /* ignore */ } finally { setSubmitting(false); }
    };

    const voteHelpful = async (reviewId: string) => {
        if (votedReviews.includes(reviewId)) return;
        try {
            const ref = doc(db, 'reviews', reviewId);
            const review = reviews.find(r => r.id === reviewId);
            if (review) {
                await updateDoc(ref, { helpfulVotes: (review.helpfulVotes || 0) + 1 });
                const updated = [...votedReviews, reviewId];
                setVotedReviews(updated);
                localStorage.setItem('votedReviews', JSON.stringify(updated));
            }
        } catch { /* ignore */ }
    };

    const deleteReview = async (reviewId: string) => {
        try { await deleteDoc(doc(db, 'reviews', reviewId)); } catch { /* ignore */ }
    };

    const getDate = (d: any) => {
        if (!d) return '';
        if (d instanceof Timestamp) return d.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        if (d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        return '';
    };

    const StarSelector = ({ value, hover, onSet, onHover, onLeave, size = 'w-6 h-6' }: {
        value: number; hover: number; onSet: (v: number) => void; onHover: (v: number) => void; onLeave: () => void; size?: string;
    }) => (
        <div className="flex gap-0.5" onMouseLeave={onLeave}>
            {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => onSet(s)} onMouseEnter={() => onHover(s)}
                    className="p-0.5 transition-transform hover:scale-110">
                    <Star className={`${size} ${s <= (hover || value) ? 'fill-starforge-gold text-starforge-gold' : 'text-text-muted/30'} transition-colors`} />
                </button>
            ))}
        </div>
    );

    const StaticStars = ({ value, size = 'w-4 h-4' }: { value: number; size?: string }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`${size} ${s <= Math.round(value) ? 'fill-starforge-gold text-starforge-gold' : 'text-text-muted/20'}`} />
            ))}
        </div>
    );

    return (
        <div className="mt-16 pt-12 border-t border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-display text-2xl text-text-primary uppercase tracking-widest mb-1">Reader Reviews</h2>
                    <div className="flex items-center gap-3">
                        <StaticStars value={avgRating} size="w-5 h-5" />
                        <span className="font-mono text-sm text-starforge-gold">{avgRating.toFixed(1)}</span>
                        <span className="font-ui text-xs text-text-muted">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                    </div>
                </div>
                {user && !userHasReviewed && !showForm && (
                    <button onClick={() => setShowForm(true)}
                        className="px-4 py-2 border border-starforge-gold/30 text-starforge-gold font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-starforge-gold/5 transition-colors">
                        Write a Review
                    </button>
                )}
                {!user && (
                    <button onClick={signIn}
                        className="flex items-center gap-2 px-4 py-2 border border-border text-text-secondary font-ui text-xs uppercase tracking-wider rounded-sm hover:border-starforge-gold/30 hover:text-starforge-gold transition-colors">
                        <LogIn className="w-3.5 h-3.5" /> Sign In to Review
                    </button>
                )}
            </div>

            {/* Success Banner */}
            <AnimatePresence>
                {submitted && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-3 bg-aurora-teal/10 border border-aurora-teal/30 rounded-sm text-aurora-teal font-ui text-sm text-center">
                        Thank you for your review!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Write Review Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-10">
                        <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
                            <div>
                                <label className="font-ui text-xs uppercase tracking-wider text-text-muted block mb-2">Your Rating</label>
                                <StarSelector value={rating} hover={hoverRating} onSet={setRating} onHover={setHoverRating} onLeave={() => setHoverRating(0)} />
                            </div>
                            <div>
                                <label className="font-ui text-xs uppercase tracking-wider text-text-muted block mb-2">Your Review</label>
                                <textarea rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} maxLength={2000} placeholder="Share your thoughts on this book..."
                                    className="w-full bg-deep-space border border-border rounded-sm px-4 py-3 text-text-primary font-body text-sm leading-relaxed resize-none outline-none focus:border-starforge-gold/50 transition-colors" />
                                <p className="font-mono text-[10px] text-text-muted mt-1 text-right">{reviewText.length}/2000</p>
                            </div>
                            <div className="flex items-center gap-3 justify-end">
                                <button onClick={() => { setShowForm(false); setRating(0); setReviewText(''); }}
                                    className="px-4 py-2 text-text-muted font-ui text-xs uppercase tracking-wider hover:text-text-primary transition-colors">Cancel</button>
                                <button onClick={submitReview} disabled={!rating || !reviewText.trim() || submitting}
                                    className="flex items-center gap-2 px-5 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors">
                                    <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Post Review'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review, i) => (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface border border-border rounded-sm p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-heading text-sm text-text-primary">{review.displayName}</span>
                                    <span className="font-ui text-[10px] text-text-muted">{getDate(review.createdAt)}</span>
                                </div>
                                <StaticStars value={review.rating} />
                            </div>
                            {user?.uid === review.userId && (
                                <button onClick={() => deleteReview(review.id)}
                                    className="text-text-muted hover:text-forge-red transition-colors p-1">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        <p className="font-body text-sm text-text-secondary leading-relaxed mb-4">{review.text}</p>
                        <div className="flex items-center gap-2 pt-3 border-t border-border">
                            <button onClick={() => user ? voteHelpful(review.id) : signIn()}
                                disabled={votedReviews.includes(review.id)}
                                className={`flex items-center gap-1.5 font-ui text-[10px] uppercase tracking-wider transition-colors ${votedReviews.includes(review.id) ? 'text-aurora-teal' : 'text-text-muted hover:text-aurora-teal'
                                    }`}>
                                <ThumbsUp className={`w-3 h-3 ${votedReviews.includes(review.id) ? 'fill-aurora-teal' : ''}`} />
                                Helpful {review.helpfulVotes > 0 && `(${review.helpfulVotes})`}
                            </button>
                        </div>
                    </motion.div>
                ))}
                {reviews.length === 0 && (
                    <div className="text-center py-12">
                        <Star className="w-8 h-8 text-text-muted/20 mx-auto mb-3" />
                        <p className="font-ui text-sm text-text-muted">No reviews yet. Be the first to share your thoughts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
