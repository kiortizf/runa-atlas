export const DOC_INGRAM = `# Working with Ingram

Ingram (via IngramSpark) is Rüna Atlas Press's primary print-on-demand and distribution partner. This document covers setup, optimization, and ongoing management of our Ingram relationship.

## Why Ingram

- **Global distribution**: Ingram's catalog feeds 40,000+ retailers, libraries, and online stores worldwide
- **Print-on-demand**: No inventory risk — books printed per order
- **Credibility**: Titles in Ingram catalog signal professional publisher to bookstores
- **Returnability**: Returnable terms make bookstores comfortable stocking our titles
- **Amazon integration**: Ingram orders fulfill Amazon listings (no need for KDP Print separately)

## Account Setup

### Publisher Account Details

- **Account type**: Publisher (not self-publishing)
- **Imprints registered**: Bohío Press, Void Noir
- **ISBN prefix**: Registered with Bowker under Rüna Atlas Press
- **Payment**: Direct deposit, Net 90 from end of month of sale

### Key Settings

| Setting | Rüna Atlas Standard |
|---------|-------------------|
| Wholesale discount | 55% (required for returnability) |
| Returnability | Yes — Deliver (bookstores can return unsold copies) |
| Print quality | Standard 55 (cream/white options per title) |
| Distribution | Global (US, UK, EU, AU, CA + expanded) |

## Title Setup Process

### Required Materials

1. **Print-ready interior PDF** — PDF/X-1a, 300dpi, fonts embedded
2. **Print-ready cover PDF** — Full wrap, CMYK, 300dpi, spine width calculated
3. **ISBN** — Registered with Bowker, barcode on cover
4. **Metadata** — Title, author, description, BISAC codes, price

### Spine Width Calculation

Use IngramSpark's spine width calculator:
- White paper: page count × 0.002252"
- Cream paper: page count × 0.0025"
- Add cover stock thickness (0.06" for 10pt C1S)

### Metadata Best Practices

- **Description**: Write for humans first, SEO second. 150-300 words.
- **BISAC codes**: Select 3 codes. Primary should be the most specific match.
- **Keywords**: 7-10 keywords covering genre, themes, comp authors, and audience
- **Series info**: Always include series name and volume number if applicable
- **Contributor roles**: Author, editor, illustrator, translator — all entered

## Pricing Strategy

### Print Pricing Formula

Minimum viable price = Manufacturing cost ÷ (1 - Wholesale discount)

**Example**:
- 300-page novel, cream, 5.5×8.5", perfect bind
- Manufacturing cost: ~$4.50
- At 55% discount: $4.50 ÷ 0.45 = $10.00 minimum
- Recommended retail: $16.99-$18.99 (build in margin)

### Price Points by Format

| Format | Price Range |
|--------|-----------|
| Trade paperback (5.5×8.5") | $15.99–$18.99 |
| Trade paperback (6×9") | $17.99–$21.99 |
| Hardcover | $27.99–$34.99 |
| Mass market (where applicable) | $8.99–$12.99 |

## Proof Process

1. Upload files to IngramSpark
2. Digital proof generated (review online within 24-48 hours)
3. Order physical proof ($15-30 + shipping)
4. Review physical proof for print quality, trim accuracy, color
5. Approve proof to go live
6. **Never skip the physical proof** — digital proofs miss binding, color, and trim issues

## Ongoing Management

### Monthly Tasks

- Check sales reports (IngramSpark dashboard)
- Review and respond to any file issues or alerts
- Monitor returnability and return rates
- Check title availability across key retailers

### Quarterly Tasks

- Review pricing against market and costs
- Update metadata (new reviews, awards, description updates)
- Replace files if errata discovered
- Review and optimize BISAC codes

### Annual Tasks

- Reconcile Ingram revenue against royalty statements
- Review wholesale discount strategy
- Assess whether any titles should move to offset printing
- Update account information (contact, payment details)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| File rejected on upload | Check PDF/X-1a compliance, font embedding, page count/trim match |
| Spine width mismatch | Recalculate using IngramSpark calculator, regenerate cover |
| Title not appearing on Amazon | Wait 6-8 weeks after approval, check Amazon listing settings |
| Returns too high | Assess if title is getting placed in wrong sections (BISAC issue) |
| Print quality concerns | Order proof, compare to PDF, contact Ingram support if defective |

## IngramSpark Print Cost Formula (2025/2026)

### Per-Unit Cost Calculation

> **Print Cost = (Page Count × Per-Page Rate) + Cover Cost**

| Component | B&W Cream | B&W White | Standard Color | Premium Color |
|-----------|----------|----------|----------------|---------------|
| Per-page rate | $0.013 | $0.013 | $0.04 | $0.07 |
| PB cover (matte/gloss) | $0.85 | $0.85 | $0.85 | $0.85 |
| HC case laminate cover | $2.50 | $2.50 | $2.50 | $2.50 |
| HC dust jacket cover | $3.50 | $3.50 | $3.50 | $3.50 |

### Publisher Compensation Formula

> **Compensation = (List Price × (1 − Wholesale Discount)) − Print Cost − Market Access Fee**

### 2025/2026 Fee Schedule

| Fee | Amount | Notes |
|-----|--------|-------|
| Title setup | Free | No setup fees since May 2023 |
| Revision fee | $25 | After 60-day free revision window |
| Market Access Fee | 1.875% of list price | Global distribution fee (effective Feb 2026) |
| Returns processing | Absorbed by publisher | Via reduced compensation |

### Worked Example: 320-page Trade Paperback

| Step | Calculation | Amount |
|------|-----------|--------|
| List price | Set by publisher | $16.99 |
| Wholesale discount (55%) | $16.99 × 0.55 | −$9.34 |
| Gross to publisher | $16.99 − $9.34 | $7.65 |
| Print cost | 320 × $0.013 + $0.85 | −$5.01 |
| Market Access Fee | $16.99 × 0.01875 | −$0.32 |
| **Net compensation** | | **$2.32** |

## IngramSpark iPage Dashboard Guide

iPage is Ingram's business intelligence platform for publishers.

### Key Features

| Feature | What It Shows |
|---------|------------|
| Title Demand | Units ordered by retailers, libraries, schools |
| Retailer Activity | Which retailers are ordering your titles |
| Return Reports | Return rates by title and channel |
| Sales History | Historical sales data with filters |
| Inventory Status | POD availability and any supply issues |
| Market Intelligence | Category trends and comp title data |

### Monthly iPage Review Checklist

- [ ] Check demand reports for each active title
- [ ] Identify top-performing retail channels
- [ ] Monitor return rates (flag >15%)
- [ ] Compare month-over-month sales trends
- [ ] Review any new retailer pickups

## Lightning Source vs. IngramSpark

| Feature | IngramSpark | Lightning Source |
|---------|-------------|----------------|
| Target user | Self-published authors, small publishers | Established publishers |
| Account setup | Easy online | Requires application |
| Title setup fee | Free | Free |
| Print quality | Same print network | Same print network |
| Dashboard | Modern, user-friendly | More detailed reporting |
| Compensation calculator | Built-in | Available |
| Support | Online, email | Dedicated rep (at volume) |
| Volume thresholds | Any volume | Better for 5+ titles |
| **Rüna Atlas recommendation** | **Use for now** | **Consider at 15+ titles** |

## Title Setup Step-by-Step

1. **Prepare files**: Interior PDF (PDF/X-1a), cover PDF (full wrap, calculated spine)
2. **Log into IngramSpark** → "Add A New Title"
3. **Enter metadata**: Title, subtitle, contributors, description
4. **Select specifications**: Trim size, paper, binding, interior color
5. **Set pricing**: List price per currency/territory
6. **Set distribution**: Wholesale discount (55%), returnability (Yes)
7. **Upload files**: Interior PDF, cover PDF
8. **Review digital proof**: Check for layout, font, image issues
9. **Order physical proof**: $15-30 + shipping — ALWAYS do this
10. **Approve title**: Goes live in catalog within 24-48 hours
11. **Verify listings**: Check Amazon, B&N, Bookshop.org within 2-8 weeks

## Bulk Printing Discounts

| Quantity | Discount | Best For |
|----------|---------|----------|
| 1 (POD) | None | Standard orders |
| 100+ | ~15% | Author events, signings |
| 250+ | ~20% | Local bookstore consignment |
| 500+ | ~25% | Conference sales, bulk orders |
| 1,000+ | ~30% | Consider offset printing comparison |
| 2,000+ | Compare offset | Get quotes from offset printers |
`;
