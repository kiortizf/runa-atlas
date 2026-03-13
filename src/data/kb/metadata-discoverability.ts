export const DOC_METADATA_DISCOVERABILITY = `# Metadata & Discoverability Guide

Comprehensive guide to book metadata, search optimization, and discoverability strategy. Sourced from NYU MS Publishing "Publishing Analytics" course and IBPA Industry Standards Checklist.

## Why Metadata Matters

Metadata is the single biggest lever for organic discoverability. 90%+ of book purchases start with an online search. Bad metadata = invisible books.

## BISAC Category Strategy

BISAC (Book Industry Standards and Communications) codes determine where your book appears in stores and online catalogs.

### Selection Rules

1. Choose the **most specific** BISAC code available (not the broadest)
2. Amazon allows up to **3 BISAC categories** — use all 3
3. IngramSpark uses **2 BISAC categories** — choose the 2 most impactful
4. Think about where your *reader* would browse, not where *you* categorize it

### SFF-Relevant BISAC Codes

| Code | Category | Use When |
|------|----------|---------|
| FIC028010 | Science Fiction / Space Opera | Space-set stories with grand scope |
| FIC028020 | Science Fiction / Hard Science Fiction | Technology-driven SF |
| FIC028070 | Science Fiction / Afrofuturism | Afrofuturist SF |
| FIC009020 | Fantasy / Epic | Large-scale fantasy worlds |
| FIC009030 | Fantasy / Dark Fantasy | Dark-toned, morally gray fantasy |
| FIC009100 | Fantasy / Gaslamp | Victorian-adjacent fantasy |
| FIC015000 | Horror / General | Horror fiction |
| FIC015020 | Horror / Supernatural | Supernatural horror |
| FIC024000 | Occult & Supernatural | Supernatural elements |
| FIC044000 | African American & Black / General | Books centering Black experiences |

### Category Hacking (Amazon-Specific)

Amazon has many more categories than BISAC. You can request specific Amazon categories by contacting KDP support with your ASIN and desired browse path. Target categories where:
- You can realistically reach Top 20
- The audience aligns with your book
- Competition isn't overwhelmingly dominated by mega-publishers

## Keyword Strategy

### Amazon Backend Keywords

Amazon allows 7 keyword fields (each up to 50 characters). These do NOT appear to customers but affect search ranking.

**Rules:**
- No quotation marks
- No repetition of words already in your title or subtitle
- Include misspellings readers might type
- Use comma-separated phrases
- Don't repeat — each word only needs to appear once

**SFF Keyword Examples:**

\\\`\\\`\\\`
space opera, afrofuturism, diverse science fiction
epic fantasy, magic system, chosen one
cosmic horror, eldritch, lovecraftian, weird fiction
dark fantasy, grimdark, morally gray protagonist
literary science fiction, dystopian, post-apocalyptic
\\\`\\\`\\\`

### Apple Books & Kobo Keywords

- Fewer keyword opportunities than Amazon
- Focus on the most impactful 3-5 terms
- Include genre, subgenre, and tone descriptors

## ONIX Feed Best Practices

ONIX (ONline Information eXchange) is the XML standard for communicating book metadata to the supply chain.

### Required Fields

| Field | Notes |
|-------|-------|
| ISBN-13 | Unique per format (PB, HC, eBook) |
| Title and subtitle | Exactly as it appears on the book |
| Contributors | Author, editor, illustrator roles |
| BISAC subject codes | At least 2, up to 3 |
| Publisher name | "Rüna Atlas Press" |
| Imprint name | "Bohío Press" or "Void Noir" |
| Publication date | YYYYMMDD format |
| List price | Per territory |
| Description | Marketing copy / blurb |
| Cover image URL | High-resolution cover |
| Page count | For print editions |
| Format/binding | Paperback, hardcover, eBook |
| Language | en (English) |
| Territory | Rights territory |
| Availability | Available, forthcoming, out of print |

### ONIX Quality Checklist

- [ ] All ISBNs correct and unique per format
- [ ] Prices set for all intended territories
- [ ] Publication date accurate
- [ ] Description is marketing copy (not placeholder)
- [ ] Cover image URL resolves to high-res JPEG
- [ ] Series information included (if applicable)
- [ ] Contributor bios included
- [ ] Endorsement quotes included (if available)

## Book Description Copywriting Framework

The book description (blurb) is the most important piece of marketing copy. It appears on every retail page.

### Structure (Fiction)

1. **Hook** (1-2 sentences): Grab attention with the central conflict or a fascinating premise
2. **Setup** (2-3 sentences): Introduce the protagonist, their world, and what's at stake
3. **Escalation** (2-3 sentences): Introduce the specific conflict or challenge — what goes wrong?
4. **Question/Cliffhanger** (1 sentence): End with a question that makes the reader need to know more
5. **Comp line** (optional): "For fans of [Author A] and [Author B]"

### Formatting Rules

- **Bold** the first line (becomes the subtitle on Amazon)
- Use short paragraphs (2-3 sentences max)
- Include **line breaks** between paragraphs (Amazon renders HTML)
- 150-300 words ideal (Amazon truncates after ~200 words with "Read More")
- Never use quotes from the book
- Never spoil the ending

### Common Mistakes

- ❌ Starting with backstory or world-building
- ❌ Naming too many characters
- ❌ Being vague ("A journey of discovery" — of what?)
- ❌ Describing the book ("This novel explores themes of...") instead of selling it
- ❌ Exceeding 300 words

## SEO for Publisher Website

### Per-Book Pages (runaatlas.com)

Each book page should include:

| Element | SEO Purpose |
|---------|------------|
| Title tag | "[Book Title] by [Author] | Rüna Atlas Press" |
| Meta description | Condensed version of blurb (150-160 characters) |
| H1 | Book title |
| Body | Full blurb, publication details, reviews |
| Alt text on cover image | "[Book Title] cover art" |
| Schema markup | Book schema (ISBN, author, publisher) |
| Internal links | Link to author page, similar titles |
| Buy links | Amazon, Bookshop.org, Apple, direct store |

### Author Pages

| Element | SEO Purpose |
|---------|------------|
| Title tag | "[Author Name] — Rüna Atlas Press Author" |
| H1 | Author name |
| Bio | Author biography optimized for search |
| Books | Grid of their titles with links |
| Events | Upcoming appearances |

### Blog/News Pages

- Target long-tail keywords ("best afrofuturism novels 2026")
- Write 800-1,500 word posts
- Include links to relevant book pages
- Update "best of" lists annually

## Metadata Compliance Checklist

Pre-publication metadata audit:

- [ ] ISBN assigned and correct per format
- [ ] BISAC categories chosen (2-3, most specific available)
- [ ] Amazon keywords filled (7 fields, 50 chars each)
- [ ] Book description written and formatted (HTML for Amazon)
- [ ] Cover image meets minimum resolution (2560×1600 Amazon)
- [ ] ONIX feed updated and validated
- [ ] Author Central page updated (Amazon, Apple)
- [ ] Series metadata correct (number, order)
- [ ] Publisher and imprint fields correct
- [ ] Price set for all territories
- [ ] Publication date confirmed
- [ ] runaatlas.com book page live with schema markup
`;
