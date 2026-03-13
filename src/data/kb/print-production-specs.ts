export const DOC_PRINT_SPECS = `# Print Production Specifications Guide

This reference covers everything about physical book production — paper, binding, trim sizes, special finishes, and printer selection. Use this when setting up new titles or considering special editions.

## Trim Sizes

| Trim Size | Use Case | Notes |
|-----------|----------|-------|
| 5" × 8" | Mass market / compact trade | Smaller, pocket-friendly |
| 5.25" × 8" | Standard trade paperback (fiction) | **Our default for fiction** |
| 5.5" × 8.5" | Standard trade paperback | Common alternative |
| 6" × 9" | Trade paperback / larger fiction | Better for longer books (400+ pages) |
| 7" × 10" | Anthologies / illustrated works | Non-standard but effective |
| 8.5" × 11" | Art books / workbooks | Not common for fiction |

**Rüna Atlas default**: **5.25" × 8"** for fiction trade paperbacks. Use 6" × 9" for books over 400 pages or when interior design benefits from more space.

## Paper Stock Options

### Interior

| Paper Type | Weight | Color | Best For |
|-----------|--------|-------|----------|
| Cream (uncoated) | 50-60 lb | Cream/off-white | **Fiction (our default)** — easier on eyes |
| White (uncoated) | 50-60 lb | Bright white | Non-fiction, books with images |
| Cream (heavy) | 70-80 lb | Cream | Premium editions, poetry |
| Coated (matte) | 80-100 lb | White | Full-color interior (art books) |
| Coated (gloss) | 80-100 lb | White | Photo books (not for fiction) |

**Rüna Atlas default**: 55lb cream uncoated for all fiction titles.

### Cover

| Cover Type | Weight | Finish | Notes |
|-----------|--------|--------|-------|
| 10pt C1S | Standard | Matte or Gloss laminate | **Our default for trade PB** |
| 12pt C1S | Heavier | Matte or Gloss | Premium feel |
| 14pt C1S | Heavy | Matte | Special editions |
| Cloth/linen | Board weight | Natural texture | Hardcover special editions |

## Binding Types

| Type | Description | Cost | Best For |
|------|------------|------|----------|
| Perfect binding | Glued spine, square | $ | **Standard trade paperback** (our default) |
| Case binding | Hardcover with boards | $$$ | Special/collector editions |
| Smyth-sewn | Signatures sewn, then cased | $$$$ | Premium hardcovers (lay-flat) |
| Saddle-stitch | Stapled through spine | $ | Chapbooks, zines, thin pamphlets |
| Spiral/Wire-O | Coil or wire binding | $$ | Workbooks, notebooks (not for books) |

## Special Finishes

| Finish | Description | Cost Impact | When to Use |
|--------|------------|-------------|-------------|
| Spot UV | Glossy coating on select areas | +$0.25-0.75/unit | Cover design elements (title, illustrations) |
| Foil stamping | Metallic foil pressed into cover | +$0.50-1.50/unit | Title text, logos on special editions |
| Embossing | Raised design pressed into cover | +$0.30-0.75/unit | Texture, premium feel |
| Debossing | Recessed design pressed into cover | +$0.30-0.75/unit | Subtle, elegant texture |
| Sprayed/stained edges | Color applied to page edges | +$0.75-2.00/unit | Special editions, collector appeal |
| Endpapers (printed) | Decorative pages inside covers | +$0.25-0.50/unit | Hardcovers — maps, patterns, art |
| Ribbon bookmark | Sewn-in ribbon marker | +$0.15-0.30/unit | Hardcovers, premium editions |
| Dust jacket | Printed paper wrapper | +$0.50-1.50/unit | Traditional hardcovers |
| French flaps | Extended cover flaps (PB) | +$0.25-0.50/unit | Premium paperbacks |

## POD vs. Offset Decision Matrix

| Factor | Print-on-Demand (IngramSpark) | Offset Print Run |
|--------|-------------------------------|-------------------|
| Minimum order | 1 copy | 500-1,000 copies |
| Per-unit cost | Higher ($3-7 per book) | Lower ($1.50-4 per book at 1,000+) |
| Upfront investment | $0 (per order) | $2,000-10,000+ |
| Setup/revision cost | $49 per file change | $0-500 |
| Turnaround | 3-5 business days | 3-6 weeks |
| Inventory risk | None | Yes — must warehouse and sell through |
| Quality | Good (digital printing) | Excellent (traditional ink) |
| Color quality | Good | Superior (especially for art/photos) |
| Special finishes | Limited (no foil, sprayed edges, etc.) | Full range available |
| Best for | Standard trade editions, backlist | Special editions, 500+ confirmed demand |

### Break-Even Calculation (POD vs Offset)

At what point does offset become cheaper?

- **POD cost per unit**: ~$4.50 (typical 300-page trade PB)
- **Offset cost per unit at 1,000**: ~$2.50
- **Offset setup costs**: ~$1,500
- **Break-even**: ~750 units (offset becomes cheaper per unit above this)
- **Rule of thumb**: If you're confident you'll sell 1,000+ copies within 12 months, consider offset

## Printer Comparison

### Print-on-Demand

| Printer | Strengths | Weaknesses |
|---------|----------|------------|
| **IngramSpark** | Global distribution, library-friendly | $49 revision fee |
| **Amazon KDP Print** | No setup fees, fast Amazon listing | Limited distribution outside Amazon |
| **Lulu** | Good for direct sales, API | Smaller distribution network |

### Offset Printers (US-based)

| Printer | Strengths | Minimum Run |
|---------|----------|-------------|
| **Bookmasters** | Indie-friendly, good quality | 500 |
| **Bang Printing** | Fast turnaround, Midwest | 500 |
| **Thomson-Shore** | High quality, eco-friendly | 500 |
| **Sheridan** | Large capacity, competitive pricing | 1,000 |

### Offset Printers (International)

| Printer | Location | Strengths | Minimum Run |
|---------|----------|----------|-------------|
| **1010 Printing** | Hong Kong/China | Color/art books, competitive pricing | 1,000 |
| **Imago** | Singapore | Premium quality, eco-certified | 1,000 |
| **Livonia Print** | Latvia/EU | European distribution, EU quality | 500 |

## File Specifications for Print

### Interior PDF

- **Resolution**: 300 DPI minimum
- **Color mode**: Grayscale for B&W; CMYK for color
- **Compliance**: PDF/X-1a
- **Fonts**: Embedded or outlined (never linked)
- **Bleed**: 0.125" if full-bleed pages; no bleed for standard text
- **Margins**: Minimum 0.5" all sides; 0.75" gutter recommended
- **Page count**: Must be even number; ideal is divisible by 16 (for offset signatures)

### Cover PDF

- **Resolution**: 300 DPI minimum
- **Color mode**: CMYK
- **Bleed**: 0.125" on all sides
- **Spine width**: Calculate using IngramSpark's spine calculator or printer specs
- **Barcode**: ISBN barcode in standard position (back cover, lower right)

## Quality Control

### Physical Proof Review Checklist

- [ ] Cover color matches design intent
- [ ] Cover finish correct (matte/gloss)
- [ ] Spine text reads correctly and is centered
- [ ] Interior text is sharp and readable
- [ ] Margins are adequate (especially gutter)
- [ ] No missing or duplicated pages
- [ ] Images/illustrations reproduce cleanly
- [ ] ISBN barcode scans correctly
- [ ] Page count matches specification
- [ ] Binding is secure (pages don't fall out when opened flat)
- [ ] Trim size is correct (measure with ruler)
`;
