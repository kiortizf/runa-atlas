import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator, DollarSign, BookOpen, TrendingUp, BarChart3,
  Printer, Package, Headphones, Smartphone, ChevronDown
} from 'lucide-react';

// ─── IngramSpark Print Cost Estimation ────────────────
// Based on IngramSpark 2025/2026 pricing: per-page cost + cover cost + market access fee

interface PrintSpecs {
  pageCount: number;
  trimSize: string;
  interiorType: string;
  coverType: string;
}

interface PricingInputs {
  listPrice: number;
  wholesaleDiscount: number;
  authorRoyaltyRate: number;
  advance: number;
  ebookPrice: number;
  ebookRoyaltyRate: number;
  audiobookPFH: number;
  audiobookHours: number;
  audiobookPrice: number;
  audiobookRoyaltyRate: number;
}

// Approximate IngramSpark per-page costs (2025/2026 pricing)
const PAGE_COSTS: Record<string, number> = {
  'bw-cream': 0.013,     // B&W on cream
  'bw-white': 0.013,     // B&W on white
  'standard-color': 0.04, // Standard color
  'premium-color': 0.07,  // Premium color
};

const COVER_COSTS: Record<string, number> = {
  'pb-matte': 0.85,
  'pb-gloss': 0.85,
  'hc-case-laminate': 2.50,
  'hc-dust-jacket': 3.50,
};

const TRIM_SIZES = [
  { value: '5x8', label: '5" × 8"', desc: 'Compact trade' },
  { value: '5.25x8', label: '5.25" × 8"', desc: 'Standard fiction (default)' },
  { value: '5.5x8.5', label: '5.5" × 8.5"', desc: 'Common alternative' },
  { value: '6x9', label: '6" × 9"', desc: 'Larger trade / 400+ pages' },
];

function estimatePrintCost(specs: PrintSpecs): number {
  const pageCost = PAGE_COSTS[specs.interiorType] || 0.013;
  const coverCost = COVER_COSTS[specs.coverType] || 0.85;
  return specs.pageCount * pageCost + coverCost;
}

function estimateSpineWidth(pageCount: number, interiorType: string): number {
  // Approximate: cream paper ~0.0025 in/page, white ~0.002 in/page
  const perPage = interiorType.includes('cream') ? 0.0025 : 0.002;
  return pageCount * perPage;
}

// ─── Component ────────────────────────────────────────

