import { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, XCircle, Eye, Search, ChevronDown,
  Fingerprint, FileText, AlertTriangle, Copy, RefreshCw, Lock
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { verifyNDASignature } from '../../hooks/useNDASigning';

// ═══════════════════════════════════════════════════════════════
// ADMIN NDA MANAGEMENT — Review, verify, and audit NDA signatures
// ═══════════════════════════════════════════════════════════════

interface NDARecord {
  id: string;
  signerUid: string;
  signerEmail: string;
  signerDisplayName: string;
  ndaType: string;
  ndaVersion: string;
  ndaTitle: string;
  documentHash: string;
  digitalSignature: string;
  publicKey: JsonWebKey;
  signatureImage: string;
  signedAt: any;
  userAgent: string;
  legalFramework: string[];
}

type VerificationStatus = 'pending' | 'verified' | 'failed';

export default function AdminNDA() {
  const [signatures, setSignatures] = useState<NDARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [verificationStates, setVerificationStates] = useState<Record<string, VerificationStatus>>({});
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // ── Load all NDA signatures ──
  useEffect(() => {
    const q = query(collection(db, 'nda_signatures'), orderBy('signedAt', 'desc'), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      setSignatures(snap.docs.map(d => ({ id: d.id, ...d.data() } as NDARecord)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'nda_signatures');
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Verify a signature cryptographically ──
  const verifySig = async (record: NDARecord) => {
    setVerificationStates(prev => ({ ...prev, [record.id]: 'pending' }));
    try {
      const valid = await verifyNDASignature(
        record.documentHash,
        record.digitalSignature,
        record.publicKey
      );
      setVerificationStates(prev => ({ ...prev, [record.id]: valid ? 'verified' : 'failed' }));
    } catch {
      setVerificationStates(prev => ({ ...prev, [record.id]: 'failed' }));
    }
  };

  // ── Copy hash to clipboard ──
  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // ── Filter logic ──
  const filtered = signatures.filter(s => {
    const matchesSearch = searchQuery.trim() === '' ||
      s.signerDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.signerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.documentHash.includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || s.ndaType === filterType;
    return matchesSearch && matchesType;
  });

  // ── Stats ──
  const totalSigned = signatures.length;
  const typeCounts = signatures.reduce<Record<string, number>>((acc, s) => {
    acc[s.ndaType] = (acc[s.ndaType] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (ts: any) => {
    if (!ts) return 'Unknown';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const typeLabels: Record<string, string> = {
    beta_reader: 'Beta Reader NDA',
    sensitivity_reader: 'Sensitivity Reader NDA',
    author: 'Author Agreement',
  };

  const typeColors: Record<string, string> = {
    beta_reader: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    sensitivity_reader: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    author: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Fingerprint className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-2xl text-text-primary">NDA Management</h2>
          <p className="font-ui text-text-secondary text-sm">Review, verify, and audit cryptographically signed NDAs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-surface-elevated rounded-xl border border-border/30">
            <p className="text-2xl font-heading text-starforge-gold">{totalSigned}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">Total Signed</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className={`flex items-center gap-3 p-4 rounded-xl border ${typeColors[type] || 'text-text-secondary bg-surface border-border/50'}`}>
            <Shield className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-lg font-heading">{typeCounts[type] || 0}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-70">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or document hash..."
            className="w-full bg-surface border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-text-primary text-sm focus:border-starforge-gold/50 outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="appearance-none bg-surface border border-border/50 rounded-xl px-4 py-2.5 pr-8 text-text-secondary text-sm focus:border-starforge-gold/50 outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="beta_reader">Beta Reader</option>
            <option value="sensitivity_reader">Sensitivity Reader</option>
            <option value="author">Author</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Signatures Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-text-muted animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border/50 rounded-2xl">
          <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm">
            {searchQuery ? 'No signatures match your search.' : 'No NDA signatures yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(record => {
            const isExpanded = expandedId === record.id;
            const verifyStatus = verificationStates[record.id];
            return (
              <div key={record.id} className="bg-surface border border-border/50 rounded-2xl overflow-hidden transition-all">
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left"
                >
                  {/* Signature thumb */}
                  <div className="w-16 h-10 bg-void-black rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-border/30">
                    {record.signatureImage ? (
                      <img src={record.signatureImage} alt="sig" className="max-h-8 opacity-70" />
                    ) : (
                      <Fingerprint className="w-4 h-4 text-text-muted" />
                    )}
                  </div>

                  {/* Signer info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{record.signerDisplayName}</p>
                    <p className="text-[11px] text-text-muted truncate">{record.signerEmail}</p>
                  </div>

                  {/* Type badge */}
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold uppercase tracking-widest flex-shrink-0 ${typeColors[record.ndaType] || 'text-text-muted bg-surface-elevated border-border/30'}`}>
                    {record.ndaType.replace('_', ' ')}
                  </span>

                  {/* Date */}
                  <span className="text-[11px] text-text-muted flex-shrink-0 w-40 text-right">
                    {formatDate(record.signedAt)}
                  </span>

                  {/* Verify badge */}
                  {verifyStatus === 'verified' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  {verifyStatus === 'failed' && (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}

                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-border/30 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* NDA Details */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-text-muted uppercase tracking-widest">Agreement</span>
                          <p className="text-sm text-text-primary mt-0.5">{record.ndaTitle}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted uppercase tracking-widest">Version</span>
                          <p className="text-sm text-text-primary mt-0.5">{record.ndaVersion}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted uppercase tracking-widest">Signer UID</span>
                          <p className="text-[11px] text-text-secondary mt-0.5 font-mono">{record.signerUid}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted uppercase tracking-widest">User Agent</span>
                          <p className="text-[10px] text-text-secondary mt-0.5 truncate">{record.userAgent}</p>
                        </div>
                      </div>

                      {/* Drawn Signature */}
                      <div>
                        <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-2">Drawn Signature</span>
                        <div className="bg-void-black rounded-xl p-4 flex items-center justify-center border border-border/30">
                          {record.signatureImage ? (
                            <img src={record.signatureImage} alt="Full signature" className="max-h-20 opacity-80" />
                          ) : (
                            <p className="text-text-muted text-xs">No image</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Hash */}
                    <div className="bg-void-black/50 p-4 rounded-xl border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                          <Lock className="w-3 h-3" /> Document Hash (SHA-256)
                        </span>
                        <button
                          onClick={() => copyHash(record.documentHash, record.id)}
                          className="text-[10px] text-text-muted hover:text-starforge-gold flex items-center gap-1 transition-colors"
                        >
                          <Copy className="w-3 h-3" /> {copiedHash === record.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <code className="text-[11px] text-aurora-teal font-mono break-all block">{record.documentHash}</code>
                    </div>

                    {/* Legal Framework Tags */}
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-2">Legal Framework</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(record.legalFramework || []).map(f => (
                          <span key={f} className="text-[9px] text-amber-400/70 px-2 py-0.5 bg-amber-500/[0.06] rounded border border-amber-500/10">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Verify Button */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => verifySig(record)}
                        disabled={verifyStatus === 'pending'}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                          ${verifyStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            verifyStatus === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}
                      >
                        {verifyStatus === 'pending' ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</>
                        ) : verifyStatus === 'verified' ? (
                          <><CheckCircle2 className="w-4 h-4" /> Signature Valid — Cryptographically Verified</>
                        ) : verifyStatus === 'failed' ? (
                          <><AlertTriangle className="w-4 h-4" /> Signature Invalid — Possible Tampering</>
                        ) : (
                          <><Fingerprint className="w-4 h-4" /> Verify Cryptographic Signature</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
