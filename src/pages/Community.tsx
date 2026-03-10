import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Vote, BookOpen, MessageCircle, ArrowRight, X, LogIn } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, increment, getDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

type PollOption = { id: string; text: string; votes: number };

type Poll = {
  id: string;
  type: string;
  title: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  daysLeft: number;
};

type ReaderCircle = {
  id: string;
  name: string;
  focus: string;
  members: number;
  status: string;
  description: string;
};

type BookClubGuide = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
};

type QASession = {
  id: string;
  title: string;
  author: string;
  date: Timestamp;
  link: string;
};

export default function Community() {
  const { user, signIn } = useAuth();
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [circles, setCircles] = useState<ReaderCircle[]>([]);
  const [guides, setGuides] = useState<BookClubGuide[]>([]);
  const [qaSessions, setQaSessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<ReaderCircle | null>(null);
  const [applicationForm, setApplicationForm] = useState({ name: '', email: '', whyJoin: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const [hardcodedPoll, setHardcodedPoll] = useState<Poll>({
    id: 'winter-2027-theme',
    type: 'Anthology Theme',
    title: 'Winter 2027 Anthology Theme',
    description: 'Vote for the central theme of our upcoming Winter 2027 short story collection.',
    options: [
      { id: 'opt1', text: 'Cyberpunk Fairytales', votes: 142 },
      { id: 'opt2', text: 'Gothic Space Opera', votes: 89 },
      { id: 'opt3', text: 'Solarpunk Mysteries', votes: 215 },
    ],
    totalVotes: 446,
    daysLeft: 12,
  });

  useEffect(() => {
    // Load voted polls from local storage
    const savedVotes = localStorage.getItem('votedPolls');
    if (savedVotes) {
      setVotedPolls(JSON.parse(savedVotes));
    }

    const unsubPolls = onSnapshot(collection(db, 'polls'), (snapshot) => {
      setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'polls'));

    const unsubCircles = onSnapshot(collection(db, 'readerCircles'), (snapshot) => {
      setCircles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReaderCircle)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'readerCircles'));

    const unsubGuides = onSnapshot(collection(db, 'bookClubGuides'), (snapshot) => {
      setGuides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookClubGuide)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookClubGuides'));

    const unsubQA = onSnapshot(collection(db, 'qaSessions'), (snapshot) => {
      setQaSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QASession)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'qaSessions');
      setLoading(false);
    });

    return () => {
      unsubPolls();
      unsubCircles();
      unsubGuides();
      unsubQA();
    };
  }, []);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) return; // Must be signed in
    if (votedPolls.includes(pollId)) return;

    if (pollId === hardcodedPoll.id) {
      const updatedOptions = hardcodedPoll.options.map(opt =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      setHardcodedPoll({
        ...hardcodedPoll,
        options: updatedOptions,
        totalVotes: hardcodedPoll.totalVotes + 1
      });
      const newVotedPolls = [...votedPolls, pollId];
      setVotedPolls(newVotedPolls);
      localStorage.setItem('votedPolls', JSON.stringify(newVotedPolls));
      return;
    }

    try {
      const pollRef = doc(db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);

      if (pollSnap.exists()) {
        const pollData = pollSnap.data() as Poll;
        const updatedOptions = pollData.options.map(opt =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );

        await updateDoc(pollRef, {
          options: updatedOptions,
          totalVotes: increment(1)
        });

        const newVotedPolls = [...votedPolls, pollId];
        setVotedPolls(newVotedPolls);
        localStorage.setItem('votedPolls', JSON.stringify(newVotedPolls));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `polls/${pollId}`);
    }
  };

  const handleApplyClick = (circle: ReaderCircle) => {
    setSelectedCircle(circle);
    setIsModalOpen(true);
    setSubmitStatus('idle');
    setApplicationForm({ name: '', email: '', whyJoin: '' });
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    // Simulate API call or add to Firestore
    setTimeout(() => {
      setSubmitStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedCircle(null);
      }, 2000);
    }, 1000);
  };

  const allPolls = [hardcodedPoll, ...polls.filter(p => p.id !== hardcodedPoll.id)];

  const hardcodedCircles: ReaderCircle[] = [
    {
      id: 'circle-1',
      name: 'The Obsidian Spire',
      focus: 'Dark Fantasy & Horror',
      members: 24,
      status: 'Accepting Applications',
      description: 'Dive into the darker side of the Runeweave. We focus on atmospheric horror, grimdark fantasy, and psychological thrillers.'
    },
    {
      id: 'circle-2',
      name: 'Neon Horizons',
      focus: 'Cyberpunk & Sci-Fi',
      members: 38,
      status: 'Closed',
      description: 'Exploring the intersection of humanity and technology. Join us for discussions on AI, cybernetics, and dystopian futures.'
    }
  ];
  const allCircles = circles.length > 0 ? circles : hardcodedCircles;

  const hardcodedQA: QASession = {
    id: 'qa-1',
    title: 'Worldbuilding in the Void',
    author: 'Elena Rostova',
    date: Timestamp.fromDate(new Date(Date.now() + 86400000 * 3)),
    link: '#'
  };
  const allQA = qaSessions.length > 0 ? qaSessions : [hardcodedQA];

  if (loading) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Loading community data...</div>;
  }

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            The <span className="text-starforge-gold italic font-heading normal-case">Runeweave</span>
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm">Shape the stories you read</p>
        </div>

        {/* Active Polls */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Vote className="w-6 h-6 text-starforge-gold" />
            <h2 className="font-heading text-3xl text-text-primary">Active Constellations (Voting)</h2>
          </div>

          {allPolls.length === 0 ? (
            <p className="text-text-secondary font-ui">No active polls at the moment. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {allPolls.map((poll) => (
                <div key={poll.id} className="bg-surface border border-border rounded-sm p-6 md:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-ui text-xs uppercase tracking-wider text-aurora-teal bg-aurora-teal/10 px-3 py-1 rounded-full">
                      {poll.type}
                    </span>
                    <span className="font-ui text-xs text-text-muted">{poll.daysLeft} days left</span>
                  </div>
                  <h3 className="font-heading text-2xl text-text-primary mb-2">{poll.title}</h3>
                  <p className="font-body text-text-secondary mb-8">{poll.description}</p>

                  <div className="space-y-4">
                    {poll.options.map((option) => {
                      const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                      const hasVoted = votedPolls.includes(poll.id);

                      return (
                        <div key={option.id} className="relative">
                          <button
                            onClick={() => user ? handleVote(poll.id, option.id) : signIn()}
                            disabled={hasVoted}
                            className={`w-full text-left p-4 rounded-sm border transition-all relative z-10 ${hasVoted
                                ? 'border-border bg-transparent cursor-default'
                                : 'border-border bg-deep-space hover:border-starforge-gold/50 cursor-pointer'
                              }`}
                          >
                            <div className="flex justify-between items-center relative z-20">
                              <span className="font-ui text-sm text-text-primary">{option.text}</span>
                              {hasVoted && <span className="font-mono text-xs text-starforge-gold">{percentage}%</span>}
                            </div>
                          </button>
                          {hasVoted && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="absolute top-0 left-0 h-full bg-starforge-gold/10 rounded-sm z-0"
                            />
                          )}
                        </div>
                      );
                    })}
                    {!user && (
                      <button
                        onClick={signIn}
                        className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-sm border border-dashed border-starforge-gold/30 text-starforge-gold font-ui text-sm hover:bg-starforge-gold/5 transition-colors"
                      >
                        <LogIn className="w-4 h-4" /> Sign in to vote
                      </button>
                    )}
                  </div>
                  {votedPolls.includes(poll.id) && (
                    <p className="mt-4 font-ui text-xs text-starforge-gold text-center">Thank you for shaping the Runeweave.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reader Circles */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-6 h-6 text-starforge-gold" />
            <h2 className="font-heading text-3xl text-text-primary">Reader Circles (Beta Groups)</h2>
          </div>

          {allCircles.length === 0 ? (
            <p className="text-text-secondary font-ui">No reader circles available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allCircles.map((circle) => (
                <div key={circle.id} className="bg-deep-space border border-border rounded-sm p-6 hover:border-starforge-gold/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-heading text-xl text-text-primary">{circle.name}</h3>
                    <span className={`font-ui text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${circle.status === 'Accepting Applications' ? 'bg-aurora-teal/20 text-aurora-teal' : 'bg-surface-elevated text-text-muted'
                      }`}>
                      {circle.status}
                    </span>
                  </div>
                  <p className="font-ui text-xs text-starforge-gold uppercase tracking-wider mb-4">{circle.focus}</p>
                  <p className="font-body text-text-secondary mb-6">{circle.description}</p>

                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <span className="font-ui text-xs text-text-muted">{circle.members} Active Members</span>
                    <button
                      onClick={() => user ? handleApplyClick(circle) : signIn()}
                      disabled={circle.status !== 'Accepting Applications'}
                      className={`font-ui text-sm flex items-center gap-2 transition-colors ${circle.status === 'Accepting Applications'
                          ? 'text-text-primary hover:text-starforge-gold cursor-pointer'
                          : 'text-text-muted cursor-not-allowed'
                        }`}
                    >
                      {!user ? <><LogIn className="w-4 h-4" /> Sign in to Apply</> : <>Apply Now <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Book Clubs & Q&A */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface border border-border rounded-sm p-8 text-center">
            <BookOpen className="w-8 h-8 text-cosmic-purple mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-text-primary mb-2">Book Club Guides</h3>
            <p className="font-body text-text-secondary mb-6">Download discussion guides, author interviews, and reading group materials for all our major releases.</p>
            {guides.length > 0 ? (
              <div className="space-y-4 text-left mt-8 border-t border-border pt-6">
                {guides.map(guide => (
                  <div key={guide.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-ui text-sm text-text-primary">{guide.title}</h4>
                      <p className="font-ui text-xs text-text-muted truncate max-w-[200px]">{guide.description}</p>
                    </div>
                    <a href={guide.fileUrl} target="_blank" rel="noopener noreferrer" className="text-aurora-teal hover:text-white font-ui text-xs uppercase tracking-wider">Download</a>
                  </div>
                ))}
              </div>
            ) : (
              <button className="px-6 py-2 border border-border text-text-primary font-ui text-sm uppercase tracking-wider hover:border-starforge-gold hover:text-starforge-gold transition-colors">
                Browse Guides
              </button>
            )}
          </div>

          <div className="bg-surface border border-border rounded-sm p-8 text-center">
            <MessageCircle className="w-8 h-8 text-queer-pink mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-text-primary mb-2">Author Q&A Sessions</h3>
            <p className="font-body text-text-secondary mb-6">Join live digital events where you can ask our authors directly about their worlds, characters, and writing process.</p>
            {allQA.length > 0 ? (
              <div className="space-y-4 text-left mt-8 border-t border-border pt-6">
                {allQA.map(qa => (
                  <div key={qa.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-ui text-sm text-text-primary">{qa.title}</h4>
                      <p className="font-ui text-xs text-text-muted">with {qa.author} • {qa.date?.toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <a href={qa.link} target="_blank" rel="noopener noreferrer" className="text-queer-pink hover:text-white font-ui text-xs uppercase tracking-wider">Join Live</a>
                  </div>
                ))}
              </div>
            ) : (
              <button className="px-6 py-2 border border-border text-text-primary font-ui text-sm uppercase tracking-wider hover:border-starforge-gold hover:text-starforge-gold transition-colors">
                View Schedule
              </button>
            )}
          </div>
        </section>

      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-sm p-6 md:p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-heading text-2xl text-text-primary mb-2">Apply to Join</h3>
              <p className="font-ui text-sm text-starforge-gold mb-6">{selectedCircle.name}</p>

              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-aurora-teal/20 flex items-center justify-center mx-auto mb-4">
                    <Vote className="w-6 h-6 text-aurora-teal" />
                  </div>
                  <h4 className="font-heading text-xl text-text-primary mb-2">Application Received</h4>
                  <p className="font-ui text-sm text-text-secondary">We'll review your application and get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={applicationForm.name}
                      onChange={(e) => setApplicationForm({ ...applicationForm, name: e.target.value })}
                      className="w-full bg-deep-space border border-border rounded-sm px-4 py-2 text-text-primary font-ui text-sm focus:outline-none focus:border-starforge-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                      className="w-full bg-deep-space border border-border rounded-sm px-4 py-2 text-text-primary font-ui text-sm focus:outline-none focus:border-starforge-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="whyJoin" className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-1">Why do you want to join?</label>
                    <textarea
                      id="whyJoin"
                      required
                      rows={4}
                      value={applicationForm.whyJoin}
                      onChange={(e) => setApplicationForm({ ...applicationForm, whyJoin: e.target.value })}
                      className="w-full bg-deep-space border border-border rounded-sm px-4 py-2 text-text-primary font-ui text-sm focus:outline-none focus:border-starforge-gold transition-colors resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submitStatus === 'submitting'}
                    className="w-full bg-starforge-gold text-void-black font-ui font-medium text-sm py-3 rounded-sm hover:bg-starforge-gold/90 transition-colors disabled:opacity-70 flex justify-center items-center"
                  >
                    {submitStatus === 'submitting' ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

