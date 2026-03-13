import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, ChevronRight, ChevronDown, FileText, Printer,
  ArrowUp, Calendar, Hash, Filter, X
} from 'lucide-react';
import { KNOWLEDGE_BASE_DOCS, type KBDocument } from '../../data/knowledgeBaseSeed';

// ─── Category Config ────────────────────────────────────
const CATEGORIES = [
  { id: 'Publishing', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'Marketing', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { id: 'Partnerships', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'Operations', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'Community', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
];

const getCategoryColor = (cat: string) =>
  CATEGORIES.find(c => c.id === cat)?.color || 'text-text-muted bg-white/5 border-white/10';

// ─── Simple Markdown Renderer ───────────────────────────
function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-white/[0.06] my-8" />')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="font-heading text-base text-text-primary mt-6 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="font-heading text-lg text-text-primary mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-heading text-xl text-starforge-gold mt-10 mb-4 pb-2 border-b border-white/[0.06]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-2xl text-starforge-gold mt-0 mb-6">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="text-text-primary"><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-text-secondary italic">$1</em>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-starforge-gold/40 pl-4 py-1 my-4 text-text-secondary italic">$1</blockquote>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-white/[0.06] text-aurora-teal px-1.5 py-0.5 rounded text-[13px] font-mono">$1</code>');

  // Tables
  html = html.replace(/(\|.+\|[\r\n]+\|[-| :]+\|[\r\n]+((\|.+\|[\r\n]*)+))/g, (match) => {
    const rows = match.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return match;
    const headerCells = rows[0].split('|').filter(c => c.trim());
    const dataRows = rows.slice(2); // skip header and separator
    let table = '<div class="overflow-x-auto my-6"><table class="w-full text-sm">';
    table += '<thead><tr>';
    headerCells.forEach(cell => {
      table += `<th class="text-left px-3 py-2.5 text-[10px] text-text-muted uppercase tracking-wider font-ui border-b border-white/[0.08] bg-white/[0.02]">${cell.trim()}</th>`;
    });
    table += '</tr></thead><tbody>';
    dataRows.forEach(row => {
      const cells = row.split('|').filter(c => c.trim());
      table += '<tr class="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">';
      cells.forEach(cell => {
        table += `<td class="px-3 py-2.5 text-text-secondary">${cell.trim()}</td>`;
      });
      table += '</tr>';
    });
    table += '</tbody></table></div>';
    return table;
  });

  // Unordered lists (handle nested)
  html = html.replace(/^(\s*)[-•] (.+)$/gm, (_, indent, content) => {
    const level = indent.length >= 4 ? 'ml-6' : indent.length >= 2 ? 'ml-4' : '';
    return `<li class="flex items-start gap-2 py-0.5 text-text-secondary ${level}"><span class="text-starforge-gold/60 mt-1.5 text-[6px]">●</span><span>${content}</span></li>`;
  });

  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, (_, num, content) => {
    return `<li class="flex items-start gap-2.5 py-0.5 text-text-secondary"><span class="text-starforge-gold/60 font-mono text-xs mt-0.5 min-w-[1.2rem]">${num}.</span><span>${content}</span></li>`;
  });

  // Checkboxes
  html = html.replace(/\[ \]/g, '<span class="inline-block w-3.5 h-3.5 rounded-sm border border-white/20 mr-1 align-middle"></span>');
  html = html.replace(/\[x\]/g, '<span class="inline-block w-3.5 h-3.5 rounded-sm bg-emerald-500/30 border border-emerald-500/40 mr-1 align-middle text-center text-[9px] leading-[14px]">✓</span>');

  // Paragraphs (lines that aren't already wrapped in HTML)
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '<div class="h-3"></div>';
    if (trimmed.startsWith('<')) return line;
    return `<p class="text-text-secondary leading-relaxed mb-2">${line}</p>`;
  }).join('\n');

  return html;
}

// ─── Extract TOC from markdown ──────────────────────────
function extractTOC(md: string): { id: string; title: string; level: number }[] {
  const items: { id: string; title: string; level: number }[] = [];
  const lines = md.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,3}) (.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2];
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      items.push({ id, title, level });
    }
  }
  return items;
}

