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
`;
