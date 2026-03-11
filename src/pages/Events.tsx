import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin, Video, Users, Tag, Ticket, CheckCircle, LogIn,
    ArrowRight, ExternalLink, Filter, Star, ChevronDown, ChevronUp, Download
} from 'lucide-react';
import { collection, doc, getDoc, setDoc, updateDoc, increment, onSnapshot, query, orderBy, serverTimestamp, Timestamp, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ──────────────────────────────────────────
type EventItem = {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    date: Timestamp;
    endDate?: Timestamp;
    location: string;
    type: 'Q&A' | 'Release' | 'Workshop' | 'Community' | 'Reading' | 'Panel';
    status: 'upcoming' | 'live' | 'past';
    capacity: number;
    rsvpCount: number;
    rsvpList: string[];
    streamUrl?: string;
    ticketPrice?: number;
    isFree: boolean;
    speakers: { name: string; image: string; role: string }[];
    tags: string[];
    seriesName?: string;
    recordingUrl?: string;
};

// ─── Seed Data ──────────────────────────────────────
const SEED_EVENTS: EventItem[] = [
    {
        id: 'ev1', title: 'Author Fireside: Dark Fantasy Worldbuilding',
        description: 'Elara Vance discusses the art of building mythological magic systems with live audience Q&A.',
        longDescription: 'Join us for an intimate evening with Elara Vance as she walks through her creative process for The Obsidian Crown. Learn how she drew from real mythologies to create the Marrow System, see early concept art, and ask your burning questions. This session will be recorded and available to Navigator+ members.',
        date: Timestamp.fromDate(new Date('2027-04-18T19:00:00')),
        endDate: Timestamp.fromDate(new Date('2027-04-18T20:30:00')),
        location: 'Virtual (Zoom)', type: 'Q&A', status: 'upcoming',
        capacity: 200, rsvpCount: 134, rsvpList: [],
        streamUrl: 'https://zoom.us/j/example', isFree: false, ticketPrice: 5,
        speakers: [{ name: 'Elara Vance', image: 'https://picsum.photos/seed/elara/200/200', role: 'Author' }],
        tags: ['worldbuilding', 'dark fantasy', 'craft'], seriesName: 'Monthly Fireside',
    },
    {
        id: 'ev2', title: 'Book Launch: The Roots Remember',
        description: 'Celebrate the publication of Priya Sharma\'s debut novel with readings, conversation, and a community Q&A.',
        longDescription: 'Rüna Atlas Press proudly presents the launch of The Roots Remember by Priya Sharma. This virtual event includes a live reading of the opening chapter, a conversation between Priya and editorial director about the book\'s journey from submission to publication, and an open Q&A. Signed copies available through our store.',
        date: Timestamp.fromDate(new Date('2027-04-25T18:00:00')),
        endDate: Timestamp.fromDate(new Date('2027-04-25T19:30:00')),
        location: 'Virtual (StreamYard)', type: 'Release', status: 'upcoming',
        capacity: 500, rsvpCount: 289, rsvpList: [],
        isFree: true,
        speakers: [
            { name: 'Priya Sharma', image: 'https://picsum.photos/seed/priya/200/200', role: 'Author' },
        ],
        tags: ['book launch', 'magical realism', 'debut'], seriesName: 'Book Launches',
    },
    {
        id: 'ev3', title: 'Workshop: Writing Queer Characters in Speculative Fiction',
        description: 'A craft workshop on authenticity, avoiding tropes, and centering queer joy in fantastical settings.',
        longDescription: 'River Chen leads this interactive craft workshop. Participants will complete writing prompts, receive live feedback, and leave with a toolkit for centering queer experience in speculative fiction without reducing characters to their identities. Limited to 30 participants for intimate discussion.',
        date: Timestamp.fromDate(new Date('2027-05-10T15:00:00')),
        endDate: Timestamp.fromDate(new Date('2027-05-10T17:00:00')),
        location: 'Virtual (Zoom)', type: 'Workshop', status: 'upcoming',
        capacity: 30, rsvpCount: 22, rsvpList: [],
        isFree: false, ticketPrice: 25,
        speakers: [{ name: 'River Chen', image: 'https://picsum.photos/seed/river/200/200', role: 'Workshop Leader' }],
        tags: ['craft', 'queer fiction', 'workshop'], seriesName: 'Craft Series',
    },
    {
        id: 'ev4', title: 'Panel: Climate Fiction and the End of the World',
        description: 'A panel discussion on cli-fi, hope, and writing about environmental catastrophe responsibly.',
        date: Timestamp.fromDate(new Date('2027-03-20T19:00:00')),
        location: 'Virtual (YouTube Live)', type: 'Panel', status: 'past',
        capacity: 1000, rsvpCount: 567, rsvpList: [],
        isFree: true,
        speakers: [
            { name: 'Kai Nakamura', image: 'https://picsum.photos/seed/kai/200/200', role: 'Panelist' },
        ],
        tags: ['climate fiction', 'panel', 'environment'],
        recordingUrl: 'https://youtube.com/example',
    },
    {
        id: 'ev5', title: 'Community Reading: Neon Requiem Chapters 1-5',
        description: 'Join fellow readers for a guided discussion of the opening chapters.',
        date: Timestamp.fromDate(new Date('2027-04-12T20:00:00')),
        endDate: Timestamp.fromDate(new Date('2027-04-12T21:00:00')),
        location: 'Virtual (Discord)', type: 'Reading', status: 'upcoming',
        capacity: 50, rsvpCount: 31, rsvpList: [],
        isFree: true,
        speakers: [],
        tags: ['book club', 'discussion', 'neon requiem'], seriesName: 'Community Reads',
    },
];

// ─── Component ──────────────────────────────────────
export default function Events() {
    const { user, signIn } = useAuth();
    const [events, setEvents] = useState<EventItem[]>(SEED_EVENTS);
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
    const [rsvpdEvents, setRsvpdEvents] = useState<string[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');

    // Load from Firestore
    useEffect(() => {
        const unsub = onSnapshot(query(collection(db, 'events'), orderBy('date', 'desc')), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as EventItem));
            if (docs.length > 0) setEvents(docs);
        }, () => { });
        return () => unsub();
    }, []);

    // Load user RSVPs
    useEffect(() => {
        if (!user) return;
        const loadRsvps = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid, 'rsvps', 'all'));
                if (snap.exists()) setRsvpdEvents(snap.data().eventIds || []);
            } catch { }
        };
        loadRsvps();
    }, [user]);

    const handleRSVP = async (eventId: string) => {
        if (!user) { signIn(); return; }
        if (rsvpdEvents.includes(eventId)) return;

        const event = events.find(e => e.id === eventId);
        if (event && event.rsvpCount >= event.capacity) return;

        setRsvpdEvents(prev => [...prev, eventId]);
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvpCount: e.rsvpCount + 1 } : e));

        try {
            await setDoc(doc(db, 'users', user.uid, 'rsvps', 'all'), { eventIds: arrayUnion(eventId) }, { merge: true });
            await updateDoc(doc(db, 'events', eventId), { rsvpCount: increment(1), rsvpList: arrayUnion(user.uid) });
        } catch (e) { handleFirestoreError(e, OperationType.UPDATE, 'events'); }
    };

    const generateICal = (event: EventItem) => {
        const start = event.date.toDate();
        const end = event.endDate?.toDate() || new Date(start.getTime() + 90 * 60000);
        const fmt = (d: Date) => d.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
        const ical = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Runa Atlas Press//Events//EN',
            'BEGIN:VEVENT',
            `DTSTART:${fmt(start)}`,
            `DTEND:${fmt(end)}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description}`,
            `LOCATION:${event.location}`,
            'END:VEVENT', 'END:VCALENDAR'
        ].join('\r\n');
        const blob = new Blob([ical], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getTypeBadge = (type: string) => {
        const map: Record<string, string> = {
            'Q&A': 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30',
            'Release': 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30',
            'Workshop': 'bg-cosmic-purple/10 text-cosmic-purple border-cosmic-purple/30',
            'Community': 'bg-queer-pink/10 text-queer-pink border-queer-pink/30',
            'Reading': 'bg-ember-orange/10 text-ember-orange border-ember-orange/30',
            'Panel': 'bg-forge-red/10 text-forge-red border-forge-red/30',
        };
        return map[type] || 'bg-surface text-text-muted border-border';
    };

    const formatDate = (ts: Timestamp) => {
        return ts.toDate().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (ts: Timestamp, endTs?: Timestamp) => {
        const start = ts.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        if (endTs) {
            const end = endTs.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            return `${start} - ${end}`;
        }
        return start;
    };

    const filteredEvents = events.filter(e => {
        if (filterType !== 'all' && e.type !== filterType) return false;
        if (filterStatus !== 'all' && e.status !== filterStatus) return false;
        return true;
    });

    const eventTypes = ['all', 'Q&A', 'Release', 'Workshop', 'Community', 'Reading', 'Panel'];

    return (
        <div className="bg-void-black min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
                        <span className="text-starforge-gold italic font-heading normal-case">Events</span>
                    </h1>
                    <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        Author firesides, book launches, craft workshops, and community readings. Join the conversation live.
                    </p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    <div className="flex gap-1 bg-surface border border-border rounded-full p-1">
                        {(['all', 'upcoming', 'past'] as const).map(status => (
                            <button key={status} onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1 rounded-full font-ui text-xs uppercase tracking-wider transition-all ${filterStatus === status ? 'bg-starforge-gold text-void-black' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                {status === 'all' ? 'All' : status}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {eventTypes.map(type => (
                            <button key={type} onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded-full font-ui text-xs uppercase tracking-wider transition-all ${filterType === type
                                    ? 'bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30'
                                    : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                                    }`}
                            >
                                {type === 'all' ? 'All Types' : type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Events List */}
                <div className="space-y-6">
                    {filteredEvents.length === 0 && (
                        <div className="text-center py-16">
                            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
                            <p className="font-heading text-lg text-text-secondary">No events match your filters</p>
                        </div>
                    )}
                    {filteredEvents.map((event, idx) => {
                        const isRsvpd = rsvpdEvents.includes(event.id);
                        const isFull = event.rsvpCount >= event.capacity;
                        const capacityPct = Math.round((event.rsvpCount / event.capacity) * 100);

                        return (
                            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className={`bg-surface border rounded-sm overflow-hidden ${event.status === 'live' ? 'border-forge-red/50 ring-1 ring-forge-red/20' : 'border-border'}`}
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        {/* Date block */}
                                        <div className="shrink-0 text-center md:w-20">
                                            <div className="bg-void-black border border-border rounded-sm p-3 inline-block md:block">
                                                <p className="font-ui text-[10px] text-starforge-gold uppercase">{event.date.toDate().toLocaleDateString('en-US', { month: 'short' })}</p>
                                                <p className="font-display text-3xl text-text-primary leading-none">{event.date.toDate().getDate()}</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-ui ${getTypeBadge(event.type)}`}>{event.type}</span>
                                                {event.seriesName && (
                                                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-border text-text-muted font-ui">{event.seriesName}</span>
                                                )}
                                                {event.status === 'live' && (
                                                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-forge-red/20 text-forge-red border border-forge-red/30 font-ui animate-pulse">Live Now</span>
                                                )}
                                                {!event.isFree && event.ticketPrice && (
                                                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/30 font-ui flex items-center gap-1">
                                                        <Ticket className="w-3 h-3" /> ${event.ticketPrice}
                                                    </span>
                                                )}
                                                {event.isFree && (
                                                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/30 font-ui">Free</span>
                                                )}
                                            </div>

                                            <h3 className="font-heading text-xl text-text-primary mb-2">{event.title}</h3>
                                            <p className="font-body text-sm text-text-secondary leading-relaxed">{event.description}</p>

                                            {/* Speakers */}
                                            {event.speakers.length > 0 && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    {event.speakers.map((s, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <img src={s.image} alt="" className="w-6 h-6 rounded-full border border-starforge-gold/20 object-cover" referrerPolicy="no-referrer" />
                                                            <span className="font-ui text-xs text-text-muted">{s.name} <span className="text-text-muted/50">({s.role})</span></span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Meta */}
                                            <div className="flex flex-wrap gap-4 mt-4 font-ui text-xs text-text-muted">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(event.date)}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(event.date, event.endDate)}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.rsvpCount}/{event.capacity} attending</span>
                                            </div>

                                            {/* Capacity bar */}
                                            <div className="mt-3 w-full max-w-xs">
                                                <div className="w-full bg-void-black rounded-full h-1.5">
                                                    <div className={`h-full rounded-full transition-all duration-700 ${capacityPct > 90 ? 'bg-forge-red' : capacityPct > 70 ? 'bg-ember-orange' : 'bg-aurora-teal'}`}
                                                        style={{ width: `${Math.min(capacityPct, 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 shrink-0 md:w-40">
                                            {event.status !== 'past' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleRSVP(event.id)}
                                                        disabled={isRsvpd || isFull}
                                                        className={`w-full py-2.5 rounded-sm font-ui text-sm uppercase tracking-wider transition-colors ${isRsvpd
                                                            ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30'
                                                            : isFull
                                                                ? 'bg-surface text-text-muted border border-border cursor-not-allowed'
                                                                : 'bg-starforge-gold text-void-black hover:bg-white'
                                                            }`}
                                                    >
                                                        {isRsvpd ? <span className="flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> RSVP'd</span>
                                                            : isFull ? 'Sold Out' : event.isFree ? 'RSVP Free' : `Get Ticket ($${event.ticketPrice})`}
                                                    </button>
                                                    <button
                                                        onClick={() => generateICal(event)}
                                                        className="w-full py-2 rounded-sm font-ui text-[10px] uppercase tracking-wider border border-border text-text-muted hover:text-starforge-gold hover:border-starforge-gold/30 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Download className="w-3 h-3" /> Add to Calendar
                                                    </button>
                                                    {event.streamUrl && isRsvpd && (
                                                        <a href={event.streamUrl} target="_blank" rel="noopener noreferrer"
                                                            className="w-full py-2 rounded-sm font-ui text-[10px] uppercase tracking-wider border border-aurora-teal/30 text-aurora-teal hover:bg-aurora-teal/10 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Video className="w-3 h-3" /> Join Stream
                                                        </a>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {event.recordingUrl && (
                                                        <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer"
                                                            className="w-full py-2.5 rounded-sm font-ui text-sm uppercase tracking-wider bg-surface border border-border text-text-primary hover:border-starforge-gold/30 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Video className="w-3 h-3" /> Watch Recording
                                                        </a>
                                                    )}
                                                    <span className="font-ui text-[10px] text-text-muted text-center uppercase tracking-wider">Event ended</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expand for long description */}
                                    {event.longDescription && (
                                        <>
                                            <button
                                                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                                className="mt-4 font-ui text-xs text-starforge-gold hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                {expandedEvent === event.id ? 'Show less' : 'Read more'}
                                                {expandedEvent === event.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                            <AnimatePresence>
                                                {expandedEvent === event.id && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                        <p className="font-body text-sm text-text-secondary leading-relaxed mt-3 border-l-2 border-starforge-gold/30 pl-4">
                                                            {event.longDescription}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mt-4">
                                        {event.tags.map(tag => (
                                            <span key={tag} className="font-mono text-[9px] text-text-muted bg-void-black px-1.5 py-0.5 rounded-sm border border-border">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
