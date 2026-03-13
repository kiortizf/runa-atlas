import { useState, useMemo } from 'react';
import { Ruler, Info, BookOpen, Printer, Download } from 'lucide-react';

/* ─── Spine Width Calculator ───
   Input page count + paper type → outputs exact spine width + full cover template dimensions.
   Based on IngramSpark specs: cream = 0.0025"/page, white = 0.002"/page */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

const TRIM_SIZES = [
  { value: '5x8', w: 5, h: 8, label: '5" × 8"', desc: 'Compact trade paperback' },
  { value: '5.25x8', w: 5.25, h: 8, label: '5.25" × 8"', desc: 'Standard fiction (default)' },
  { value: '5.5x8.5', w: 5.5, h: 8.5, label: '5.5" × 8.5"', desc: 'Common alternative' },
  { value: '6x9', w: 6, h: 9, label: '6" × 9"', desc: 'Larger trade / 400+ pages' },
  { value: '7x10', w: 7, h: 10, label: '7" × 10"', desc: 'Textbook / illustrated' },
  { value: '8.5x11', w: 8.5, h: 11, label: '8.5" × 11"', desc: 'Full size / workbook' },
];

const PAPER_TYPES = [
  { value: 'cream', label: 'Cream (uncoated)', ppi: 0.0025, desc: 'Standard for fiction. Warm tone, easier on eyes.' },
  { value: 'white', label: 'White (uncoated)', ppi: 0.002, desc: 'Nonfiction, textbooks. Crisper for images.' },
  { value: 'white-coated', label: 'White (coated)', ppi: 0.002, desc: 'Full-color interiors. Glossy finish.' },
  { value: '80-white', label: '80# White', ppi: 0.0035, desc: 'Premium heavy stock. Thicker spine.' },
];

const COVER_TYPES = [
  { value: 'pb', label: 'Paperback', bleed: 0.125, hinge: 0, wrap: 0, desc: 'Standard softcover' },
  { value: 'hc-case', label: 'Hardcover (Case Laminate)', bleed: 0.0625, hinge: 0.5, wrap: 0.625, desc: 'Printed case, no dust jacket' },
  { value: 'hc-dj', label: 'Hardcover (Dust Jacket)', bleed: 0.125, hinge: 0, wrap: 2.5, desc: 'Traditional dust jacket wrap' },
];

