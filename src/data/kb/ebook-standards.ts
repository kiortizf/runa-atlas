export const DOC_EBOOK_STANDARDS = `# eBook Format Standards & QA Guide

This guide covers Rüna Atlas's standards for eBook production, platform-specific requirements, accessibility compliance, and quality assurance. Every eBook we publish must meet these standards before distribution.

## EPUB 3.0 Standards

All Rüna Atlas eBooks are produced in **EPUB 3.0** format:

- **Semantic HTML5** markup for all content
- **CSS3** styling (keep it simple — complex layouts break on e-readers)
- **SVG** and **bitmap images** supported
- **MathML** for mathematical content (rarely needed for fiction)
- **Accessibility metadata** required in every file

## File Structure Requirements

| Component | Requirement |
|-----------|-----------|
| Cover image | Embedded, 2560×1600px minimum, JPEG |
| Table of contents | Both NCX (EPUB 2 compat) and XHTML (EPUB 3) |
| Metadata | Title, author, ISBN, publisher, language, publication date |
| Font embedding | Optional — only if license permits; fallback fonts specified |
| File size | Under 650MB (ACX limit); ideally under 50MB for fiction |

## Platform-Specific Requirements

### Amazon Kindle (KDP)

| Spec | Requirement |
|------|-----------|
| Format | KPF (Kindle Package Format) preferred; EPUB also accepted |
| Cover | 2560×1600px, JPEG, under 50MB |
| Interior images | 300dpi for print replica; 72-150dpi for reflowable |
| Enhanced typesetting | Automatically applied by Amazon |
| A+ Content | Must be set up separately in Author Central |
| DRM | Optional (Rüna Atlas policy: DRM-free) |
| Enrollment | KDP Select = exclusive 90-day terms; we go non-exclusive |

### Apple Books

| Spec | Requirement |
|------|-----------|
| Format | EPUB 3.0 |
| Cover | 1400×1873px minimum; 4000×3000 recommended |
| Fixed layout | Supported but not recommended for fiction |
| Audio/video | Supported in Apple ecosystem only |
| Pricing | Apple takes 30% commission |

### Kobo

| Spec | Requirement |
|------|-----------|
| Format | EPUB 3.0 or EPUB 2.0 |
| Cover | 1400px min width |
| Metadata | ONIX feed via aggregator preferred |
| Special features | Kobo Plus (subscription) eligibility |

### Google Play Books

| Spec | Requirement |
|------|-----------|
| Format | EPUB or PDF |
| Cover | At least 640px shortest side |
| Pricing | Google sets minimum price by territory |
| Distribution | Direct or through aggregator |

### Barnes & Noble Nook

| Spec | Requirement |
|------|-----------|
| Format | EPUB |
| Distribution | Through IngramSpark or Draft2Digital |

## DRM Policy

**Rüna Atlas publishes DRM-free eBooks.**

Rationale:
- DRM inconveniences legitimate buyers more than it prevents piracy
- Aligns with our community-first ethos
- DRM-free files are more accessible (screen readers, format conversion)
- Many of our peer publishers (Tor, Angry Robot) have moved DRM-free

## Image Standards

| Type | Specs | Notes |
|------|-------|-------|
| Cover (embedded) | 2560×1600px, JPEG, RGB | Same image across all platforms |
| Interior illustrations | 600-1000px width, PNG or JPEG | Grayscale for B&W readers |
| Maps | SVG preferred; PNG fallback | Must be readable at small sizes |
| All images | Alt text required | Accessibility requirement |

## Quality Assurance Checklist

### Technical Validation

- [ ] EPUBCheck passes with **zero errors** (warnings acceptable if justified)
- [ ] ACE (Accessibility Checker for EPUB) passes
- [ ] File opens without errors on Kindle Previewer
- [ ] File opens without errors on Apple Books
- [ ] File size within platform limits

### Content Validation

- [ ] Cover displays correctly (thumbnailed AND full-size)
- [ ] Table of contents navigates to correct chapters
- [ ] All chapters present and in correct order
- [ ] Front matter complete (title page, copyright, dedication)
- [ ] Back matter complete (about author, also-by, resources)
- [ ] Content warnings page present (if applicable)
- [ ] Scene breaks render correctly
- [ ] Italics, bold, and special formatting preserved
- [ ] Special characters display properly (accented characters, em dashes, etc.)
- [ ] Drop caps or decorative elements display correctly
- [ ] Footnotes/endnotes link properly
- [ ] Hyperlinks work (internal and external)

### Device Testing Matrix

Test on at least 3 platforms before distribution:

| Platform | Test Method | Priority |
|----------|------------|----------|
| Kindle | Kindle Previewer desktop app | Required |
| Apple Books | Mac/iOS Books app | Required |
| Kobo | Kobo reader device or app | Recommended |
| Google Play | Google Play Books app | Recommended |
| Calibre | Calibre desktop viewer | Recommended |
| Screen reader | VoiceOver or NVDA | Required (accessibility) |

## Accessibility Requirements

Every Rüna Atlas eBook must meet **WCAG 2.1 AA** equivalent:

- **Logical reading order** — content flows correctly when CSS is stripped
- **Language attribute** set in OPF and on the root HTML element
- **Alt text** on every image (decorative images get empty alt: alt="")
- **Semantic markup** — headings, lists, tables, blockquotes properly tagged
- **Sufficient contrast** — text is legible on all backgrounds
- **Navigation** — full NCX and HTML TOC
- **Accessibility metadata** in OPF:
  - \\\`accessMode: textual\\\`
  - \\\`accessibilityFeature: tableOfContents, readingOrder, alternativeText\\\`
  - \\\`accessibilityHazard: none\\\`
  - \\\`accessibilitySummary\\\` describing the book's accessibility

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Fonts don't display | Missing or unlicensed fonts | Remove embedded fonts or get license |
| Images too small | Low-res source | Re-export at 600px+ width |
| TOC doesn't work | Missing NCX or broken links | Regenerate using Sigil/Calibre |
| Scene breaks missing | CSS not rendering on all devices | Use Unicode characters (⁂, *** ) instead of images |
| Chapter order wrong | Spine order incorrect in OPF | Fix spine sequence in EPUB structure |
| Special characters broken | Encoding issue | Ensure UTF-8 encoding throughout |
`;
