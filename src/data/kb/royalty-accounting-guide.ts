export const DOC_ROYALTY_ACCOUNTING = `# Royalty Accounting Guide

Comprehensive reference for calculating, reporting, and paying author royalties at Rüna Atlas. Covers methodology, statement format, advance earn-outs, subsidiary rights, and tax obligations.

## Royalty Calculation Methodology

Rüna Atlas uses the **net receipts model** for royalty calculations.

### Net Receipts Defined

**Net receipts** = Gross revenue received by the publisher from all sales channels, minus:
- Returns and refunds
- Shipping allowances (if applicable)
- Taxes collected on behalf of the buyer

Net receipts do **NOT** deduct:
- Publisher overhead
- Marketing expenses
- Production costs

### Standard Royalty Rates

| Format | Royalty Rate | Basis |
|--------|------------|-------|
| Print (paperback) | 10% of net receipts | Standard for trade |
| Print (hardcover) | 10-12% of net receipts | Higher for premium format |
| eBook | 25% of net receipts | Industry standard |
| Audiobook | 25% of net receipts | On audio revenue |
| Special editions | Negotiated | Typically 10-15% |

See the [Milestone-Based Payout Structure] KB document for information on milestone bonuses and escalating royalties.

### Calculating Net Receipts by Channel

| Channel | Gross Revenue | Deductions | Net Receipt to Publisher |
|---------|--------------|------------|------------------------|
| Amazon KDP (eBook, 70%) | $4.99 list | Amazon keeps 30% | $3.49 |
| Amazon KDP (eBook, 35%) | $0.99 list | Amazon keeps 65% | $0.35 |
| IngramSpark (PB, 55% disc) | $14.99 list | 55% wholesale discount + print cost | ~$2.75 |
| Apple Books (via D2D) | $4.99 list | Apple 30% + D2D 10% | $3.15 |
| Direct sale (eBook) | $4.99 list | Stripe ~$0.50 | $4.49 |
| Audible (non-exclusive) | Varies | Audible keeps 75% | ~25% of list |

### Example Calculation

**Title**: "Midnight Forge" by Author X
**Period**: July 1 - December 31, 2026
**Contract**: 10% print, 25% eBook, 25% audio on net receipts
**Advance**: $3,000

| Channel | Units Sold | Gross | Retailer/Dist Cut | Net Receipt | Royalty Rate | Royalty |
|---------|----------|-------|-------------------|-------------|-------------|---------|
| Amazon eBook | 500 | $2,495 | $748 | $1,747 | 25% | $436.75 |
| IngramSpark PB | 200 | $2,998 | $2,124 | $874 | 10% | $87.40 |
| Apple eBook | 100 | $499 | $175 | $324 | 25% | $81.00 |
| Findaway Audio | 75 | $975 | $585 | $390 | 25% | $97.50 |
| Direct eBook | 50 | $250 | $25 | $225 | 25% | $56.25 |
| **Total** | **925** | **$7,217** | — | **$3,560** | — | **$758.90** |

**Advance earn-out**: $3,000 advance - $758.90 = $2,241.10 still unearned
**Payment due**: $0 (advance not yet earned out)

## Advance Earn-Out Tracking

### How Advances Work

1. Publisher pays advance before/at publication
2. Royalties accrue against the advance
3. Author receives no additional payment until advance is "earned out"
4. Once earned out, author receives royalty payments going forward

### Tracking Template

| Period | Royalties Earned | Cumulative | Advance | Unearned Balance | Payment Due |
|--------|-----------------|-----------|---------|-----------------|-------------|
| H1 2026 | $758.90 | $758.90 | $3,000 | $2,241.10 | $0 |
| H2 2026 | $1,200.00 | $1,958.90 | $3,000 | $1,041.10 | $0 |
| H1 2027 | $1,500.00 | $3,458.90 | $3,000 | $0 | $458.90 |
| H2 2027 | $900.00 | $4,358.90 | $3,000 | $0 | $900.00 |

### Key Rules

- Advances are **non-refundable** — if the book never earns out, the author keeps the advance
- Advances are tax-deductible business expenses for the publisher in the year paid
- Track earn-out by title (advances don't cross-collateralize between titles unless contract specifies)

## Subsidiary Rights Income

Subsidiary rights income (translation rights, film/TV options, merchandise licensing) is split between publisher and author per contract terms.

### Standard Split

| Right | Publisher Share | Author Share |
|-------|---------------|-------------|
| Translation rights | 25% | 75% |
| Film/TV option | 15-25% | 75-85% |
| Merchandise licensing | 50% | 50% |
| Audio rights (sold separately) | 25% | 75% |
| First serial (excerpt) | 25% | 75% |
| Book club rights | 50% | 50% |

### Accounting for Sub Rights

- Record sub rights income separately from sales revenue
- Sub rights income counts toward advance earn-out
- Report sub rights income on royalty statement as a separate line item

## Agent Commission Handling

If the author has a literary agent:

- Agent typically receives **15% of author's share** (domestic) or **20%** (foreign)
- Payment flows: Publisher → Agent → Author (if agent is on the contract)
- **Or**: Publisher pays author directly; author pays agent separately (check contract)
- Always verify payment instructions with the agent

## Royalty Statement Template

Each semi-annual royalty statement should include:

### Header
- Publisher name and contact
- Author name and pen name
- Title(s) covered
- Statement period (dates)
- Statement date

### Per-Title Section
- Sales by format (units and revenue)
- Sales by channel (Amazon, Ingram, Apple, direct, etc.)
- Net receipts per channel
- Royalty calculation per format
- Returns and adjustments
- Subsidiary rights income (if any)
- Total royalties earned this period

### Summary
- Total royalties earned this period
- Cumulative royalties to date
- Advance amount
- Advance earn-out status
- Amount payable (or remaining unearned balance)
- YTD and lifetime sales figures

## Payment Schedule

| Payment Type | Timing | Method |
|-------------|--------|--------|
| Advance (on signing) | Within 30 days of contract execution | ACH or check |
| Advance (on publication) | Within 30 days of publication date | ACH or check |
| Royalty payments | Semi-annually (May 1 and November 1) | ACH or check |
| Sub rights income | Within 30 days of publisher receipt | ACH or check |

### Minimum Payment Threshold

- If royalties due are less than $25, carry forward to next period
- Author may request payment below threshold (we comply)

## Tax Obligations

### US Authors

- Collect W-9 before first payment
- Issue 1099-NEC annually (if $600+ paid in calendar year)
- 1099s due to authors by January 31
- File 1099s with IRS by March 31

### International Authors

- Collect W-8BEN or W-8BEN-E
- Withhold 30% for federal tax (unless tax treaty reduces rate)
- Tax treaty rates vary by country (commonly 0-15% for many countries)
- Issue 1042-S annually for amounts paid to foreign persons
- Consult tax professional for country-specific compliance

### Record Keeping

- Retain all royalty statements for 7 years
- Retain all payment records for 7 years
- Retain all tax forms (W-9, W-8, 1099, 1042-S) for 7 years
- Retain contracts indefinitely (or duration of rights)

## Audit Rights

Standard publishing contracts include author audit rights:

- Author may audit publisher's books **once per year**
- Author gives **30 days written notice** before audit
- Audit is at **author's expense** (unless discrepancy >5%, then publisher pays)
- Keep clean, auditable records — this is a legal obligation
`;
