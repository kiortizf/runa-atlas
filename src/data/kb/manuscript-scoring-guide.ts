export const DOC_MANUSCRIPT_SCORING_GUIDE = `# Manuscript Scoring Intelligence Dashboard — Complete User Guide

The Manuscript Scoring Dashboard is the most advanced manuscript evaluation system ever built. It combines 15 analytical modules across three tiers to provide a multi-dimensional assessment of any manuscript under consideration for acquisition.

This guide covers every system end-to-end: what it does, how to use it, and how to interpret results.

---

## Getting Started

### Accessing the Dashboard

1. Navigate to **Admin Console** → **Publishing** → **Manuscript Scoring**
2. Or use **Quick Find** (top-left search) and type "Manuscript Scoring"

### Initial Setup

Before scoring, fill in the manuscript header fields:

| Field | Description | Tip |
|-------|-------------|-----|
| **Manuscript Title** | Working title of the submission | Use the title as submitted |
| **Author** | Author's name | Use pen name if applicable |
| **Word Count** | Total manuscript length | Affects unit economics |
| **Genre** | Primary genre category | Influences comp analysis and market sizing |
| **Submission Date** | When the manuscript was received | Tracks pipeline velocity |
| **Agent/Source** | Who submitted it | Helps track pipeline sources |
| **First Reader** | Person doing the initial evaluation | Accountability and context |

> **Tip:** Fill these in first — they feed into the Acquisition Memo and Report Generator automatically.

---

## Tier 1: CORE Systems (Row 1)

These seven tabs form the foundation of every manuscript evaluation.

---

### 1. Rubric (⭐)

**What it does:** Scores the manuscript across 30 individual criteria organized into 5 weighted categories.

**Categories & Weights:**

| Category | Weight | What It Measures |
|----------|--------|-----------------|
| Literary Merit | 30% | Prose quality, plot architecture, character depth, thematic resonance, emotional impact, world-building |
| Market Viability | 25% | Genre positioning, comp title alignment, audience size, trend alignment, hook/pitch strength |
| DEI & Representation | 15% | Authentic representation, own-voices alignment, sensitivity considerations |
| Author Platform | 15% | Social media following, prior publications, media-readiness, brand alignment |
| Production Feasibility | 15% | Word count fit, editorial scope needed, cover art potential, format suitability |

**How to Score:**

- Each criterion uses a 1–10 scale
- Hover over the **ⓘ** icon next to each criterion for scoring guidance
- The system shows five descriptors per criterion to calibrate your scoring
- Click each category header to expand/collapse

**Reading the Results:**

- **Composite Score** — Weighted average across all 30 criteria (shown as percentage)
- **Grade** — Letter grade (A+ through F)
- **Recommendation** — One of: STRONG ACQUIRE, ACQUIRE, CONDITIONAL ACQUIRE, CONSIDER, REVISE & RESUBMIT, DECLINE WITH ENCOURAGEMENT, PASS
- **Category breakdown** — Each of the 5 categories shows its individual weighted score
- **Strengths & Weaknesses** — Top 5 highest and lowest scored criteria

> **Important:** The composite score is always visible at the top of every tab, so you can see the overall verdict regardless of which system you're viewing.

> **Tip:** Don't rush the rubric. It takes 15–20 minutes for a thorough evaluation. The rubric is the backbone — all other systems add context and color.

---

### 2. Narrative Genome (📊)

**What it does:** Analyzes the manuscript's story structure DNA — its narrative shape, emotional arc, tension curve, and pacing rhythm.

**How to Use:**

1. Select the manuscript's **story archetype** from the dropdown (Rags to Riches, Man in a Hole, Cinderella, etc.)
2. Enter the **number of chapters** or major story beats
3. For each chapter, score:
   - **Emotion** (0–100): emotional intensity
   - **Tension** (0–100): suspense/stakes level
   - **Pacing** (0–100): how fast the chapter moves
4. The system generates the narrative curves and compares them to the ideal archetype

**Reading the Results:**

- **Arc Match** — How closely the manuscript's emotional arc matches the selected archetype
- **Pacing Diagnosis** — Whether pacing is too front-loaded, sagging in the middle, or well-distributed
- **Tension Analysis** — Identifies tension drops and dead zones
- **Narrative Shape Visualization** — Color-coded SVG curve showing the story's shape over time

> **Tip:** A "perfect" arc match isn't always desirable. Literary fiction often subverts archetypes intentionally. Use this as diagnostic data, not a prescriptive mandate.

> **Important:** Pay special attention to the "sagging middle" detection. If the system flags a tension drop between 30–60% of the manuscript, that's a common reason readers abandon books.

---

### 3. Market Intel (📈)

**What it does:** Provides competitive market analysis with comp title identification, market sizing, and positioning recommendations.

**How to Use:**

1. Review and adjust the auto-populated comp titles
2. Set sales data for each comp (units sold, format, price point)
3. The system calculates market positioning relative to comps

**Key Metrics:**

- **Comp Average Sales** — Median sales across comparable titles
- **Market Size Estimate** — Total addressable market for this genre/niche
- **Positioning Recommendation** — Where this title fits relative to comps

> **Tip:** Always include at least 3–5 comp titles from the last 3 years. Older comps skew the analysis because market conditions change rapidly.

---

### 4. Portfolio Theory (📊)

**What it does:** Applies Modern Portfolio Theory (from finance) to the book catalog. Treats each title as an "investment asset" and evaluates how adding this manuscript affects the portfolio's overall risk-return profile.

**How to Use:**

1. The system displays the current catalog as a portfolio
2. Each title has an expected return (revenue) and risk (variance in sales)
3. Toggle "Add New Manuscript" to simulate portfolio impact
4. The **Efficient Frontier** curve shows optimal portfolio compositions

**Key Metrics:**

| Metric | What It Means |
|--------|--------------|
| **Sharpe Ratio** | Risk-adjusted return — higher is better. Above 1.0 is strong. |
| **Portfolio Variance** | How volatile the catalog's combined revenue is |
| **Diversification Benefit** | How much this title reduces overall portfolio risk |
| **Correlation** | How this title's expected performance correlates with existing titles |

> **Important:** A manuscript can score well on the rubric but poorly on Portfolio Theory if the catalog is already oversaturated in that genre. This is by design — it prevents "all eggs in one basket" scenarios.

> **Tip:** If a manuscript has a *negative* correlation with existing titles, that's often excellent — it means when your fantasy titles dip, this one rises, smoothing revenue.

---

### 5. Reader Genome (👥)

**What it does:** Models the complete reader acquisition funnel — from awareness to purchase to advocacy — and calculates viral growth potential.

**How to Use:**

1. Set the target audience size and demographics
2. Adjust channel parameters (social, email, ads, bookstore, word-of-mouth)
3. Set estimated conversion rates per funnel stage

**Key Metrics:**

| Metric | What It Means | Good Target |
|--------|--------------|-------------|
| **K-Factor** | Viral coefficient — each reader brings this many new readers | > 0.7 |
| **LTV/CAC Ratio** | Lifetime value divided by cost to acquire | > 3.0× |
| **Funnel Efficiency** | % of aware readers who eventually purchase | > 2% |
| **Advocacy Rate** | % of readers who actively recommend the book | > 15% |

> **Tip:** The K-Factor is the most underrated metric in publishing. A book with K-Factor > 1.0 grows exponentially through word-of-mouth. This is how breakout hits happen.

---

### 6. Offer (💲)

**What it does:** Financial modeling for the acquisition deal — advance calculation, P&L projections, break-even analysis.

**How to Use:**

1. Set list price, net revenue per unit, and comp average sales
2. Enter cost estimates (editorial, design, marketing)
3. The system calculates recommended advance, break-even, and earn-out probability

**Key Outputs:**

- **Recommended Advance** — Data-driven advance recommendation (40% of projected net)
- **Break-even Units** — Number of copies needed to cover investment
- **Earn-out Probability** — Likelihood the book earns out its advance
- **Risk Level** — LOW / MODERATE / HIGH based on composite score

> **Tip:** The recommended advance is conservative by design. If you're competing for a book, you may need to go higher — but know the risk.

---

### 7. Acquisition Memo (📝)

**What it does:** Auto-generates a formatted acquisition memo suitable for editorial board presentation.

The memo pulls data from all other tabs and formats it into a professional document including manuscript summary, scoring breakdown, financial projections, risk assessment, and editorial recommendation.

> **Important:** Always review and customize the auto-generated memo. It provides the data framework, but your editorial voice and personal assessment should shine through.

---

## Tier 2: ADVANCED Intelligence (Row 2)

These four systems go beyond traditional evaluation with unprecedented analytical approaches.

---

### 8. Decision Genome (🔀)

**What it does:** Models every publishing decision as a probabilistic cascade tree — like a chess engine for publishing. It maps the chain reaction of choices (cover style → price point → format → print run → marketing spend → timing) and their compound effects on outcome.

**How to Use:**

1. Set the **decision nodes**: cover type, price point, format, timing, print run, marketing budget
2. For each node, adjust the probability of each outcome
3. Click **Run Monte Carlo** to simulate 10,000 scenarios
4. Review the probability distribution of outcomes

**Key Features:**

- **Cascade Flow Map** — Visual decision tree showing how choices chain together
- **Monte Carlo Simulation** — 10,000 randomized runs showing the probability distribution of revenue outcomes
- **Sensitivity Analysis (Tornado Chart)** — Which decision has the biggest impact on the final outcome
- **Expected Value** — Probability-weighted average revenue across all simulations

**Reading the Tornado Chart:**

The tornado chart ranks decisions by impact:
- The widest bar = the decision that matters most
- If "Marketing Budget" has the widest bar, that's where to focus resources
- If "Cover Style" has a narrow bar, the cover choice doesn't significantly affect the outcome

> **Tip:** Run the Monte Carlo simulation AFTER adjusting the decision nodes. The default values are generic — customize them for the specific manuscript and market.

> **Important:** Pay attention to the downside tail of the Monte Carlo distribution. A scenario with high expected value but a long left tail (lots of bad outcomes) is riskier than one with a shorter tail.

---

### 9. Catalog Synergy (🕸️)

**What it does:** Uses network science to model how books in the catalog cross-pollinate readers. It calculates which existing titles would share readers with the new manuscript and estimates cross-sell lift.

**How to Use:**

1. Review the **network graph** showing connections between titles
2. The thickness of edges (lines) shows Jaccard similarity between titles
3. Click any node to see its specific synergy relationships
4. Review the "Synergy Score" — overall compatibility with the existing catalog

**Key Metrics:**

| Metric | What It Means |
|--------|--------------|
| **Synergy Score** | 0–100 overall compatibility with catalog |
| **Jaccard Similarity** | Shared reader overlap between specific titles (0–1, higher = more overlap) |
| **Cross-sell Lift** | Estimated % increase in sales from catalog visibility |
| **Network Centrality** | How connected this title would be in the catalog ecosystem |

> **Important:** A high synergy score means this book plugs into your existing reader network naturally. Readers of your existing titles are likely to also be interested in this one. This is the compound interest of catalog building.

> **Tip:** Look for titles that are "bridge nodes" — books that connect two otherwise separate reader communities in your catalog. These are strategically the most valuable acquisitions.

---

### 10. Cultural Zeitgeist Mapper (🌍)

**What it does:** Maps the manuscript's themes against current cultural conversations to identify resonance and optimal timing. Uses a 12-axis cultural framework with Rogers adoption S-curves.

**How to Use:**

1. Identify the manuscript's core themes (the system detects common themes)
2. For each theme, the system shows current cultural momentum:
   - **Rising** — theme is gaining cultural traction (ideal)
   - **Peak** — theme is at maximum saturation (risky — may decline before publication)
   - **Declining** — theme conversation is waning (caution)
   - **Emerging** — very early stage, potential to ride the wave

**The 12 Cultural Axes:**

| Axis | Example Themes |
|------|---------------|
| Social Justice | Race, equity, systemic change |
| Technology | AI, social media, surveillance |
| Environment | Climate, sustainability, eco-anxiety |
| Gender & Identity | Non-binary, masculinity, women's rights |
| Mental Health | Anxiety, trauma, neurodivergence |
| Economic | Inequality, gig economy, housing |
| Political | Democracy, populism, polarization |
| Spiritual | Secular spirituality, mindfulness |
| Generational | Millennial burnout, Gen Z identity |
| Global | Immigration, cultural exchange |
| Science | Pandemic, genetics, space |
| Cultural Nostalgia | Retro, comfort media, analog revival |

**Reading the Results:**

- **Resonance Score** — How well the manuscript's themes align with current cultural conversation
- **Timing Window** — Optimal publication window based on theme momentum
- **Risk Assessment** — Whether any themes are in decline trajectory

> **Tip:** The sweet spot is a theme at "Rising" stage — it's gaining momentum but hasn't peaked. Publishing 12–18 months later, it hits the mainstream just as the book comes out.

> **Important:** Avoid themes at "Peak" unless your publication timeline is < 6 months. Cultural conversations move fast — what's hot today may be exhausted in a year.

---

### 11. Author Career Arc Modeler (📅)

**What it does:** Projects an author's career trajectory across multiple books using a physics-based model that accounts for sales momentum, platform compounding, sophomore slump risk, and breakout potential.

**How to Use:**

1. Enter the author's publishing history (books, sales, genre)
2. Set genre-specific parameters (baseline velocity, decay rate)
3. Review the multi-book trajectory projection
4. Note the **breakout probability** and **inflection point**

**Key Concepts:**

- **Momentum Model** — Each book's sales influence the next book's baseline. Success compounds.
- **Sophomore Slump** — Built-in model for the common second-book sales dip (typically 15–30% decline)
- **Platform Compounding** — Author platform grows with each book release, improving future sales
- **Breakout Threshold** — The sales level at which word-of-mouth goes exponential

**Key Metrics:**

| Metric | What It Means |
|--------|--------------|
| **Trajectory Grade** | A–F: projected career arc health |
| **Break-even Book** | Which book in the series is expected to earn out cumulative investment |
| **Breakout Probability** | % chance the author achieves exponential sales growth |
| **5-Year Projected Revenue** | Estimated cumulative revenue across the projected catalog |
| **Sophomore Slump Risk** | Estimated declne for Book 2 vs. Book 1 |

> **Tip:** First-time authors with strong platforms (social media, newsletter, podcast) have 3× higher breakout probability than those without. Factor this heavily.

> **Important:** For debut authors, the trajectory model is inherently uncertain. Use the confidence interval, not the point estimate. The range is wide by design.

---

## Tier 3: INTEL Suite (Row 3)

These four systems synthesize, automate, compare, and report across all other systems.

---

### 12. Cross-System Synthesis Engine (🎯)

**What it does:** The "mission control" dashboard. Pulls scores from all 8 intelligence systems and synthesizes them into a single unified verdict with consensus analysis, risk quantification, and strategic recommendation.

**THIS IS THE TAB YOU SHOULD REVIEW LAST** — after populating scores in all other tabs.

**How to Use:**

1. Navigate to each of the other tabs and complete your evaluation
2. Return to Synthesis and adjust the system scores to match what you found
3. Use the sliders to input each system's score (0–100) and confidence (0–100)
4. The engine automatically calculates the unified assessment

**Key Features:**

- **8-System Radar Chart** — Gold polygon shows scores, purple shows confidence. Where they diverge, the score is uncertain
- **Signal Alignment** — How many systems agree: e.g., "6↑ 2→ 0↓" means 6 positive, 2 neutral, 0 negative
- **Consensus Verdict** — STRONG CONSENSUS / MAJORITY POSITIVE / MIXED SIGNALS / MAJORITY NEGATIVE
- **Red Flag Detection** — Automatically surfaces cross-system contradictions
- **Executive Summary** — Auto-generated 3-paragraph summary ready for board presentation
- **Confidence-Adjusted Composite** — Systems with higher confidence get more weight in the final score

**Reading the Radar Chart:**

- If gold (score) and purple (confidence) polygons are similar in shape, your data is reliable
- Large gaps between gold and purple mean some systems have low-confidence data
- An asymmetric shape reveals dimensional imbalances worth investigating

> **Important:** The "Red Flags" section is the most valuable output. If the Decision Genome says ROI is strong but Portfolio Theory says you're overexposed in this genre, that contradiction needs human discussion.

> **Tip:** The confidence slider is just as important as the score slider. A system you barely used should have low confidence. One you deeply analyzed should have high confidence. This mathematically de-weights uncertain data.

---

### 13. AI Narrative Auto-Analysis (🧠)

**What it does:** Connects to Google Gemini API to auto-analyze manuscript text. Paste a chapter or full manuscript and receive a structured narrative analysis that matches the Narrative Genome framework.

**Prerequisites:**

- A \`GEMINI_API_KEY\` must be set in your \`.env\` file
- The \`@google/generative-ai\` npm package is installed

**How to Use:**

1. Paste manuscript text into the text area (2,000–10,000 words recommended)
2. Click **"Analyze with AI"**
3. Wait for Gemini to process (typically 10–30 seconds)
4. Review the structured output

**What AI Returns:**

| Section | Description |
|---------|------------|
| **Overall Assessment** | 2–3 sentence quality summary |
| **Emotional Arc** | 5-point emotional intensity curve (Opening → Climax → Resolution) |
| **Tension Curve** | Stakes, Conflict, Suspense, and Payoff ratings |
| **Pacing Analysis** | Scene tempo, information pacing, rhythm variation |
| **Character Depth** | Per-character complexity score, arc description, voice quality |
| **Thematic DNA** | Identified themes with strength and subtlety analysis |
| **Prose Fingerprint** | Voice consistency, metaphor density, dialogue authenticity, rhythm |
| **Story Shape** | Classification (Rags to Riches, Man in a Hole, etc.) |
| **AI Comparisons** | 3 comparable published titles identified by AI |
| **Improvement Suggestions** | 3 specific suggestions for editorial focus |

> **Tip:** For best results, paste a full chapter (3,000–5,000 words) rather than isolated paragraphs. The AI needs context to assess pacing and arc.

> **Important:** AI analysis is a starting point, NOT a replacement for human editorial judgment. Use it to calibrate your own reading — if the AI sees something you missed, go back and look at the text.

> **Tip:** You can use the AI Analysis output to auto-populate the Narrative Genome tab. Match the emotional arc values and story shape from the AI output to the manual inputs.

---

### 14. Comparative Manuscript War Room (⚔️)

**What it does:** Side-by-side comparison of two manuscripts across all 8 intelligence dimensions with dual radar overlay, head-to-head bar battles, dimension wins, and automated acquisition recommendation.

**When to Use:**

- When you have 2 manuscripts competing for the same acquisition slot
- When budget allows only one acquisition this quarter
- When comparing a revision against the original submission
- When evaluating different editions or format strategies

**How to Use:**

1. Set up **Manuscript A** (title, author, genre, word count)
2. Set up **Manuscript B** with the same fields
3. For each manuscript, enter scores across all 8 dimensions using the sliders
4. The system generates the comparison automatically

**Key Features:**

- **Dual Radar Overlay** — Gold (A) and Blue (B) polygons layered on the same chart. Where one extends past the other, that's the stronger manuscript on that dimension.
- **Head-to-Head Bar Battles** — Side-by-side horizontal bars for each dimension with winner indicators (↑ or ↓)
- **Dimension Wins** — Tally of how many dimensions each manuscript wins (e.g., A: 5, Tie: 1, B: 2)
- **Composite Comparison** — Overall composite scores side by side
- **Consistency (σ)** — Standard deviation of scores across dimensions. Lower = more consistent scorer.
- **Automated Recommendation** — The system recommends which manuscript to acquire based on composite and wins

> **Tip:** Don't just look at the composite — look at where each manuscript wins. A manuscript that scores 60/100 in everything may lose to one that scores 90 in three critical dimensions and 40 in others. The "right" choice depends on your catalog strategy.

> **Important:** A "TIE" verdict (within 2 points) means the decision genuinely needs human judgment. Convene the editorial board, don't try to break the tie by gaming scores.

---

### 15. Acquisition Report Generator (📄)

**What it does:** One-click generation of a comprehensive acquisition report combining all intelligence layers into a formatted document, ready for editorial board review, printing, or clipboard copying.

**How to Use:**

1. Fill in manuscript details (title, author, genre, word count, evaluator)
2. Enter the scores from each intelligence system (8 system scores)
3. Set financial projections (estimated sales, advance, projected revenue, break-even)
4. Write qualitative notes (strengths, weaknesses, market context, editorial notes)
5. Click **"Generate Acquisition Report"**
6. The formatted report appears in-page

**Report Sections:**

| Section | Contents |
|---------|----------|
| **Header** | Title, author, genre, submission date, evaluator |
| **Executive Summary** | Composite score, grade, recommendation |
| **Intelligence System Scores** | 8-system table with visual bars |
| **Key Strengths** | Your qualitative strength assessment |
| **Key Weaknesses** | Your qualitative weakness assessment |
| **Market Context** | Market analysis summary |
| **Financial Summary** | Estimated sales, advance, revenue, ROI |
| **Editorial Notes** | Your detailed editorial assessment |
| **Footer** | Generation date and confidentiality notice |

**Actions:**

- **Copy Report** — Copies report text to clipboard for pasting into email or documents
- **Print** — Opens browser print dialog for PDF or paper printing
- **Back to Editor** — Return to the form to make adjustments before regenerating

> **Tip:** Write the qualitative fields (strengths, weaknesses, market context, editorial notes) carefully. These are the parts the editorial board actually reads. The numbers get a glance; the narrative drives the discussion.

> **Important:** The report is marked "Confidential — Rüna Atlas Press" by default. Treat it as such — these are internal evaluation documents.

---

## Workflow: Recommended Evaluation Process

Here's the optimal order for evaluating a manuscript end-to-end:

### Step 1: Header Setup (2 minutes)
Fill in title, author, word count, genre, date, agent, and reader.

### Step 2: Rubric Score (15–20 minutes)
Work through all 30 criteria. Don't skip any. This is the foundation.

### Step 3: Narrative Genome (10 minutes)
Select the story archetype and score 5–10 key chapters for emotion, tension, and pacing.

### Step 4: AI Analysis (Optional, 5 minutes)
If you have manuscript text in digital format, paste it into the AI Analysis tab for a second opinion.

### Step 5: Market Intel (10 minutes)
Identify 3–5 comp titles and enter their sales data.

### Step 6: Portfolio Theory (5 minutes)
Review how this title affects your catalog's risk-return profile.

### Step 7: Reader Genome (5 minutes)
Model the target audience and estimate funnel metrics.

### Step 8: Decision Genome (10 minutes)
Set the key decision variables and run a Monte Carlo simulation.

### Step 9: Catalog Synergy (5 minutes)
Review the network graph and synergy score.

### Step 10: Cultural Zeitgeist (5 minutes)
Check thematic alignment with current cultural conversations.

### Step 11: Author Arc (5 minutes)
For non-debut authors, model the career trajectory. For debuts, note the baseline uncertainty.

### Step 12: Synthesis Engine (5 minutes)
Input all system scores and confidence levels. Review the unified verdict.

### Step 13: Generate Report (5 minutes)
Pull everything into a formatted acquisition report for the editorial board.

**Total time: 80–90 minutes for a thorough, world-class evaluation.**

---

## Tips, Tricks & Best Practices

### General

- **Start with the Rubric, end with Synthesis.** The Rubric sets the baseline; Synthesis pulls everything together.
- **Use confidence levels honestly.** A system you barely used should have low confidence. This mathematically de-weights it.
- **The dashboard is a TOOL, not a RULER.** High scores don't automatically mean "acquire." Low scores don't automatically mean "pass." The dashboard informs human judgment.

### Scoring

- **Calibrate with a known book first.** Before scoring new manuscripts, score a published title you're familiar with. This calibrates your scale.
- **5/10 is "competent, not remarkable."** Many readers anchor at 7–8. A true 5 is average. Score honestly.
- **Genre matters for context.** A 6/10 on prose quality in commercial fiction might correspond to an 8/10 expectation in literary fiction. Keep genre norms in mind.

### Financial

- **The advance recommendation is conservative.** It assumes 40% of projected net revenue. In competitive situations, you may offer more — but you're knowingly taking more risk.
- **Break-even calculation includes all costs.** Editorial, design, marketing, AND the advance itself. It's total investment, not just the advance.

### Red Flags to Watch For

| Red Flag | What It Means |
|----------|--------------|
| High rubric score + Low portfolio fit | Great book, but you're overexposed in this genre |
| High zeitgeist + Declining theme | The conversation may end before publication |
| High synergy + Low reader genome | Cross-sell potential is there, but acquisition cost is too high |
| High decision ROI + High variance | Looks profitable on average, but big downside tail |
| Low trajectory + High rubric | Author may not sustain sales momentum across books |
| Strong AI analysis + Weak rubric score | You may have scored too harshly — re-evaluate |

---

## Glossary

| Term | Definition |
|------|-----------|
| **Composite Score** | Weighted average across all rubric criteria (0–100%) |
| **Sharpe Ratio** | Risk-adjusted return in Portfolio Theory. Higher = better. |
| **K-Factor** | Viral coefficient in Reader Genome. >1.0 = exponential growth |
| **LTV/CAC** | Lifetime value to customer acquisition cost ratio |
| **Monte Carlo Simulation** | 10,000 randomized scenario runs to model outcome probability |
| **Jaccard Similarity** | Measure of reader overlap between two books (0–1) |
| **Resonance Score** | Cultural alignment percentage in Zeitgeist Mapper |
| **Sophomore Slump** | Expected sales decline for an author's second book |
| **Signal Alignment** | Number of intelligence systems agreeing on the verdict |
| **Efficient Frontier** | Optimal risk-return combinations in Portfolio Theory |
| **Tornado Chart** | Sensitivity analysis showing which decisions have the most impact |
| **Cascade Flow Map** | Visual decision tree showing how choices compound |
| **Network Centrality** | How connected a title is in the catalog synergy network |
| **Breakout Probability** | Chance an author's sales curve goes exponential |
| **Confidence-Adjusted Composite** | Composite that weights high-confidence systems more heavily |

---

## Frequently Asked Questions

**Q: Can I share the generated report outside the organization?**
A: No. Reports are marked Confidential and contain proprietary evaluation methodology.

**Q: How accurate is the AI Narrative Analysis?**
A: It's a strong first pass — comparable to a skilled first reader. Always pair with human editorial judgment.

**Q: What if the systems disagree with each other?**
A: That's expected and valuable! Disagreement surfaces the specific dimensions that need discussion at the editorial board. Use the Synthesis Engine's Red Flags section.

**Q: How often should I recalibrate my scoring?**
A: Score a "calibration book" (a published title you know well) every quarter. Compare your scores to market reality and adjust your baseline.

**Q: What's the minimum word count for AI Analysis?**
A: 50 characters minimum to activate the button, but we recommend 2,000+ words for meaningful analysis. Full chapters (3,000–5,000 words) produce the best results.

**Q: Can I compare more than 2 manuscripts in the War Room?**
A: Currently the War Room supports 2 at a time. For 3+ manuscripts, run multiple pairwise comparisons and track results in the Report Generator.

**Q: How does the system handle debut authors in the Author Arc modeler?**
A: Debut authors start with wide confidence intervals. The system models based on genre averages and platform strength. The trajectory becomes more accurate after Book 2.

---

*This documentation covers all 15 intelligence systems in the Manuscript Scoring Dashboard. For questions, contact the system administrator or raise a ticket in the Admin Console.*
`;
