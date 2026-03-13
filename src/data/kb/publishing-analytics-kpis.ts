export const DOC_PUBLISHING_ANALYTICS = `# Publishing Analytics & KPIs

Dashboard definitions, benchmarks, and data sources for tracking Rüna Atlas publishing performance. Sourced from NYU MS Publishing "Publishing Analytics" course and *The Book Business* (Shatzkin & Riger).

## KPI Dashboard

### Tier 1: Critical Metrics (Review Weekly)

| KPI | Definition | Target | Alarm |
|-----|-----------|--------|-------|
| **Weekly unit sales** | Total units sold across all formats and channels | Trending upward | Week-over-week decline for 4+ weeks |
| **Revenue** | Net revenue received from all channels | On budget | 20%+ below forecast |
| **Pre-orders** | Units pre-ordered for upcoming titles | 100+ for lead titles | <25 two weeks before launch |
| **Amazon Best Seller Rank (BSR)** | Ranking within relevant categories | <100,000 (in-category <1,000) | >500,000 |

### Tier 2: Performance Metrics (Review Monthly)

| KPI | Definition | Target | Alarm |
|-----|-----------|--------|-------|
| **Sell-through rate** | Units sold / Units shipped | 60-80% | <50% |
| **Return rate** | Returned units / Total shipped | <15% | >25% |
| **Net revenue per title** | Total net revenue / Number of active titles | $5,000+ annually | <$2,000 |
| **Author ROI** | Net revenue / (Advance + editorial + marketing costs) | >1.5x Year 1; >3x lifetime | <1.0x after 2 years |
| **ACOS** (ad campaigns) | Ad spend / Ad-attributed revenue | 40-60% | >80% |
| **Email open rate** | Opens / Emails delivered | 30%+ | <20% |
| **Email click rate** | Clicks / Emails delivered | 3-5% | <1.5% |

### Tier 3: Strategic Metrics (Review Quarterly)

| KPI | Definition | Target | Alarm |
|-----|-----------|--------|-------|
| **Backlist % of revenue** | Revenue from titles 12+ months old / Total revenue | 40-60% | <20% (too frontlist dependent) |
| **Format mix** | % revenue by format (print / eBook / audio) | Diversified (no format >60%) | Single format >75% |
| **Channel diversification** | % revenue by channel | No channel >55% | Amazon >80% |
| **Series read-through** | Book 1 → Book 2 conversion | 35-50% | <25% |
| **Customer acquisition cost** | Marketing spend / New readers | Track and reduce | Increasing quarter over quarter |
| **Gross margin** | (Revenue - COGS) / Revenue | 55-65% | <45% |
| **Net margin** | Net income / Revenue | 10-20% | Negative for 2+ quarters |

## Benchmarks by Format

### Print

| Metric | Indie Publisher Benchmark | Big 5 Benchmark |
|--------|--------------------------|----------------|
| Avg. units sold (first year) | 500-2,000 | 5,000-20,000 |
| Typical sell-through | 50-65% | 55-70% |
| Return rate | 10-20% | 15-30% |
| Net revenue per unit (PB) | $2.50-4.00 | $3.00-5.00 |
| Print run size (if offset) | 500-2,000 | 5,000-50,000 |

### eBook

| Metric | Indie Publisher Benchmark | Big 5 Benchmark |
|--------|--------------------------|----------------|
| Avg. units sold (first year) | 500-3,000 | 5,000-30,000 |
| Revenue per unit | $2.50-3.50 | $3.00-7.00 |
| eBook % of total revenue | 30-50% | 20-35% |
| Price sweet spot | $3.99-5.99 | $9.99-14.99 |

### Audiobook

| Metric | Indie Publisher Benchmark |
|--------|--------------------------|
| Avg. units sold (first year) | 100-500 |
| Revenue per unit (Findaway wide) | $3.00-10.00 |
| Audio % of total revenue | 5-15% |
| Production cost | $1,500-5,000 |
| Break-even units | 150-500 |

## Benchmarks by Genre (SFF Focus)

| Subgenre | Avg. eBook Price | Avg. First-Year Sales | Ad Responsiveness |
|----------|-----------------|----------------------|------------------|
| Epic Fantasy | $4.99-6.99 | 1,000-5,000 | High (strong visual covers) |
| Space Opera | $3.99-5.99 | 800-4,000 | High |
| Dark Fantasy/Grimdark | $4.99-6.99 | 500-3,000 | Medium-High |
| Cosmic/Weird Horror | $3.99-5.99 | 400-2,000 | Medium |
| Afrofuturism | $4.99-6.99 | 300-2,000 | Medium (growing) |
| Literary SFF | $5.99-7.99 | 300-2,000 | Lower (review-driven) |

## Sales Velocity Tracking

### Amazon BSR Interpretation

| BSR Range | Approximate Daily Sales |
|-----------|----------------------|
| 1-1,000 | 50-500+ units/day |
| 1,000-5,000 | 10-50 units/day |
| 5,000-20,000 | 3-10 units/day |
| 20,000-50,000 | 1-3 units/day |
| 50,000-100,000 | 0.5-1 unit/day |
| 100,000-500,000 | ~1 unit every few days |
| 500,000+ | Very occasional sales |

### Launch Week Velocity Targets

| Title Tier | Week 1 Target | Week 1 Actions if Below Target |
|-----------|--------------|-------------------------------|
| Lead title | 200+ units all formats | Increase ad spend, emergency social push, outreach to influencers |
| Mid-list | 75-150 units | Boost Amazon Ads, email blast, consider BookBub deal application |
| Experimental | 25-75 units | Organic marketing, community push, patience |

## Seasonal Sales Patterns

| Month | Relative Sales Index | Notes |
|-------|---------------------|-------|
| January | 60 | Post-holiday slump; gift card redemption |
| February | 65 | Slight recovery |
| March | 70 | Spring momentum |
| April | 75 | Good general month |
| May | 70 | Pre-summer |
| June | 80 | Summer reading begins |
| July | 85 | Peak summer reading |
| August | 75 | Back-to-school transition |
| September | 80 | Fall reading season |
| October | 85 | Strong SFF/horror month |
| November | 90 | Pre-holiday buying |
| December | 100 | Peak (gift buying, holiday) |

## Data Sources

| Source | What It Provides | Access |
|--------|-----------------|--------|
| **Amazon Author Central** | Sales rank, reviews, customer demographics | Free (author account) |
| **Amazon KDP Dashboard** | eBook sales, KENP reads, royalty data | Free (publisher account) |
| **IngramSpark Dashboard** | Print sales, distribution reports | Free (publisher account) |
| **Ingram iPage** | Demand data, title analytics | Requires account |
| **NPD BookScan** | Retail print sales data (80% US market) | Paid subscription ($$$) |
| **Draft2Digital Dashboard** | Wide eBook sales | Free (publisher account) |
| **Findaway Dashboard** | Audiobook sales across channels | Free (publisher account) |
| **Google Analytics** | Website traffic, conversion | Free |
| **ConvertKit/Kit** | Email metrics, subscriber behavior | Included in plan |
| **Amazon Advertising Console** | Ad performance, ACOS, keyword data | Free with ads account |
| **Goodreads** | Ratings, reviews, shelf stats, add-to-shelf velocity | Free |
| **StoryGraph** | Ratings, reviews (growing platform) | Free |

## Reporting Cadence

| Report | Frequency | Audience | Content |
|--------|-----------|----------|---------|
| Sales flash | Weekly | Publisher, marketing | Units by title per format |
| Monthly roll-up | Monthly | Full team | Revenue, ad performance, channel mix |
| Title P&L | Monthly | Publisher, finance | Per-title revenue vs costs |
| Quarterly review | Quarterly | Stakeholders | Full business review, KPIs, strategy |
| Annual report | Annually | Stakeholders, authors | Year in review, catalog performance |

## Setting Targets

### SMART Framework for Publishing Goals

| Component | Example |
|-----------|---------|
| **S**pecific | Sell 500 print units of Title X in Q4 |
| **M**easurable | Track via IngramSpark + Amazon dashboards |
| **A**chievable | Based on comp title performance and marketing plan |
| **R**elevant | Supports annual revenue target |
| **T**ime-bound | By December 31, 2026 |
`;