// ─── Main Component ─────────────────────────────────────
export default function AdminKnowledgeBase() {
  const [selectedDoc, setSelectedDoc] = useState<string>(KNOWLEDGE_BASE_DOCS[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const doc = KNOWLEDGE_BASE_DOCS.find(d => d.id === selectedDoc);

  // Group docs by category
  const grouped = useMemo(() => {
    const groups: Record<string, KBDocument[]> = {};
    const q = searchQuery.toLowerCase();
    for (const d of KNOWLEDGE_BASE_DOCS) {
      if (filterCategory && d.category !== filterCategory) continue;
      if (q && !d.title.toLowerCase().includes(q) && !d.content.toLowerCase().includes(q)) continue;
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    }
    return groups;
  }, [searchQuery, filterCategory]);

  const toc = useMemo(() => doc ? extractTOC(doc.content) : [], [doc]);
  const renderedContent = useMemo(() => doc ? renderMarkdown(doc.content) : '', [doc]);
  const wordCount = useMemo(() => doc ? doc.content.split(/\s+/).length : 0, [doc]);

  // Scroll to top when doc changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDoc]);

  const totalDocs = KNOWLEDGE_BASE_DOCS.length;
  const visibleDocs = Object.values(grouped).flat().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-starforge-gold" /> Knowledge Base
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Operations manual, policies, standards, and playbooks for running Rüna Atlas Press.
            <span className="text-text-muted ml-2">{totalDocs} documents</span>
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-0 rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.01]" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        
        {/* ═══ LEFT: Document Navigator ═══ */}
        <div className={`${sidebarCollapsed ? 'w-12' : 'w-72'} flex-shrink-0 border-r border-white/[0.06] bg-white/[0.02] flex flex-col transition-all duration-200`}>
          {sidebarCollapsed ? (
            <button onClick={() => setSidebarCollapsed(false)}
              className="p-3 text-text-muted hover:text-starforge-gold transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              {/* Search */}
              <div className="p-3 border-b border-white/[0.06]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search docs..."
                    className="w-full pl-8 pr-8 py-2 bg-void-black/50 border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-starforge-gold/40 placeholder:text-text-muted"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1 mt-2">
                  <button onClick={() => setFilterCategory(null)}
                    className={`px-2 py-1 rounded text-[9px] font-ui uppercase tracking-wider transition-all ${!filterCategory ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-muted hover:text-white'}`}>
                    All
                  </button>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setFilterCategory(filterCategory === cat.id ? null : cat.id)}
                      className={`px-2 py-1 rounded text-[9px] font-ui transition-all ${filterCategory === cat.id
                        ? `${cat.color}` : 'text-text-muted hover:text-white'}`}>
                      {cat.id}
                    </button>
                  ))}
                </div>
                {searchQuery && (
                  <p className="text-[10px] text-text-muted mt-1.5">{visibleDocs} of {totalDocs} docs</p>
                )}
              </div>

              {/* Document List */}
              <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
                {Object.entries(grouped).map(([category, docs]) => (
                  <CategoryGroup
                    key={category}
                    category={category}
                    docs={docs}
                    selectedId={selectedDoc}
                    onSelect={id => setSelectedDoc(id)}
                  />
                ))}
                {Object.keys(grouped).length === 0 && (
                  <div className="text-center py-8 text-text-muted text-xs">No documents match.</div>
                )}
              </nav>

              {/* Collapse toggle */}
              <button onClick={() => setSidebarCollapsed(true)}
                className="p-2 border-t border-white/[0.06] text-text-muted hover:text-text-secondary text-[10px] font-ui flex items-center justify-center gap-1">
                <ChevronRight className="w-3 h-3 rotate-180" /> Collapse
              </button>
            </>
          )}
        </div>

        {/* ═══ RIGHT: Document Viewer ═══ */}
        <div className="flex-1 flex flex-col min-w-0">
          {doc ? (
            <>
              {/* Doc Header */}
              <div className="px-8 py-5 border-b border-white/[0.06] bg-white/[0.01] flex items-center gap-4">
                <span className="text-3xl">{doc.icon}</span>
                <div className="flex-1 min-w-0">
                  <h1 className="font-heading text-xl text-text-primary truncate">{doc.title}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(doc.category)}`}>
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {doc.lastUpdated}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Hash className="w-3 h-3" /> {wordCount.toLocaleString()} words
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-text-primary text-xs border border-white/[0.06] rounded-lg hover:bg-white/[0.04] transition-all">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>

              {/* Content Area with optional TOC */}
              <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div ref={contentRef} className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
                  <article
                    className="max-w-3xl mx-auto prose-custom"
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                  />
                  {/* Back to top */}
                  <div className="mt-12 mb-6 text-center">
                    <button onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-starforge-gold transition-colors">
                      <ArrowUp className="w-3 h-3" /> Back to top
                    </button>
                  </div>
                </div>

                {/* TOC Sidebar */}
                {toc.length > 2 && (
                  <div className="w-52 flex-shrink-0 border-l border-white/[0.06] overflow-y-auto py-6 px-4 hidden xl:block">
                    <p className="text-[9px] text-text-muted uppercase tracking-[0.15em] font-ui mb-3">On This Page</p>
                    <div className="space-y-1">
                      {toc.map(item => (
                        <button
                          key={item.id}
                          className={`block text-left w-full text-[11px] leading-snug transition-colors hover:text-starforge-gold ${item.level === 2 ? 'text-text-secondary font-medium' : 'text-text-muted pl-3'}`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Select a document to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Category Group ─────────────────────────────────────
function CategoryGroup({ category, docs, selectedId, onSelect }: {
  category: string;
  docs: KBDocument[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const hasActive = docs.some(d => d.id === selectedId);
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-left group hover:bg-white/[0.03] transition-colors">
        <span className={`font-ui text-[9px] uppercase tracking-[0.12em] font-semibold ${hasActive ? 'text-starforge-gold' : 'text-text-muted'}`}>
          {category}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-text-muted/50">{docs.length}</span>
          <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${open ? '' : '-rotate-90'}`} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-1 space-y-0.5 pb-2">
              {docs.map(d => (
                <button
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-[12px] ${selectedId === d.id
                    ? 'bg-starforge-gold/10 text-starforge-gold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'}`}
                >
                  <span className="text-sm flex-shrink-0">{d.icon}</span>
                  <span className="truncate leading-tight">{d.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