export default function SpineCalculator() {
  const [pageCount, setPageCount] = useState(320);
  const [trimSize, setTrimSize] = useState('5.25x8');
  const [paperType, setPaperType] = useState('cream');
  const [coverType, setCoverType] = useState('pb');

  const result = useMemo(() => {
    const trim = TRIM_SIZES.find(t => t.value === trimSize) || TRIM_SIZES[1];
    const paper = PAPER_TYPES.find(p => p.value === paperType) || PAPER_TYPES[0];
    const cover = COVER_TYPES.find(c => c.value === coverType) || COVER_TYPES[0];

    const spineWidth = pageCount * paper.ppi;

    // Cover template dimensions
    const bleed = cover.bleed;
    const totalCoverWidth = (cover.value === 'pb')
      ? (trim.w + bleed) * 2 + spineWidth // front + back + spine + bleeds
      : (trim.w + cover.wrap) * 2 + spineWidth + (cover.hinge * 2); // hardcover with wraps/hinges

    const totalCoverHeight = (cover.value === 'pb')
      ? trim.h + bleed * 2
      : trim.h + cover.wrap * 2;

    // Safe zones
    const spineTextSafe = spineWidth >= 0.5; // IngramSpark requires ≥0.5" for spine text
    const minSpineForText = 0.5;
    const minPagesForSpineText = Math.ceil(minSpineForText / paper.ppi);

    return {
      spineWidth,
      spineWidthMM: spineWidth * 25.4,
      totalCoverWidth,
      totalCoverHeight,
      trimWidth: trim.w,
      trimHeight: trim.h,
      bleed,
      spineTextSafe,
      minPagesForSpineText,
      paperPPI: paper.ppi,
      paperDesc: paper.desc,
      coverDesc: cover.desc,
    };
  }, [pageCount, trimSize, paperType, coverType]);

  const inputClass = "w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none";
  const labelClass = "block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      {/* ─── Inputs ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div>
          <label className={labelClass}>Page Count <TIP text="Total number of interior pages. Must be even. IngramSpark minimum is 24 pages." /></label>
          <input type="number" min={24} max={1200} step={2} value={pageCount} onChange={e => setPageCount(+e.target.value)} className={inputClass} />
          <input type="range" min={24} max={800} step={2} value={pageCount} onChange={e => setPageCount(+e.target.value)} className="w-full accent-starforge-gold mt-2" />
        </div>
        <div>
          <label className={labelClass}>Trim Size <TIP text="Final page dimensions after cutting. Most fiction uses 5.25×8 or 5.5×8.5." /></label>
          <select value={trimSize} onChange={e => setTrimSize(e.target.value)} className={inputClass}>
            {TRIM_SIZES.map(t => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Paper Stock <TIP text="Paper type determines thickness per page. Cream = 0.0025 in/page, White = 0.002 in/page." /></label>
          <select value={paperType} onChange={e => setPaperType(e.target.value)} className={inputClass}>
            {PAPER_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Binding Type <TIP text="Affects cover template dimensions. Hardcover adds hinges and board wraps." /></label>
          <select value={coverType} onChange={e => setCoverType(e.target.value)} className={inputClass}>
            {COVER_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Spine Width Result */}
        <div className="bg-gradient-to-br from-starforge-gold/5 to-purple-500/5 border border-starforge-gold/20 rounded-xl p-6">
          <h3 className="font-heading text-base text-text-primary mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-starforge-gold" /> Spine Width
          </h3>
          <div className="text-center mb-6">
            <p className="font-heading text-5xl text-starforge-gold">{result.spineWidth.toFixed(3)}"</p>
            <p className="text-sm text-text-secondary mt-1">{result.spineWidthMM.toFixed(1)} mm</p>
          </div>
          <div className={`rounded-lg p-3 mb-4 ${result.spineTextSafe ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            <p className="text-xs text-text-primary flex items-center gap-2">
              {result.spineTextSafe ? '✅' : '⚠️'} Spine Text: {result.spineTextSafe ? 'Safe — adequate width for spine text' : `Not recommended — need ${result.minPagesForSpineText}+ pages for spine text`}
            </p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-text-muted">Pages</span><span className="font-mono text-text-primary">{pageCount}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Paper thickness</span><span className="font-mono text-text-primary">{result.paperPPI}" per page</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Formula</span><span className="font-mono text-text-secondary">{pageCount} × {result.paperPPI}" = {result.spineWidth.toFixed(3)}"</span></div>
          </div>
        </div>

        {/* Cover Template Dimensions */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-base text-text-primary mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> Cover Template Dimensions
          </h3>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                <p className="text-[9px] text-text-muted uppercase mb-1">Template Width</p>
                <p className="font-heading text-xl text-text-primary">{result.totalCoverWidth.toFixed(3)}"</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                <p className="text-[9px] text-text-muted uppercase mb-1">Template Height</p>
                <p className="font-heading text-xl text-text-primary">{result.totalCoverHeight.toFixed(3)}"</p>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-3 space-y-2">
              <div className="flex justify-between"><span className="text-text-muted">Trim size</span><span className="font-mono text-text-primary">{result.trimWidth}" × {result.trimHeight}"</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Spine width</span><span className="font-mono text-starforge-gold">{result.spineWidth.toFixed(3)}"</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Bleed</span><span className="font-mono text-text-primary">{result.bleed}" per side</span></div>
            </div>
          </div>

          {/* Visual spine preview */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-text-muted font-ui uppercase tracking-wider mb-3">Visual Preview (not to scale)</p>
            <div className="flex items-stretch justify-center gap-0 h-32 rounded-lg overflow-hidden border border-white/[0.06]">
              <div className="bg-purple-500/10 flex items-center justify-center px-6 text-[10px] text-purple-400 border-r border-white/[0.06]">
                Back Cover
              </div>
              <div className="bg-starforge-gold/10 flex items-center justify-center text-[10px] text-starforge-gold font-mono" style={{ minWidth: '40px', maxWidth: '80px', width: `${Math.max(40, result.spineWidth * 100)}px` }}>
                {result.spineWidth >= 0.5 ? 'SPINE' : '·'}
              </div>
              <div className="bg-cyan-500/10 flex items-center justify-center px-6 text-[10px] text-cyan-400 border-l border-white/[0.06]">
                Front Cover
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Quick Reference Table ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <Printer className="w-4 h-4 text-starforge-gold" />
          <h3 className="font-heading text-sm text-text-primary">Quick Reference: Page Count → Spine Width</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-4 py-2.5 text-text-muted font-ui uppercase text-[10px]">Pages</th>
              <th className="text-right px-3 py-2.5 text-text-muted font-ui uppercase text-[10px]">Cream</th>
              <th className="text-right px-3 py-2.5 text-text-muted font-ui uppercase text-[10px]">White</th>
              <th className="text-right px-3 py-2.5 text-text-muted font-ui uppercase text-[10px]">80# White</th>
              <th className="text-right px-4 py-2.5 text-text-muted font-ui uppercase text-[10px]">Spine Text?</th>
            </tr></thead>
            <tbody>
              {[100, 150, 200, 250, 300, 350, 400, 500, 600].map(pg => {
                const cream = pg * 0.0025;
                const white = pg * 0.002;
                const heavy = pg * 0.0035;
                return (
                  <tr key={pg} className={`border-b border-white/[0.03] hover:bg-white/[0.02] ${pg === pageCount ? 'bg-starforge-gold/5' : ''}`}>
                    <td className="px-4 py-2 font-mono text-text-primary">{pg}</td>
                    <td className="px-3 py-2 font-mono text-right text-text-secondary">{cream.toFixed(3)}"</td>
                    <td className="px-3 py-2 font-mono text-right text-text-secondary">{white.toFixed(3)}"</td>
                    <td className="px-3 py-2 font-mono text-right text-text-secondary">{heavy.toFixed(3)}"</td>
                    <td className="px-4 py-2 text-right">{cream >= 0.5 ? <span className="text-emerald-400">✅ Yes</span> : <span className="text-amber-400">⚠️ No</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