export default function ProfitabilityCalculator() {
  // Print specs
  const [pageCount, setPageCount] = useState(320);
  const [trimSize, setTrimSize] = useState('5.25x8');
  const [interiorType, setInteriorType] = useState('bw-cream');
  const [coverType, setCoverType] = useState('pb-matte');

  // Pricing
  const [listPrice, setListPrice] = useState(16.99);
  const [wholesaleDiscount, setWholesaleDiscount] = useState(55);
  const [authorRoyaltyRate, setAuthorRoyaltyRate] = useState(10);
  const [advance, setAdvance] = useState(3000);

  // eBook
  const [ebookPrice, setEbookPrice] = useState(4.99);
  const [ebookRoyaltyRate, setEbookRoyaltyRate] = useState(25);

  // Audiobook
  const [audiobookPFH, setAudiobookPFH] = useState(300);
  const [audiobookHours, setAudiobookHours] = useState(10);
  const [audiobookPrice, setAudiobookPrice] = useState(24.99);
  const [audiobookRoyaltyRate, setAudiobookRoyaltyRate] = useState(25);

  // Format toggles
  const [showEbook, setShowEbook] = useState(true);
  const [showAudio, setShowAudio] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('print');

  // ── Calculations ──────────────────────────────
  const calc = useMemo(() => {
    // PRINT
    const printCost = estimatePrintCost({ pageCount, trimSize, interiorType, coverType });
    const marketAccessFee = listPrice * 0.01875;
    const grossRevenue = listPrice * (1 - wholesaleDiscount / 100);
    const netToPublisher = grossRevenue - printCost - marketAccessFee;
    const authorPrintRoyalty = netToPublisher * (authorRoyaltyRate / 100);
    const publisherPrintProfit = netToPublisher - authorPrintRoyalty;
    const spineWidth = estimateSpineWidth(pageCount, interiorType);

    // EBOOK
    const ebookAmazonNet = ebookPrice * 0.70; // 70% at $2.99+
    const ebookAuthorRoyalty = ebookAmazonNet * (ebookRoyaltyRate / 100);
    const ebookPublisherProfit = ebookAmazonNet - ebookAuthorRoyalty;

    // AUDIOBOOK
    const audiobookProductionCost = audiobookPFH * audiobookHours;
    const audiobookFindawayNet = audiobookPrice * 0.40; // ~40% through Findaway wide
    const audiobookAuthorRoyalty = audiobookFindawayNet * (audiobookRoyaltyRate / 100);
    const audiobookPublisherProfit = audiobookFindawayNet - audiobookAuthorRoyalty;

    // BREAK-EVEN (advance)
    const combinedProfitPerSale = publisherPrintProfit + (showEbook ? ebookPublisherProfit * 0.6 : 0); // weight ebook less
    const breakEvenUnits = combinedProfitPerSale > 0 ? Math.ceil(advance / combinedProfitPerSale) : Infinity;

    // SCENARIO TABLE
    const scenarios = [50, 100, 250, 500, 1000, 2500, 5000].map(units => {
      const printRev = units * netToPublisher;
      const ebookUnits = Math.round(units * 1.5); // eBook typically sells 1.5x print
      const audioUnits = Math.round(units * 0.3); // audio ~30% of print
      const ebookRev = showEbook ? ebookUnits * ebookAmazonNet : 0;
      const audioRev = showAudio ? audioUnits * audiobookFindawayNet : 0;
      const totalGross = printRev + ebookRev + audioRev;
      const totalAuthorRoyalty = (units * authorPrintRoyalty) + (showEbook ? ebookUnits * ebookAuthorRoyalty : 0) + (showAudio ? audioUnits * audiobookAuthorRoyalty : 0);
      const totalPublisherProfit = totalGross - totalAuthorRoyalty - (showAudio ? audiobookProductionCost : 0);
      const earnOutStatus = totalAuthorRoyalty >= advance ? '✅ Earned Out' : `${Math.round((totalAuthorRoyalty / advance) * 100)}%`;
      return {
        printUnits: units,
        ebookUnits: showEbook ? ebookUnits : 0,
        audioUnits: showAudio ? audioUnits : 0,
        totalGross,
        totalAuthorRoyalty,
        totalPublisherProfit,
        earnOutStatus,
        margin: totalGross > 0 ? Math.round((totalPublisherProfit / totalGross) * 100) : 0,
      };
    });

    return {
      printCost, marketAccessFee, grossRevenue, netToPublisher,
      authorPrintRoyalty, publisherPrintProfit, spineWidth,
      ebookAmazonNet, ebookAuthorRoyalty, ebookPublisherProfit,
      audiobookProductionCost, audiobookFindawayNet, audiobookAuthorRoyalty, audiobookPublisherProfit,
      breakEvenUnits, scenarios,
    };
  }, [pageCount, trimSize, interiorType, coverType, listPrice, wholesaleDiscount,
      authorRoyaltyRate, advance, ebookPrice, ebookRoyaltyRate,
      audiobookPFH, audiobookHours, audiobookPrice, audiobookRoyaltyRate, showEbook, showAudio]);

  const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
  const fmtk = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n);

  const SectionHeader = ({ id, icon: Icon, title, subtitle }: { id: string; icon: any; title: string; subtitle: string }) => (
    <button onClick={() => setExpandedSection(expandedSection === id ? null : id)}
      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors text-left">
      <Icon className="w-5 h-5 text-starforge-gold" />
      <div className="flex-1">
        <h3 className="font-heading text-sm text-text-primary">{title}</h3>
        <p className="text-[11px] text-text-muted">{subtitle}</p>
      </div>
      <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${expandedSection === id ? '' : '-rotate-90'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
          <Calculator className="w-6 h-6 text-starforge-gold" /> Profitability Calculator
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Simulate costs, earnings, and break-even for any title. Based on IngramSpark 2025/2026 pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ═══ LEFT: INPUTS ═══ */}
        <div className="xl:col-span-1 space-y-4">

          {/* Print Specs */}
          <SectionHeader id="print" icon={Printer} title="Print Specifications" subtitle={`${pageCount} pages · ${TRIM_SIZES.find(t => t.value === trimSize)?.label}`} />
          {expandedSection === 'print' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 px-1">
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Page Count: {pageCount}</label>
                <input type="range" min={50} max={800} step={10} value={pageCount} onChange={e => setPageCount(+e.target.value)}
                  className="w-full accent-starforge-gold" />
                <div className="flex justify-between text-[9px] text-text-muted"><span>50</span><span>400</span><span>800</span></div>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Trim Size</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TRIM_SIZES.map(t => (
                    <button key={t.value} onClick={() => setTrimSize(t.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-ui transition-all border ${trimSize === t.value
                        ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30'
                        : 'text-text-muted border-white/[0.06] hover:text-white'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Interior</label>
                <select value={interiorType} onChange={e => setInteriorType(e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="bw-cream">B&W on Cream (Fiction Default)</option>
                  <option value="bw-white">B&W on White</option>
                  <option value="standard-color">Standard Color</option>
                  <option value="premium-color">Premium Color</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Cover</label>
                <select value={coverType} onChange={e => setCoverType(e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="pb-matte">Paperback — Matte Laminate</option>
                  <option value="pb-gloss">Paperback — Gloss Laminate</option>
                  <option value="hc-case-laminate">Hardcover — Case Laminate</option>
                  <option value="hc-dust-jacket">Hardcover — Dust Jacket</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Pricing */}
          <SectionHeader id="pricing" icon={DollarSign} title="Pricing & Terms" subtitle={`List ${fmt(listPrice)} · ${wholesaleDiscount}% discount · ${authorRoyaltyRate}% royalty`} />
          {expandedSection === 'pricing' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 px-1">
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">List Price ($)</label>
                <input type="number" min={0.99} max={99.99} step={0.50} value={listPrice} onChange={e => setListPrice(+e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Wholesale Discount: {wholesaleDiscount}%</label>
                <input type="range" min={35} max={55} step={5} value={wholesaleDiscount} onChange={e => setWholesaleDiscount(+e.target.value)}
                  className="w-full accent-starforge-gold" />
                <div className="flex justify-between text-[9px] text-text-muted"><span>35%</span><span>45%</span><span>55% (rec.)</span></div>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Author Royalty Rate: {authorRoyaltyRate}%</label>
                <input type="range" min={5} max={30} step={1} value={authorRoyaltyRate} onChange={e => setAuthorRoyaltyRate(+e.target.value)}
                  className="w-full accent-starforge-gold" />
                <div className="flex justify-between text-[9px] text-text-muted"><span>5%</span><span>15%</span><span>30%</span></div>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Author Advance ($)</label>
                <input type="number" min={0} max={100000} step={500} value={advance} onChange={e => setAdvance(+e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
            </motion.div>
          )}

          {/* eBook */}
          <div className="flex items-center gap-2">
            <SectionHeader id="ebook" icon={Smartphone} title="eBook" subtitle={showEbook ? `${fmt(ebookPrice)} · ${ebookRoyaltyRate}% royalty` : 'Disabled'} />
            <button onClick={() => setShowEbook(!showEbook)}
              className={`px-2 py-1 rounded text-[10px] font-ui ${showEbook ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-text-muted'}`}>
              {showEbook ? 'ON' : 'OFF'}
            </button>
          </div>
          {expandedSection === 'ebook' && showEbook && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 px-1">
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">eBook Price ($)</label>
                <input type="number" min={0.99} max={14.99} step={0.50} value={ebookPrice} onChange={e => setEbookPrice(+e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Author eBook Royalty: {ebookRoyaltyRate}%</label>
                <input type="range" min={10} max={50} step={5} value={ebookRoyaltyRate} onChange={e => setEbookRoyaltyRate(+e.target.value)}
                  className="w-full accent-starforge-gold" />
              </div>
            </motion.div>
          )}

          {/* Audiobook */}
          <div className="flex items-center gap-2">
            <SectionHeader id="audio" icon={Headphones} title="Audiobook" subtitle={showAudio ? `${audiobookHours}h · ${fmt(audiobookPrice)} · $${audiobookPFH}/PFH` : 'Disabled'} />
            <button onClick={() => setShowAudio(!showAudio)}
              className={`px-2 py-1 rounded text-[10px] font-ui ${showAudio ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-text-muted'}`}>
              {showAudio ? 'ON' : 'OFF'}
            </button>
          </div>
          {expandedSection === 'audio' && showAudio && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 px-1">
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">PFH Rate ($)</label>
                <input type="number" min={100} max={1500} step={50} value={audiobookPFH} onChange={e => setAudiobookPFH(+e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Finished Hours: {audiobookHours}</label>
                <input type="range" min={2} max={30} step={1} value={audiobookHours} onChange={e => setAudiobookHours(+e.target.value)}
                  className="w-full accent-starforge-gold" />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Audiobook List Price ($)</label>
                <input type="number" min={4.99} max={49.99} step={1} value={audiobookPrice} onChange={e => setAudiobookPrice(+e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Author Audio Royalty: {audiobookRoyaltyRate}%</label>
                <input type="range" min={10} max={50} step={5} value={audiobookRoyaltyRate} onChange={e => setAudiobookRoyaltyRate(+e.target.value)}
                  className="w-full accent-starforge-gold" />
              </div>
            </motion.div>
          )}
        </div>

        {/* ═══ RIGHT: RESULTS ═══ */}
        <div className="xl:col-span-2 space-y-6">

          {/* Per-Unit Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* PRINT */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Printer className="w-4 h-4 text-amber-400" />
                <span className="font-heading text-sm text-text-primary">Print (per unit)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">List price</span>
                  <span className="text-text-primary">{fmt(listPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Wholesale ({wholesaleDiscount}%)</span>
                  <span className="text-red-400">-{fmt(listPrice * wholesaleDiscount / 100)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Print cost</span>
                  <span className="text-red-400">-{fmt(calc.printCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Market fee (1.875%)</span>
                  <span className="text-red-400">-{fmt(calc.marketAccessFee)}</span>
                </div>
                <div className="border-t border-white/[0.06] pt-2 flex justify-between text-xs font-medium">
                  <span className="text-text-secondary">Net to publisher</span>
                  <span className={calc.netToPublisher >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt(calc.netToPublisher)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Author ({authorRoyaltyRate}%)</span>
                  <span className="text-purple-400">{fmt(calc.authorPrintRoyalty)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-text-secondary">Publisher profit</span>
                  <span className={calc.publisherPrintProfit >= 0 ? 'text-starforge-gold' : 'text-red-400'}>{fmt(calc.publisherPrintProfit)}</span>
                </div>
                <div className="border-t border-white/[0.06] pt-2 flex justify-between text-[10px]">
                  <span className="text-text-muted">Spine width</span>
                  <span className="text-text-secondary">{calc.spineWidth.toFixed(2)}"</span>
                </div>
              </div>
            </div>

            {/* EBOOK */}
            <div className={`bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 ${!showEbook ? 'opacity-40' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="font-heading text-sm text-text-primary">eBook (per unit)</span>
              </div>
              {showEbook ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">List price</span>
                    <span className="text-text-primary">{fmt(ebookPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Amazon (30%)</span>
                    <span className="text-red-400">-{fmt(ebookPrice * 0.30)}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between text-xs font-medium">
                    <span className="text-text-secondary">Net to publisher</span>
                    <span className="text-emerald-400">{fmt(calc.ebookAmazonNet)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Author ({ebookRoyaltyRate}%)</span>
                    <span className="text-purple-400">{fmt(calc.ebookAuthorRoyalty)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-secondary">Publisher profit</span>
                    <span className="text-starforge-gold">{fmt(calc.ebookPublisherProfit)}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 text-[10px] text-text-muted">
                    No print/shipping costs = highest margin format
                  </div>
                </div>
              ) : <p className="text-xs text-text-muted">eBook disabled</p>}
            </div>

            {/* AUDIOBOOK */}
            <div className={`bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 ${!showAudio ? 'opacity-40' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-4 h-4 text-purple-400" />
                <span className="font-heading text-sm text-text-primary">Audiobook (per unit)</span>
              </div>
              {showAudio ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">List price</span>
                    <span className="text-text-primary">{fmt(audiobookPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Findaway/retailers (60%)</span>
                    <span className="text-red-400">-{fmt(audiobookPrice * 0.60)}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between text-xs font-medium">
                    <span className="text-text-secondary">Net to publisher</span>
                    <span className="text-emerald-400">{fmt(calc.audiobookFindawayNet)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Author ({audiobookRoyaltyRate}%)</span>
                    <span className="text-purple-400">{fmt(calc.audiobookAuthorRoyalty)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-secondary">Publisher profit</span>
                    <span className="text-starforge-gold">{fmt(calc.audiobookPublisherProfit)}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between text-[10px]">
                    <span className="text-text-muted">Production cost</span>
                    <span className="text-amber-400">{fmtk(calc.audiobookProductionCost)} upfront</span>
                  </div>
                </div>
              ) : <p className="text-xs text-text-muted">Audiobook disabled</p>}
            </div>
          </div>

          {/* Break-Even Banner */}
          <div className="bg-gradient-to-r from-starforge-gold/10 to-purple-500/10 border border-starforge-gold/20 rounded-xl p-5 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Advance</p>
              <p className="font-heading text-xl text-starforge-gold">{fmtk(advance)}</p>
            </div>
            <div className="w-px h-10 bg-white/[0.1]" />
            <div>
              <p className="text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Break-Even (print units)</p>
              <p className="font-heading text-xl text-text-primary">
                {calc.breakEvenUnits === Infinity ? '∞' : calc.breakEvenUnits.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-10 bg-white/[0.1]" />
            <div>
              <p className="text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Publisher profit / print unit</p>
              <p className={`font-heading text-xl ${calc.publisherPrintProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(calc.publisherPrintProfit)}
              </p>
            </div>
            {showAudio && (
              <>
                <div className="w-px h-10 bg-white/[0.1]" />
                <div>
                  <p className="text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1">Audio production</p>
                  <p className="font-heading text-xl text-amber-400">{fmtk(calc.audiobookProductionCost)}</p>
                </div>
              </>
            )}
          </div>

          {/* Scenario Table */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-starforge-gold" />
              <h3 className="font-heading text-sm text-text-primary">Profitability Scenarios</h3>
              <span className="text-[10px] text-text-muted ml-2">Assumes eBook sells 1.5× print, audio sells 0.3× print</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-text-muted font-ui uppercase tracking-wider text-[10px]">Print Units</th>
                    {showEbook && <th className="text-right px-3 py-3 text-text-muted font-ui uppercase tracking-wider text-[10px]">eBook</th>}
                    {showAudio && <th className="text-right px-3 py-3 text-text-muted font-ui uppercase tracking-wider text-[10px]">Audio</th>}
                    <th className="text-right px-3 py-3 text-text-muted font-ui uppercase tracking-wider text-[10px]">Total Revenue</th>
                    <th className="text-right px-3 py-3 text-text-muted font-ui uppercase tracking-wider text-[10px]">Author Earnings</th>
                    <th className="text-right px-3 py-3 text-text-muted font-ui uppercase tracking-wider text-[10px]">Publisher Profit</th>
                    <th className="text-right px-3 py-3 text-text-muted font-ui uppercase tracking-wider text-[10px]">Earn-Out</th>
                    <th className="text-right px-4 py-3 text-text-muted font-ui uppercase tracking-wider text-[10px]">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.scenarios.map((s, idx) => (
                    <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 font-mono text-text-primary">{s.printUnits.toLocaleString()}</td>
                      {showEbook && <td className="px-3 py-2.5 font-mono text-text-secondary text-right">{s.ebookUnits.toLocaleString()}</td>}
                      {showAudio && <td className="px-3 py-2.5 font-mono text-text-secondary text-right">{s.audioUnits.toLocaleString()}</td>}
                      <td className="px-3 py-2.5 font-mono text-text-primary text-right">{fmtk(s.totalGross)}</td>
                      <td className="px-3 py-2.5 font-mono text-purple-400 text-right">{fmtk(s.totalAuthorRoyalty)}</td>
                      <td className={`px-3 py-2.5 font-mono text-right ${s.totalPublisherProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmtk(s.totalPublisherProfit)}
                      </td>
                      <td className="px-3 py-2.5 text-right">{s.earnOutStatus}</td>
                      <td className={`px-4 py-2.5 font-mono text-right ${s.margin >= 0 ? 'text-starforge-gold' : 'text-red-400'}`}>
                        {s.margin}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Revenue Breakdown */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-starforge-gold" /> Revenue Distribution (per print unit sold)
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Print Cost', value: calc.printCost, color: 'bg-red-500', pct: (calc.printCost / listPrice) * 100 },
                { label: `Wholesale (${wholesaleDiscount}%)`, value: listPrice * wholesaleDiscount / 100, color: 'bg-orange-500', pct: wholesaleDiscount },
                { label: 'Market Access Fee', value: calc.marketAccessFee, color: 'bg-amber-500', pct: (calc.marketAccessFee / listPrice) * 100 },
                { label: `Author Royalty (${authorRoyaltyRate}%)`, value: calc.authorPrintRoyalty, color: 'bg-purple-500', pct: (calc.authorPrintRoyalty / listPrice) * 100 },
                { label: 'Publisher Profit', value: calc.publisherPrintProfit, color: 'bg-emerald-500', pct: Math.max(0, (calc.publisherPrintProfit / listPrice) * 100) },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-text-muted w-40 text-right">{item.label}</span>
                  <div className="flex-1 h-4 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(0, item.pct))}%` }} />
                  </div>
                  <span className="text-[11px] text-text-secondary font-mono w-16 text-right">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* IngramSpark Reference */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="font-heading text-sm text-text-primary mb-3">📋 IngramSpark 2025/2026 Fee Reference</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-muted mb-1">Market Access Fee</p>
                <p className="text-text-primary font-mono">1.875% of list price</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Revision Fee</p>
                <p className="text-text-primary font-mono">$25 (after 60 days)</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Setup Fee</p>
                <p className="text-emerald-400 font-mono">Free</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Recommended Discount</p>
                <p className="text-text-primary font-mono">55% (for bookstore placement)</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">B&W Page Cost (approx)</p>
                <p className="text-text-primary font-mono">$0.013/page</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">PB Cover Cost (approx)</p>
                <p className="text-text-primary font-mono">$0.85/unit</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">eBook Royalty (IngramSpark)</p>
                <p className="text-text-primary font-mono">85% of net</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Bulk Discount Start</p>
                <p className="text-text-primary font-mono">100+ copies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
