export const DOC_DISTRIBUTION_CHANNELS = `# Distribution Channel Guide

Comprehensive reference for all book distribution channels — print, digital, audio, and library. Covers fees, pros/cons, and strategy for deciding where and how to distribute.

## Distribution Strategy Overview

**Rüna Atlas distribution philosophy**: **Go wide.** We do not use Amazon exclusivity (KDP Select). We want our books available everywhere readers buy books.

## Print Distribution

### IngramSpark (Primary)

| Detail | Info |
|--------|------|
| **Role** | Primary print distribution; widest retail reach |
| **Reach** | 40,000+ retailers, libraries, online stores worldwide |
| **Formats** | Paperback, hardcover, large print |
| **Setup fee** | $49/title (waived during promotional periods) |
| **Revision fee** | $49 per file change |
| **Wholesale discount** | Set by publisher; recommend 55% for widest placement |
| **Returnability** | Recommend "Yes — Deliver" for bookstore acceptance |
| **Print quality** | Good (digital printing) |
| **International** | Print facilities in US, UK, Australia — global distribution |

**Why IngramSpark first**: Ingram is the distributor bookstores and libraries actually order from. Amazon KDP Print is Amazon-only distribution.

### Amazon KDP Print (Supplementary)

| Detail | Info |
|--------|------|
| **Role** | Supplementary; Amazon-specific listing optimization |
| **Reach** | Amazon.com and Amazon international only |
| **Setup fee** | Free |
| **Revision fee** | Free |
| **Royalty** | 60% of list price minus printing cost |
| **Print quality** | Good (comparable to IngramSpark) |
| **Limitations** | Amazon distribution only; no bookstore/library reach |

**Note**: If IngramSpark feed is active, Amazon will also list the book via Ingram. KDP Print can offer slightly better Amazon-specific royalties but creates duplicate listings. Use carefully.

### Offset Printing

See the [Print Production Specifications] KB document for offset printer comparison and break-even analysis.

## eBook Distribution

### Direct Platforms

| Platform | Commission | Notes |
|----------|-----------|-------|
| Amazon KDP | 30% (at $2.99-$9.99) or 65% | Our primary eBook platform |
| Apple Books | 30% | Significant market share |
| Kobo Writing Life | 30% | Strong international, growing |
| Google Play Books | 30% | Inconsistent interface but good reach |
| Barnes & Noble Press | Variable | Nook market (declining) |

### Aggregators

| Aggregator | Fee | Distributes To | Best For |
|-----------|-----|----------------|----------|
| **Draft2Digital (D2D)** | 10% of net | Kobo, Apple, B&N, OverDrive, Tolino, Scribd | Wide non-Amazon distribution |
| **PublishDrive** | Flat fee or 10% | 400+ partners globally | International reach |
| **StreetLib** | 10% | European retailers, international | EU-focused distribution |

**Rüna Atlas approach**: 
- **Amazon KDP**: Direct (for maximum control and royalty)
- **Everything else**: Through Draft2Digital (simplifies management)
- **Alternative**: Direct to Apple + Kobo + D2D for everything else

### Wide vs. Exclusive

| Strategy | Pros | Cons |
|----------|------|------|
| **Wide** (our approach) | Available everywhere; no lock-in; diversified revenue | Lower Amazon algorithm boost; can't use Kindle Unlimited |
| **KDP Select (Exclusive)** | Kindle Unlimited income; better Amazon visibility | Locked to Amazon for 90 days; no other platforms |

**Our policy**: Always wide. KDP Select exclusivity concentrates risk and limits reader access.

## Audiobook Distribution

| Channel | How to Access | Notes |
|---------|-------------|-------|
| ACX/Audible | Direct upload | Exclusive (40% royalty) or non-exclusive (25%) |
| Findaway Voices | Direct upload | Wide distribution (40+ platforms) — **recommended** |
| Libro.fm | Via Findaway | Indie bookstore audiobook alternative |
| Apple Books | Via Findaway or direct | Major platform |
| Google Play | Via Findaway | Growing audio market |
| OverDrive/Libby | Via Findaway | Library lending |
| Kobo | Via Findaway | Includes Kobo Plus |
| Chirp | Via Findaway | BookBub's audiobook deals platform |

**Rüna Atlas approach**: Use **Findaway Voices** for wide audio distribution. Avoid ACX exclusivity.

## Library Distribution

| Channel | Type | How to Access |
|---------|------|-------------|
| Baker & Taylor | Print | Via Ingram listing (automatic) |
| OverDrive/Libby | eBook & audio | Via Draft2Digital or Findaway |
| Hoopla | eBook & audio | Via Draft2Digital or direct |
| Bibliotheca cloudLibrary | eBook | Via aggregator |
| Palace Project (DPLA) | eBook | Investigate availability |
| LibraryThing | Print ARCs | Direct submission |

See [Bookstore & Library Partnerships] KB document for detailed library marketing strategy.

## Direct Sales

### Why Direct Sales Matter

- **Highest margin** — no retailer commission (only payment processing fees)
- **Own the customer data** — email addresses, purchase history
- **Full pricing control** — no price-matching by Amazon
- **Bundle opportunities** — sell eBook + audiobook bundles
- **Special editions** — sell exclusives not available at retail

### Platform Options

| Platform | Best For | Fees |
|----------|----------|------|
| Shopify | Full e-commerce store | $39/mo + Stripe fees |
| BookFunnel | Digital delivery | $20-100/year |
| Payhip | Simple digital sales | 5% + payment processing |
| Gumroad | Simple one-off sales | 10% |

### Direct Sales Setup Checklist

- Payment processing (Stripe)
- Digital delivery system (BookFunnel for eBooks)
- Tax collection configuration (state sales tax)
- Shipping integration (for print; use Pirate Ship or similar)
- Order confirmation emails
- Post-purchase email sequence (review request, series upsell)

## Fee Comparison Matrix

| Channel | Publisher Revenue (on $14.99 paperback) | Notes |
|---------|----------------------------------------|-------|
| IngramSpark (55% discount) | ~$2.75 (after print cost) | Widest reach |
| Amazon KDP Print | ~$3.50 (after print cost) | Amazon-only |
| Direct sale (Shopify) | ~$10 (after print + shipping) | Highest margin |

| Channel | Publisher Revenue (on $4.99 eBook) | Notes |
|---------|-----------------------------------|-------|
| Amazon KDP (70%) | $3.44 | Largest eBook market |
| Apple Books (via D2D) | $3.14 (70% × 90% D2D) | Significant market |
| Direct sale | $4.49 (minus Stripe ~$0.50) | Highest margin |

## Channel Priority Matrix

| Priority | Channel | Why |
|----------|---------|-----|
| 1 | IngramSpark (print) | Widest retail and library reach |
| 2 | Amazon KDP (eBook) | Largest eBook market |
| 3 | Draft2Digital (wide eBook) | One upload, many platforms |
| 4 | Findaway (audiobook) | Wide audio distribution |
| 5 | Direct store | Highest margin, own customer data |
| 6 | NetGalley | ARC distribution to reviewers |
| 7 | Bookshop.org (affiliate) | Indie bookstore support + commission |
`;
