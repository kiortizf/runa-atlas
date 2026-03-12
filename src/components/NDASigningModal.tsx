import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignaturePad from 'signature_pad';
import { renderNDATemplate, getNDAFullText, type NDATemplate } from '../data/ndaTemplates';
import { useNDASigning, type NDASignatureRecord } from '../hooks/useNDASigning';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield, X, ChevronDown, Check, AlertTriangle, FileText,
  PenTool, Lock, CheckCircle2, Copy, Clock, Fingerprint, Eye
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// NDA SIGNING MODAL — Legally Binding Electronic Signature
// 3-step flow: Read → Sign → Confirmed
// ═══════════════════════════════════════════════════════════════

interface NDASigningModalProps {
  ndaType: 'beta_reader' | 'sensitivity_reader' | 'author';
  manuscriptTitle?: string;
  authorName?: string;
  onSigned: (record: NDASignatureRecord) => void;
  onCancel: () => void;
}

type Step = 'read' | 'sign' | 'confirmed';

export default function NDASigningModal({
  ndaType,
  manuscriptTitle,
  authorName,
  onSigned,
  onCancel,
}: NDASigningModalProps) {
  const { user } = useAuth();
  const { signNDA, signing, signError } = useNDASigning();

  const [step, setStep] = useState<Step>('read');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signatureRecord, setSignatureRecord] = useState<NDASignatureRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);

  // ── Render NDA template with dynamic fields ──
  const renderedNDA = renderNDATemplate(ndaType, {
    SIGNER_NAME: user?.displayName || typedName || 'Signatory',
    SIGNER_EMAIL: user?.email || '',
    DATE: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    MANUSCRIPT_TITLE: manuscriptTitle || '',
    AUTHOR_NAME: authorName || '',
    COMPANY_NAME: 'Rüna Atlas Press, LLC',
  });

  // ── Track scroll position to enforce full read ──
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = el.scrollHeight - el.clientHeight - 50;
    if (el.scrollTop >= threshold) {
      setHasScrolledToBottom(true);
    }
  }, []);

  // ── Initialize signature pad ──
  useEffect(() => {
    if (step !== 'sign') return;

    let sigPad: SignaturePad | null = null;
    let cancelled = false;
    let scrollParent: HTMLElement | null = null;

    const tryInit = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) {
        requestAnimationFrame(tryInit);
        return;
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Canvas must have real layout dimensions (not 0)
      if (w < 10 || h < 10) {
        requestAnimationFrame(tryInit);
        return;
      }

      // Set internal canvas size to match display size (with DPR scaling)
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(ratio, ratio);

      // Create SignaturePad
      sigPad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(15, 15, 25)',
        penColor: 'rgb(255, 255, 255)',
        minWidth: 1.5,
        maxWidth: 3,
      });

      sigPad.addEventListener('endStroke', () => {
        if (sigPad && !sigPad.isEmpty()) {
          setSignatureData(sigPad.toDataURL('image/png'));
        }
      });

      sigPadRef.current = sigPad;

      // Prevent parent scroll container from hijacking pointer events during drawing
      scrollParent = canvas.closest('[class*="overflow-y"]') || canvas.closest('.overflow-y-auto');
      if (scrollParent) {
        canvas.addEventListener('pointerdown', () => {
          if (scrollParent) scrollParent.style.overflowY = 'hidden';
        });
        canvas.addEventListener('pointerup', () => {
          if (scrollParent) scrollParent.style.overflowY = 'auto';
        });
        canvas.addEventListener('pointerleave', () => {
          if (scrollParent) scrollParent.style.overflowY = 'auto';
        });
      }
    };

    // Start trying on next frame (give AnimatePresence time to mount)
    requestAnimationFrame(tryInit);

    return () => {
      cancelled = true;
      if (scrollParent) scrollParent.style.overflowY = 'auto';
      if (sigPad) sigPad.off();
      sigPadRef.current = null;
    };
  }, [step]);

  // ── Clear signature pad ──
  const clearSignature = () => {
    sigPadRef.current?.clear();
    setSignatureData(null);
  };

  // ── Handle signing ──
  const handleSign = async () => {
    if (!renderedNDA || !signatureData || !typedName.trim()) return;

    const record = await signNDA(renderedNDA, signatureData, typedName.trim());
    if (record) {
      setSignatureRecord(record);
      setStep('confirmed');
      onSigned(record);
    }
  };

  // ── Copy hash to clipboard ──
  const copyHash = () => {
    if (signatureRecord?.documentHash) {
      navigator.clipboard.writeText(signatureRecord.documentHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!renderedNDA) return null;

  const canProceedToSign = hasScrolledToBottom;
  const canSign = signatureData && typedName.trim().length > 2 && !signing;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c0c18] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ═══ Header ═══ */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0c0c18]/95 backdrop-blur-sm flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{renderedNDA.title}</h2>
              <p className="text-[10px] text-text-secondary font-mono">
                Version {renderedNDA.version} · Effective {renderedNDA.effectiveDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
              {(['read', 'sign', 'confirmed'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors
                    ${step === s ? 'bg-amber-400 text-void-black' :
                      (['read', 'sign', 'confirmed'].indexOf(step) > i) ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-white/[0.06] text-text-secondary'}`}>
                    {(['read', 'sign', 'confirmed'].indexOf(step) > i) ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  {i < 2 && <div className={`w-6 h-px mx-0.5 ${(['read', 'sign', 'confirmed'].indexOf(step) > i) ? 'bg-emerald-500/30' : 'bg-white/[0.06]'}`} />}
                </div>
              ))}
            </div>
            {step !== 'confirmed' && (
              <button onClick={onCancel} className="p-2 text-text-secondary hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ═══ Content ═══ */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: READ ── */}
            {step === 'read' && (
              <motion.div key="read" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden">
                {/* Scroll indicator */}
                {!hasScrolledToBottom && (
                  <div className="px-6 py-2 bg-amber-500/[0.06] border-b border-amber-500/10 flex items-center gap-2 flex-none">
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span className="text-xs text-amber-400">Please read the entire agreement to continue</span>
                  </div>
                )}

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {renderedNDA.sections.map((section, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-400/60" />
                        {section.heading}
                      </h3>
                      <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line pl-5 border-l-2 border-white/[0.04]">
                        {section.body.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                          }
                          return <span key={j}>{part}</span>;
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Legal notice */}
                  <div className="p-5 bg-amber-500/[0.04] border border-amber-500/15 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Legal Notice</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {renderedNDA.legalNotice}
                    </p>
                  </div>

                  {/* Scroll-to-bottom anchor */}
                  <div className="h-4" />
                </div>

                {/* Proceed button */}
                <div className="px-6 py-4 border-t border-white/[0.06] bg-[#0c0c18]/95 flex-none flex items-center justify-between">
                  <p className="text-[10px] text-text-secondary">
                    {hasScrolledToBottom ? (
                      <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Full agreement reviewed</span>
                    ) : (
                      'Scroll to the bottom to proceed'
                    )}
                  </p>
                  <button
                    onClick={() => setStep('sign')}
                    disabled={!canProceedToSign}
                    className="px-6 py-2.5 bg-amber-400 text-void-black text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <PenTool className="w-3.5 h-3.5" /> Proceed to Sign
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: SIGN ── */}
            {step === 'sign' && (
              <motion.div key="sign" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-y-auto">
                <div className="px-8 py-6 space-y-6 flex-1">

                  {/* Signature block text */}
                  <div className="p-5 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                    <p className="text-sm text-white leading-relaxed">
                      {renderedNDA.signatureBlock.replace('{{SIGNER_NAME}}', typedName || '_______________')}
                    </p>
                  </div>

                  {/* Typed name */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">
                      Type Your Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={e => setTypedName(e.target.value)}
                      placeholder="Enter your full name exactly as it should appear"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Signature Pad */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">
                        Draw Your Signature *
                      </label>
                      <button onClick={clearSignature} className="text-[10px] text-text-secondary hover:text-amber-400 transition-colors">
                        Clear
                      </button>
                    </div>
                    <div className="relative border border-white/[0.12] rounded-xl overflow-hidden bg-[#0f0f19]" style={{ touchAction: 'none' }}>
                      <canvas
                        ref={canvasRef}
                        className="w-full cursor-crosshair block"
                        style={{ height: '160px', touchAction: 'none' }}
                      />
                      {!signatureData && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-xs text-white/10 flex items-center gap-2">
                            <PenTool className="w-4 h-4" /> Sign here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cryptographic notice */}
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Fingerprint className="w-4 h-4 text-aurora-teal" />
                      <span className="text-[10px] text-aurora-teal uppercase tracking-widest font-semibold">Cryptographic Security</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Your signature will be cryptographically secured using ECDSA P-256 digital signature technology.
                      The agreement text is hashed (SHA-256) and signed with a unique key pair. The digital signature,
                      document hash, and verification key are stored as an immutable, tamper-proof record.
                    </p>
                  </div>

                  {/* Legal framework citation */}
                  <div className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-amber-400/70" />
                      <span className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold">Legal Authority</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      This electronic signature is legally binding under the <strong className="text-white">ESIGN Act</strong> (15 U.S.C. §7001–7031),
                      the <strong className="text-white">Uniform Electronic Transactions Act (UETA)</strong>,
                      and the <strong className="text-white">EU eIDAS Regulation</strong> (EU No 910/2014).
                    </p>
                  </div>

                  {signError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-none" />
                      <span className="text-xs text-red-400">{signError}</span>
                    </div>
                  )}
                </div>

                {/* Sign button */}
                <div className="px-6 py-4 border-t border-white/[0.06] bg-[#0c0c18]/95 flex-none flex items-center justify-between">
                  <button onClick={() => setStep('read')} className="text-xs text-text-secondary hover:text-white transition-colors flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Review Agreement
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={!canSign}
                    className="px-8 py-3 bg-amber-400 text-void-black text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {signing ? (
                      <><Clock className="w-3.5 h-3.5 animate-spin" /> Signing...</>
                    ) : (
                      <><Shield className="w-3.5 h-3.5" /> Sign Agreement</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: CONFIRMED ── */}
            {step === 'confirmed' && signatureRecord && (
              <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center px-8 py-10">

                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>

                <h3 className="text-2xl font-display text-white tracking-wide mb-2 uppercase">Agreement Signed</h3>
                <p className="text-sm text-text-secondary mb-8 text-center max-w-md">
                  Your signature has been cryptographically secured and recorded. This agreement is now legally binding.
                </p>

                {/* Signature Receipt */}
                <div className="w-full max-w-lg p-5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-amber-400/60 font-semibold flex items-center gap-1.5">
                    <Fingerprint className="w-3 h-3" /> Signature Receipt
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-text-secondary block text-[10px] mb-0.5">Signer</span>
                      <span className="text-white">{signatureRecord.signerDisplayName}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block text-[10px] mb-0.5">Email</span>
                      <span className="text-white">{signatureRecord.signerEmail}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block text-[10px] mb-0.5">Agreement</span>
                      <span className="text-white">{signatureRecord.ndaTitle}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block text-[10px] mb-0.5">Version</span>
                      <span className="text-white">{signatureRecord.ndaVersion}</span>
                    </div>
                  </div>

                  {/* Document Hash */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-text-secondary">Document Hash (SHA-256)</span>
                      <button onClick={copyHash} className="text-[10px] text-text-secondary hover:text-amber-400 flex items-center gap-1 transition-colors">
                        <Copy className="w-2.5 h-2.5" /> {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-[10px] text-aurora-teal font-mono break-all block p-2 bg-white/[0.02] rounded">
                      {signatureRecord.documentHash}
                    </code>
                  </div>

                  {/* Legal Framework */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <span className="text-[10px] text-text-secondary block mb-1">Legal Framework</span>
                    <div className="flex flex-wrap gap-1.5">
                      {signatureRecord.legalFramework.map(f => (
                        <span key={f} className="text-[9px] text-amber-400/70 px-2 py-0.5 bg-amber-500/[0.06] rounded border border-amber-500/10">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Drawn Signature */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <span className="text-[10px] text-text-secondary block mb-2">Your Signature</span>
                    <div className="bg-[#0f0f19] rounded-lg p-3 flex items-center justify-center">
                      <img src={signatureRecord.signatureImage} alt="Signature" className="max-h-16 opacity-80" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={onCancel}
                  className="mt-8 px-8 py-3 bg-amber-400 text-void-black text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" /> Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
