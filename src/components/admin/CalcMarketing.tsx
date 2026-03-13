import { useState, useMemo } from 'react';
import { Megaphone, Info, TrendingUp, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/* ─── Marketing ROI Tracker ───
   Input ad spend by platform → calculates ACOS, CPA, and recommends budget reallocation. */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface Channel { name: string; icon: string; spend: number; clicks: number; conversions: number; revenue: number; benchACOS: number; color: string; }

export default function CalcMarketing() {
  const [channels, setChannels] = useState<Channel[]>([
    { name: 'Amazon Ads', icon: '📦', spend: 500, clicks: 2500, conversions: 50, revenue: 850, benchACOS: 65, color: 'bg-amber-500' },
    { name: 'BookBub Ads', icon: '📚', spend: 300, clicks: 1800, conversions: 45, revenue: 720, benchACOS: 50, color: 'bg-purple-500' },
    { name: 'Facebook/IG', icon: '📱', spend: 400, clicks: 3000, conversions: 25, revenue: 425, benchACOS: 85, color: 'bg-cyan-500' },
    { name: 'TikTok', icon: '🎵', spend: 200, clicks: 5000, conversions: 15, revenue: 255, benchACOS: 90, color: 'bg-pink-500' },
    { name: 'Newsletter Swaps', icon: '📧', spend: 100, clicks: 800, conversions: 40, revenue: 680, benchACOS: 25, color: 'bg-emerald-500' },
    { name: 'BookBub Featured', icon: '⭐', spend: 800, clicks: 8000, conversions: 400, revenue: 2000, benchACOS: 40, color: 'bg-starforge-gold' },
  ]);

  const updateChannel = (idx: number, field: keyof Channel, value: number) => {
    setChannels(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const analysis = useMemo(() => {
    const results = channels.map(ch => {
      const acos = ch.revenue > 0 ? (ch.spend / ch.revenue * 100) : Infinity;
      const cpa = ch.conversions > 0 ? ch.spend / ch.conversions : Infinity;
      const cpc = ch.clicks > 0 ? ch.spend / ch.clicks : 0;
      const convRate = ch.clicks > 0 ? (ch.conversions / ch.clicks * 100) : 0;
      const roi = ch.spend > 0 ? ((ch.revenue - ch.spend) / ch.spend * 100) : 0;
      const profit = ch.revenue - ch.spend;
      const efficiency = acos < ch.benchACOS ? 'OUTPERFORMING' : acos < ch.benchACOS * 1.2 ? 'ON TARGET' : 'UNDERPERFORMING';
      return { ...ch, acos, cpa, cpc, convRate, roi, profit, efficiency };
    });

    const totalSpend = results.reduce((s, r) => s + r.spend, 0);
    const totalRevenue = results.reduce((s, r) => s + r.revenue, 0);
    const totalConversions = results.reduce((s, r) => s + r.conversions, 0);
    const blendedACOS = totalRevenue > 0 ? (totalSpend / totalRevenue * 100) : 0;
    const blendedCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const totalProfit = totalRevenue - totalSpend;

    // Budget reallocation: recommend shifting budget toward best ROI
    const sorted = [...results].sort((a, b) => b.roi - a.roi);
    const recommendations = sorted.map((ch, i) => ({
      ...ch,
      action: i < 2 && ch.roi > 0 ? 'INCREASE' : ch.roi <= 0 ? 'PAUSE' : ch.efficiency === 'UNDERPERFORMING' ? 'REDUCE' : 'MAINTAIN',
    }));

    return { results, totalSpend, totalRevenue, totalConversions, blendedACOS, blendedCPA, totalProfit, recommendations };
  }, [channels]);

  const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
  const fmtk = (n: number) => Math.abs(n) >= 1000 ? `${n < 0 ? '-' : ''}$${(Math.abs(n) / 1000).toFixed(1)}k` : fmt(n);
  const inputClass = "w-full bg-void-black border border-border rounded-lg px-2 py-1.5 text-xs text-white focus:border-starforge-gold outline-none font-mono";
  const labelClass = "block text-[9px] text-text-muted font-ui uppercase tracking-wider mb-0.5";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Total Spend</p>
          <p className="font-heading text-xl text-red-400">{fmtk(analysis.totalSpend)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Total Revenue</p>
          <p className="font-heading text-xl text-emerald-400">{fmtk(analysis.totalRevenue)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Blended ACOS <TIP text="Ad Cost of Sales — what % of revenue goes to ads. Under 60% is healthy for publishing." /></p>
          <p className={`font-heading text-xl ${analysis.blendedACOS <= 50 ? 'text-emerald-400' : analysis.blendedACOS <= 70 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.blendedACOS.toFixed(1)}%</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Blended CPA <TIP text="Cost Per Acquisition — average marketing spend to generate one sale. Under $5 is excellent." /></p>
          <p className={`font-heading text-xl ${analysis.blendedCPA <= 5 ? 'text-emerald-400' : analysis.blendedCPA <= 10 ? 'text-amber-400' : 'text-red-400'}`}>{fmt(analysis.blendedCPA)}</p>
        </div>
        <div className={`border rounded-xl p-4 text-center ${analysis.totalProfit >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <p className="text-[9px] text-text-muted uppercase mb-1">Net Marketing Profit</p>
          <p className={`font-heading text-xl ${analysis.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtk(analysis.totalProfit)}</p>
        </div>
      </div>

      {/* Per-Channel Input Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-starforge-gold" />
          <h3 className="font-heading text-sm text-text-primary">Channel Performance</h3>
          <span className="text-[10px] text-text-muted ml-2">Enter your actual spend and results per channel</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-4 py-2.5 text-text-muted font-ui uppercase text-[9px]">Channel</th>
              <th className="px-2 py-2.5 text-text-muted font-ui uppercase text-[9px]">Spend ($) <TIP text="Total ad spend for this channel in the measurement period." /></th>
              <th className="px-2 py-2.5 text-text-muted font-ui uppercase text-[9px]">Clicks <TIP text="Total clicks or link visits driven by ads." /></th>
              <th className="px-2 py-2.5 text-text-muted font-ui uppercase text-[9px]">Sales <TIP text="Number of confirmed book sales attributed to this channel." /></th>
              <th className="px-2 py-2.5 text-text-muted font-ui uppercase text-[9px]">Revenue ($) <TIP text="Revenue generated from these sales (your net, not list price)." /></th>
              <th className="text-right px-3 py-2.5 text-text-muted font-ui uppercase text-[9px]">ACOS</th>
              <th className="text-right px-3 py-2.5 text-text-muted font-ui uppercase text-[9px]">CPA</th>
              <th className="text-right px-3 py-2.5 text-text-muted font-ui uppercase text-[9px]">Conv %</th>
              <th className="text-right px-3 py-2.5 text-text-muted font-ui uppercase text-[9px]">ROI</th>
              <th className="text-right px-4 py-2.5 text-text-muted font-ui uppercase text-[9px]">Status</th>
            </tr></thead>
            <tbody>
              {analysis.results.map((ch, idx) => (
                <tr key={ch.name} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-text-primary"><span className="mr-1">{ch.icon}</span> {ch.name}</td>
                  <td className="px-2 py-1"><input type="number" min={0} step={50} value={ch.spend} onChange={e => updateChannel(idx, 'spend', +e.target.value)} className={inputClass} /></td>
                  <td className="px-2 py-1"><input type="number" min={0} step={100} value={ch.clicks} onChange={e => updateChannel(idx, 'clicks', +e.target.value)} className={inputClass} /></td>
                  <td className="px-2 py-1"><input type="number" min={0} step={1} value={ch.conversions} onChange={e => updateChannel(idx, 'conversions', +e.target.value)} className={inputClass} /></td>
                  <td className="px-2 py-1"><input type="number" min={0} step={50} value={ch.revenue} onChange={e => updateChannel(idx, 'revenue', +e.target.value)} className={inputClass} /></td>
                  <td className={`px-3 py-2 font-mono text-right ${ch.acos <= ch.benchACOS ? 'text-emerald-400' : 'text-red-400'}`}>{ch.acos === Infinity ? '—' : `${ch.acos.toFixed(0)}%`}</td>
                  <td className={`px-3 py-2 font-mono text-right ${ch.cpa <= 5 ? 'text-emerald-400' : ch.cpa <= 10 ? 'text-amber-400' : 'text-red-400'}`}>{ch.cpa === Infinity ? '—' : fmt(ch.cpa)}</td>
                  <td className="px-3 py-2 font-mono text-right text-text-secondary">{ch.convRate.toFixed(1)}%</td>
                  <td className={`px-3 py-2 font-mono text-right ${ch.roi > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{ch.roi.toFixed(0)}%</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${ch.efficiency === 'OUTPERFORMING' ? 'bg-emerald-500/10 text-emerald-400' : ch.efficiency === 'ON TARGET' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                      {ch.efficiency === 'OUTPERFORMING' ? '🟢' : ch.efficiency === 'ON TARGET' ? '🟡' : '🔴'} {ch.efficiency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Recommendations */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-starforge-gold" /> Budget Reallocation Recommendations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {analysis.recommendations.map(r => (
            <div key={r.name} className={`rounded-lg p-4 border ${r.action === 'INCREASE' ? 'bg-emerald-500/5 border-emerald-500/20' : r.action === 'PAUSE' ? 'bg-red-500/5 border-red-500/20' : r.action === 'REDUCE' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-primary">{r.icon} {r.name}</span>
                <span className={`flex items-center gap-1 text-[10px] font-ui ${r.action === 'INCREASE' ? 'text-emerald-400' : r.action === 'PAUSE' ? 'text-red-400' : r.action === 'REDUCE' ? 'text-amber-400' : 'text-text-muted'}`}>
                  {r.action === 'INCREASE' ? <ArrowUpRight className="w-3 h-3" /> : r.action === 'PAUSE' ? <span>⏸</span> : r.action === 'REDUCE' ? <ArrowDownRight className="w-3 h-3" /> : null}
                  {r.action}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted">ROI: <span className={r.roi > 0 ? 'text-emerald-400' : 'text-red-400'}>{r.roi.toFixed(0)}%</span></span>
                <span className="text-text-muted">ACOS: {r.acos === Infinity ? '—' : `${r.acos.toFixed(0)}%`}</span>
                <span className="text-text-muted">Profit: <span className={r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtk(r.profit)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
