import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import AdminModal, { FormSection, FormField } from './AdminModal';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

type Submission = {
  id: string;
  title: string;
  authorName: string;
  email: string;
  genre: string;
  wordCount: number;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  submittedAt: any;
  synopsis: string;
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(subs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-surface-elevated text-text-muted border border-border/50 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'reviewing':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1"><Eye className="w-3 h-3" /> Reviewing</span>;
      case 'accepted':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accepted</span>;
      case 'rejected':
        return <span className="bg-forge-red/10 text-forge-red border border-forge-red/20 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  const updateStatus = async (id: string, newStatus: Submission['status']) => {
    try {
      await updateDoc(doc(db, 'submissions', id), { status: newStatus });
      setSelectedSubmission(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const getDisplayDate = (dateObj: any) => {
    if (!dateObj) return 'Unknown';
    if (dateObj instanceof Timestamp) return dateObj.toDate().toLocaleDateString();
    if (dateObj.seconds) return new Date(dateObj.seconds * 1000).toLocaleDateString();
    return new Date(dateObj).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Manuscript Pipeline</h1>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border/50 rounded-full py-2 pl-10 pr-4 text-sm text-text-primary focus:outline-none focus:border-starforge-gold/50 transition-colors font-ui"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-surface border border-border/50 rounded-full py-2 pl-10 pr-8 text-sm text-text-primary focus:outline-none focus:border-starforge-gold/50 transition-colors font-ui"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border/50 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-surface-elevated/50">
                <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Title & Author</th>
                <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Genre</th>
                <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Word Count</th>
                <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Status</th>
                <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Date</th>
                <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => (
                <motion.tr 
                  key={sub.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="p-4">
                    <p className="font-heading text-lg text-text-primary">{sub.title}</p>
                    <p className="font-ui text-xs text-text-muted">{sub.authorName}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-ui text-xs text-starforge-gold uppercase tracking-widest">{sub.genre}</span>
                  </td>
                  <td className="p-4 font-ui text-sm text-text-secondary">
                    {sub.wordCount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(sub.status)}
                  </td>
                  <td className="p-4 font-ui text-sm text-text-secondary">
                    {getDisplayDate(sub.submittedAt)}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedSubmission(sub)}
                      className="text-text-muted hover:text-starforge-gold transition-colors p-2"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredSubmissions.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted font-ui">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title="Review Submission"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            <FormSection title="Manuscript Details">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Title">
                  <p className="font-heading text-xl text-white">{selectedSubmission.title}</p>
                </FormField>
                <FormField label="Author">
                  <p className="font-ui text-sm text-white">{selectedSubmission.authorName}</p>
                  <p className="font-ui text-xs text-text-muted">{selectedSubmission.email}</p>
                </FormField>
                <FormField label="Genre">
                  <p className="font-ui text-sm text-starforge-gold uppercase tracking-widest">{selectedSubmission.genre}</p>
                </FormField>
                <FormField label="Word Count">
                  <p className="font-ui text-sm text-white">{selectedSubmission.wordCount.toLocaleString()} words</p>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Synopsis">
              <p className="font-body text-text-secondary leading-relaxed bg-surface-elevated p-4 rounded-xl border border-border/50">
                {selectedSubmission.synopsis}
              </p>
            </FormSection>

            <FormSection title="Actions">
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary">
                  Download Manuscript
                </button>
                <div className="flex gap-2 ml-auto">
                  <button 
                    onClick={() => updateStatus(selectedSubmission.id, 'rejected')}
                    className="px-4 py-2 rounded-full font-ui text-sm uppercase tracking-widest border border-forge-red/50 text-forge-red hover:bg-forge-red/10 transition-colors"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedSubmission.id, 'accepted')}
                    className="px-4 py-2 rounded-full font-ui text-sm uppercase tracking-widest border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </FormSection>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
