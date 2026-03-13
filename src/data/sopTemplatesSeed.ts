// ─── Expanded SOP Templates ────────────────────────────────
// 35 interactive SOP templates covering every aspect of indie publishing

export interface SOPStep {
  id: string;
  title: string;
  description: string;
  role: string;
  checklist?: string[];
}

export interface SOPTemplate {
  title: string;
  category: string;
  icon: string;
  description: string;
  steps: SOPStep[];
}

export const SOP_TEMPLATES_SEED: SOPTemplate[] = [
  // ═══════════════════════════════════════════════════════
  // MANUSCRIPT & EDITORIAL (6)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Manuscript Acquisition & Evaluation',
    category: 'editorial',
    icon: '📥',
    description: 'End-to-end process for evaluating and acquiring new manuscripts, from slush pile to signed contract.',
    steps: [
      { id: 'acq-1', title: 'Initial Screening', description: 'Review query letter, synopsis, and sample chapters for fit with our catalog and mission.', role: 'Acquisitions Editor', checklist: ['Query letter reviewed', 'Synopsis reviewed', 'Sample chapters read (first 3)', 'Genre/imprint fit assessed', 'Diversity/mission alignment checked', 'Response sent within 30 days'] },
      { id: 'acq-2', title: 'Full Manuscript Request', description: 'Request and read full manuscript for promising submissions.', role: 'Acquisitions Editor', checklist: ['Full manuscript requested', 'Full manuscript received', 'Complete read-through done', 'Developmental notes drafted', 'Market positioning assessed'] },
      { id: 'acq-3', title: 'Editorial Committee Review', description: 'Present manuscript to editorial committee for collective decision.', role: 'Editor-in-Chief', checklist: ['Committee meeting scheduled', 'Manuscript summary prepared', 'Comp titles identified (3-5)', 'Market analysis presented', 'P&L projection drafted', 'Committee vote recorded'] },
      { id: 'acq-4', title: 'Author Communication & Offer', description: 'Contact author with decision and negotiate terms.', role: 'Acquisitions Editor', checklist: ['Decision communicated to author', 'Offer letter drafted', 'Rights discussed (territory, audio, translation)', 'Advance amount determined', 'Royalty structure outlined', 'Agent contacted (if applicable)'] },
      { id: 'acq-5', title: 'Contract Execution', description: 'Finalize and execute publishing agreement.', role: 'Publisher / Legal', checklist: ['Contract drafted from template', 'Rights clauses reviewed', 'Reversion clauses included', 'Option clause negotiated', 'Contract sent for author review', 'Signed contract received', 'Contract filed in system'] },
      { id: 'acq-6', title: 'Onboarding', description: 'Welcome author and set expectations for the publishing process.', role: 'Editor', checklist: ['Welcome packet sent', 'Author portal access granted', 'Editorial timeline shared', 'Marketing questionnaire sent', 'Author photo/bio requested', 'First editorial call scheduled'] },
    ],
  },
  {
    title: 'Developmental Editing Process',
    category: 'editorial',
    icon: '🔍',
    description: 'Guide for conducting developmental edits including structural analysis, character arcs, and narrative pacing.',
    steps: [
      { id: 'dev-1', title: 'First Read & Assessment', description: 'Complete read-through with macro-level notes on structure, pacing, character, and theme.', role: 'Developmental Editor', checklist: ['Complete manuscript read', 'Chapter-by-chapter notes taken', 'Structural issues flagged', 'Character arc analysis completed', 'Pacing assessment done', 'Thematic coherence checked'] },
      { id: 'dev-2', title: 'Editorial Letter', description: 'Draft comprehensive editorial letter addressing major developmental issues.', role: 'Developmental Editor', checklist: ['Opening with strengths', 'Structure/plot issues detailed', 'Character development feedback', 'Pacing recommendations', 'World-building consistency notes', 'Cultural sensitivity flags raised', 'Priority order for revisions established'] },
      { id: 'dev-3', title: 'Author Call', description: 'Meet with author to discuss editorial letter and revision priorities.', role: 'Developmental Editor', checklist: ['Call scheduled', 'Author questions addressed', 'Revision priorities agreed upon', 'Timeline for revisions set', 'Check-in schedule established', 'Call summary emailed to author'] },
      { id: 'dev-4', title: 'Author Revisions', description: 'Author implements revisions based on dev edit feedback.', role: 'Author', checklist: ['Revision deadline communicated', 'Check-in calls held (as needed)', 'Additional research support provided', 'Sensitivity reader recommended (if needed)', 'Revised manuscript received'] },
      { id: 'dev-5', title: 'Second Pass Review', description: 'Review revised manuscript to verify developmental issues are resolved.', role: 'Developmental Editor', checklist: ['Revised manuscript read in full', 'Original issues verified as resolved', 'New issues flagged (if any)', 'Manuscript ready for line edit (or R2 dev edit)', 'Sign-off memo written'] },
    ],
  },
  {
    title: 'Line & Copy Editing Process',
    category: 'editorial',
    icon: '✏️',
    description: 'Standards and workflow for line editing, copy editing, and creating house style sheets.',
    steps: [
      { id: 'lce-1', title: 'Style Sheet Creation', description: 'Create book-specific style sheet documenting character names, invented terms, timeline, and style choices.', role: 'Copy Editor', checklist: ['Character name list compiled', 'Place names documented', 'Invented terms/languages recorded', 'Timeline/chronology mapped', 'House style preferences noted', 'Genre-specific conventions established'] },
      { id: 'lce-2', title: 'Line Edit Pass', description: 'Edit for voice, rhythm, clarity, word choice, and sentence-level craft.', role: 'Line Editor', checklist: ['Voice consistency maintained', 'Dialogue tags reviewed', 'Repetitive word/phrase checks', 'Metaphor/simile effectiveness', 'Paragraph transitions smoothed', 'Chapter openings/closings polished'] },
      { id: 'lce-3', title: 'Copy Edit Pass', description: 'Edit for grammar, punctuation, consistency, and factual accuracy.', role: 'Copy Editor', checklist: ['Grammar and syntax checked', 'Punctuation standardized', 'Spelling verified (incl. proper nouns)', 'Consistency checks (timeline, details)', 'Dialogue formatting standardized', 'Numbers/dates formatted per style', 'Fact-checking completed'] },
      { id: 'lce-4', title: 'Author Review', description: 'Author reviews all editorial changes, accepts/rejects, resolves queries.', role: 'Author', checklist: ['Tracked changes document sent', 'Author review deadline set', 'Author queries resolved', 'STET decisions respected', 'Finalized manuscript returned'] },
      { id: 'lce-5', title: 'Clean Manuscript', description: 'Incorporate author responses and prepare clean manuscript for production.', role: 'Copy Editor', checklist: ['All tracked changes resolved', 'Author STET decisions applied', 'Final style sheet updated', 'Clean manuscript exported', 'Manuscript ready for typesetting'] },
    ],
  },
  {
    title: 'Sensitivity Reading Protocol',
    category: 'editorial',
    icon: '🌍',
    description: 'Process for engaging sensitivity readers to ensure authentic, responsible representation.',
    steps: [
      { id: 'sen-1', title: 'Identify Needs', description: 'Assess manuscript for areas requiring sensitivity review based on content and author identity.', role: 'Editor', checklist: ['Content areas identified (race, disability, sexuality, culture, religion, etc.)', 'Own-voices assessment completed', 'Number of readers needed determined', 'Specific expertise areas listed'] },
      { id: 'sen-2', title: 'Engage Readers', description: 'Find and hire qualified sensitivity readers.', role: 'Editor', checklist: ['Qualified readers identified', 'Rates negotiated and agreed', 'NDA signed', 'Timeline communicated', 'Specific focus areas briefed', 'Payment schedule confirmed'] },
      { id: 'sen-3', title: 'Review Period', description: 'Sensitivity readers review manuscript and provide feedback.', role: 'Sensitivity Reader(s)', checklist: ['Manuscript provided securely', 'Deadline confirmed', 'Check-in at midpoint', 'Written report received', 'Verbal debrief conducted (if needed)'] },
      { id: 'sen-4', title: 'Author Debrief', description: 'Share sensitivity feedback with author and discuss implementation.', role: 'Editor', checklist: ['Feedback summarized for author', 'Meeting held with author', 'Author response documented', 'Required changes vs suggestions clarified', 'Revision plan agreed', 'Payment to sensitivity readers processed'] },
      { id: 'sen-5', title: 'Implementation & Verification', description: 'Verify sensitivity feedback has been properly implemented.', role: 'Editor', checklist: ['Author revisions reviewed', 'Key concerns resolved', 'Second read by sensitivity reader (if needed)', 'Sign-off on cultural accuracy'] },
    ],
  },
  {
    title: 'Proofreading Process',
    category: 'editorial',
    icon: '🔎',
    description: 'Final quality check before publication, comparing typeset proofs against the clean manuscript.',
    steps: [
      { id: 'proof-1', title: 'First Pass Proof', description: 'Read typeset pages against clean manuscript for errors introduced in typesetting.', role: 'Proofreader', checklist: ['Typeset PDF received', 'Clean manuscript received for comparison', 'Cover-to-cover proofread completed', 'Typesetting errors marked (using standard marks)', 'Layout issues flagged', 'Widow/orphan check', 'Running heads verified', 'Page numbers verified', 'Front matter accuracy checked', 'Back matter accuracy checked'] },
      { id: 'proof-2', title: 'Correction Implementation', description: 'Designer implements proof corrections.', role: 'Book Designer', checklist: ['All corrections received', 'Corrections implemented', 'Reflowed pages checked', 'No new errors introduced'] },
      { id: 'proof-3', title: 'Second Pass (Cold Read)', description: 'Fresh proofreader does cold read of corrected proof.', role: 'Proofreader (2nd)', checklist: ['Cold read completed', 'Previous corrections verified', 'New errors caught', 'Final corrections marked'] },
      { id: 'proof-4', title: 'Author Proof Review', description: 'Author reviews final proof for approval.', role: 'Author', checklist: ['Proof sent to author', 'Author review deadline set', 'Author corrections received', 'AA (Author Alterations) budget tracked', 'Final author approval received'] },
      { id: 'proof-5', title: 'Final Sign-Off', description: 'Publisher final approval before files go to printer.', role: 'Publisher', checklist: ['All corrections implemented', 'Final PDF reviewed', 'ISBN barcode verified', 'Copyright page verified', 'Print-ready declaration signed'] },
    ],
  },
  {
    title: 'Translation Rights & Foreign Edition',
    category: 'editorial',
    icon: '🌐',
    description: 'Process for licensing translation rights and managing foreign editions.',
    steps: [
      { id: 'trans-1', title: 'Rights Assessment', description: 'Evaluate title for translation potential and identify target markets.', role: 'Rights Manager', checklist: ['Title identified for translation licensing', 'Target languages/territories listed', 'Rights availability confirmed', 'Sales sheet/one-pager created'] },
      { id: 'trans-2', title: 'Market & Pitch', description: 'Approach foreign publishers and literary agents.', role: 'Rights Manager', checklist: ['Target publishers identified per territory', 'Pitch materials prepared (English synopsis, sample, marketing data)', 'Rights catalogs sent', 'Frankfurt/London book fair submissions made', 'Follow-ups scheduled'] },
      { id: 'trans-3', title: 'Deal Negotiation', description: 'Negotiate terms for translation license.', role: 'Rights Manager / Publisher', checklist: ['Territory and language scope defined', 'Print run and format agreed', 'Advance and royalty terms negotiated', 'Term of license (years) agreed', 'Contract drafted and executed'] },
      { id: 'trans-4', title: 'Production Support', description: 'Support foreign publisher during production.', role: 'Editor', checklist: ['Clean manuscript/EPUB files provided', 'Cover artwork/brand guidelines shared', 'Author available for translator questions', 'Author photo and updated bio sent', 'Translation quality spot-check (if possible)'] },
      { id: 'trans-5', title: 'Publication & Tracking', description: 'Track foreign edition publication and royalties.', role: 'Rights Manager', checklist: ['Foreign edition publication date recorded', 'Comp copies received', 'Royalty reporting schedule established', 'Foreign reviews tracked', 'Cross-promotion opportunities explored'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // BOOK DESIGN & PRODUCTION (6)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Book Cover Design',
    category: 'design',
    icon: '🎨',
    description: 'Full cover design process from creative brief to print-ready files.',
    steps: [
      { id: 'cov-1', title: 'Creative Brief', description: 'Gather all information needed for cover design including genre expectations, comp titles, and author preferences.', role: 'Art Director', checklist: ['Genre and subgenre identified', 'Target reader demographic defined', 'Comp title covers analyzed (5-10)', 'Author visual preferences gathered', 'Imprint brand guidelines reviewed', 'Trim size and spine width confirmed', 'Special finishes discussed (foil, emboss, spot UV)', 'Budget confirmed'] },
      { id: 'cov-2', title: 'Concept Development', description: 'Designer creates 2-3 cover concepts based on brief.', role: 'Cover Designer', checklist: ['2-3 concepts developed', 'Typography options explored', 'Color palette established', 'Mockup presentations created', 'Thumbnail test (readability at small size)', 'Genre shelf compatibility checked'] },
      { id: 'cov-3', title: 'Author & Team Review', description: 'Present concepts to author and editorial team for selection.', role: 'Art Director', checklist: ['Concepts presented to team', 'Author feedback received', 'Direction selected', 'Revision notes compiled', 'A/B testing with focus group (optional)'] },
      { id: 'cov-4', title: 'Refinement', description: 'Refine selected concept through 2-3 rounds of revision.', role: 'Cover Designer', checklist: ['Round 1 revisions completed', 'Author approval on direction', 'Round 2 refinements', 'Final typography locked', 'Back cover copy placed', 'Blurbs/endorsements added', 'Author bio and photo placed', 'ISBN barcode positioned'] },
      { id: 'cov-5', title: 'Final Production Files', description: 'Prepare print-ready and digital-ready cover files.', role: 'Cover Designer', checklist: ['Full wrap cover PDF (CMYK, 300dpi, with bleed/trim marks)', 'eBook cover (RGB, 2560x1600px minimum)', 'Spine width verified with printer calculator', 'Social media assets generated (square, 16:9, story)', 'Amazon/retailer thumbnail verified at 160x260px', 'Final approval from publisher'] },
    ],
  },
  {
    title: 'Interior Layout & Typesetting',
    category: 'design',
    icon: '📐',
    description: 'Interior book design from font selection to print-ready PDF.',
    steps: [
      { id: 'lay-1', title: 'Design Specifications', description: 'Establish interior design parameters including fonts, margins, and page elements.', role: 'Book Designer', checklist: ['Trim size confirmed', 'Margins set (gutter, head, foot, outside)', 'Body font selected and licensed', 'Display/chapter fonts selected', 'Leading and tracking set', 'Chapter opener style designed', 'Running headers/footers designed', 'Scene break ornaments chosen'] },
      { id: 'lay-2', title: 'Template & Sample Pages', description: 'Create design template and sample pages for approval.', role: 'Book Designer', checklist: ['Template created in InDesign/Vellum', 'Sample chapter typeset', 'Front matter template created', 'Back matter template created', 'Sample approved by editor/publisher'] },
      { id: 'lay-3', title: 'Full Typesetting', description: 'Flow entire manuscript into design template.', role: 'Book Designer', checklist: ['Full manuscript placed in template', 'Paragraph styles applied throughout', 'Special elements formatted (letters, poems, epigraphs)', 'Illustrations/maps placed (if applicable)', 'Orphans and widows eliminated', 'Bad breaks fixed', 'Page count finalized'] },
      { id: 'lay-4', title: 'eBook Conversion', description: 'Create EPUB and/or MOBI files from typeset manuscript.', role: 'eBook Formatter', checklist: ['EPUB created from source files', 'Table of contents (NCX and HTML) generated', 'Cover embedded in EPUB', 'Metadata embedded (title, author, ISBN, publisher)', 'Font embedding verified', 'EPUB validated (epubcheck tool)', 'Tested on Kindle, Apple Books, Kobo'] },
      { id: 'lay-5', title: 'Print PDF Export', description: 'Export print-ready interior PDF.', role: 'Book Designer', checklist: ['PDF exported at 300dpi', 'Fonts embedded/outlined', 'Color mode: B&W or color as specified', 'Bleed marks included (if full-bleed pages)', 'Page count is even (multiple of signatures if offset)', 'PDF/X-1a compliance verified'] },
    ],
  },
  {
    title: 'Audiobook Production',
    category: 'design',
    icon: '🎧',
    description: 'Complete audiobook production from narrator casting to distribution.',
    steps: [
      { id: 'aud-1', title: 'Narrator Casting', description: 'Find and hire the right narrator for the book.', role: 'Producer', checklist: ['Character analysis for voice needs', 'Narrator shortlist created (3-5 options)', 'Audition samples requested', 'Author input on narrator preference', 'Narrator selected and contracted', 'Rate negotiated (PFH or royalty share)', 'Recording schedule established'] },
      { id: 'aud-2', title: 'Pre-Production', description: 'Prepare manuscript and pronunciation guide for narrator.', role: 'Producer', checklist: ['Clean manuscript provided to narrator', 'Pronunciation guide created (character names, invented terms, foreign words)', 'Character voice notes shared', 'Technical requirements communicated (sample rate, bit depth, noise floor)', 'Recording studio confirmed'] },
      { id: 'aud-3', title: 'Recording', description: 'Narrator records the audiobook.', role: 'Narrator / Producer', checklist: ['First 15 minutes reviewed for voice/quality approval', 'Recording checkpoints established', 'Pickup list maintained for retakes', 'All chapters recorded', 'Raw files received'] },
      { id: 'aud-4', title: 'Post-Production', description: 'Edit, proof, and master the audiobook.', role: 'Audio Engineer', checklist: ['Noise reduction applied', 'Mouth clicks/pops removed', 'Room tone consistent', 'Chapter breaks properly placed', 'Opening and closing credits added', 'QC listen completed', 'Mastered to ACX/retailer specifications', 'Retail sample created (first 5 minutes)'] },
      { id: 'aud-5', title: 'Distribution', description: 'Upload and distribute the audiobook.', role: 'Producer', checklist: ['Files uploaded to distributor (Findaway/ACX/Author Direct)', 'Metadata entered (title, author, narrator, genre, description)', 'ISBN assigned (audiobook-specific)', 'Cover uploaded (3200x3200px square)', 'Release date set', 'Available on Audible, Apple, Libro.fm, etc.'] },
    ],
  },
  {
    title: 'ISBN & Metadata Management',
    category: 'design',
    icon: '#️⃣',
    description: 'Assigning ISBNs, managing metadata, and ensuring discoverability across all retail channels.',
    steps: [
      { id: 'isbn-1', title: 'ISBN Assignment', description: 'Assign unique ISBNs for each format of the book.', role: 'Production Manager', checklist: ['Print ISBN assigned (from Bowker block)', 'eBook ISBN assigned', 'Audiobook ISBN assigned (if applicable)', 'Large print ISBN assigned (if applicable)', 'ISBNs registered in Bowker/MyIdentifiers', 'ISBNs recorded in production database', 'Barcode generated for print cover'] },
      { id: 'isbn-2', title: 'BISAC & Subject Codes', description: 'Select appropriate BISAC codes for retailer categorization.', role: 'Marketing / Editor', checklist: ['Primary BISAC code selected', 'Secondary BISAC code selected', 'Tertiary BISAC code selected', 'BISAC codes match genre/subgenre accurately', 'Codes verified against retailer category trees'] },
      { id: 'isbn-3', title: 'Metadata Preparation', description: 'Prepare comprehensive metadata for distribution partners.', role: 'Production Manager', checklist: ['Title and subtitle finalized', 'Author name (as appears on cover)', 'Publisher imprint specified', 'Publication date set', 'Page count confirmed', 'Trim size confirmed', 'Price set (per format)', 'Description written (short and long versions)', 'Author bio prepared', 'Keywords selected (7-10, SEO-optimized)', 'Age/grade range (if applicable)', 'Series information (if applicable)', 'Territorial rights specified'] },
      { id: 'isbn-4', title: 'Metadata Distribution', description: 'Push metadata to all distribution and retail channels.', role: 'Production Manager', checklist: ['ONIX feed updated', 'IngramSpark metadata entered', 'Amazon KDP metadata entered (if applicable)', 'Bowker Books In Print updated', 'Library cataloging data (MARC records) prepared', 'NetGalley listing created (if applicable)', 'Goodreads listing claimed and optimized', 'BookBub listing submitted'] },
      { id: 'isbn-5', title: 'Ongoing Metadata Maintenance', description: 'Keep metadata current across all channels.', role: 'Production Manager', checklist: ['Reviews/endorsements added to descriptions', 'Award wins/nominations updated', 'Series information updated as new titles publish', 'Price changes synchronized across channels', 'Author bio updated as needed'] },
    ],
  },
  {
    title: 'Print-on-Demand Setup (IngramSpark)',
    category: 'design',
    icon: '🖨️',
    description: 'Complete IngramSpark title setup from account configuration to going live.',
    steps: [
      { id: 'ingram-1', title: 'Pre-Setup Checklist', description: 'Ensure all materials are ready before starting IngramSpark setup.', role: 'Production Manager', checklist: ['IngramSpark publisher account active', 'Print-ready interior PDF prepared', 'Print-ready cover PDF prepared (full wrap with spine)', 'ISBN assigned and registered with Bowker', 'Barcode on cover matches ISBN', 'Trim size matches interior and cover files', 'Page count is accurate', 'Spine width calculated using IngramSpark calculator'] },
      { id: 'ingram-2', title: 'Title Setup', description: 'Enter all title information in IngramSpark.', role: 'Production Manager', checklist: ['New title created in dashboard', 'Print and digital options selected', 'ISBN entered', 'Title, subtitle, author entered', 'Publisher imprint selected', 'Publication date set', 'BISAC codes entered', 'Description entered', 'Keywords entered', 'Contributor roles assigned'] },
      { id: 'ingram-3', title: 'Print Specifications', description: 'Configure print specifications in IngramSpark.', role: 'Production Manager', checklist: ['Trim size selected', 'Paper type selected (cream/white, weight)', 'Binding type selected', 'Interior color selected (B&W, Standard Color, Premium)', 'Laminate finish selected (matte/gloss)', 'Page count confirmed'] },
      { id: 'ingram-4', title: 'File Upload & Review', description: 'Upload files and review proofs.', role: 'Production Manager', checklist: ['Interior PDF uploaded', 'Cover PDF uploaded', 'File review initiated', 'Preflight errors resolved (if any)', 'Digital proof reviewed online', 'Physical proof ordered', 'Physical proof received and inspected', 'Print quality approved'] },
      { id: 'ingram-5', title: 'Pricing & Distribution', description: 'Set pricing and distribution terms.', role: 'Publisher', checklist: ['US list price set', 'UK list price set (if applicable)', 'Other territory prices set', 'Wholesale discount set (typically 55%)', 'Returnability set (returnable recommended)', 'Distribution channels enabled (Ingram catalog, Amazon, B&N, etc.)', 'Title status set to Active'] },
      { id: 'ingram-6', title: 'Verification', description: 'Verify title is live and discoverable.', role: 'Production Manager', checklist: ['Title appears in Ingram catalog', 'Title appears on Amazon', 'Title appears on B&N', 'Title appears on Bookshop.org', 'Library availability confirmed (through Baker & Taylor)', 'Buy links collected for marketing'] },
    ],
  },
  {
    title: 'eBook Distribution Setup',
    category: 'design',
    icon: '📱',
    description: 'Distribute eBooks across all major platforms.',
    steps: [
      { id: 'ebook-1', title: 'File Preparation', description: 'Prepare EPUB for all platforms.', role: 'eBook Formatter', checklist: ['EPUB validated with epubcheck', 'Cover image embedded (high-res)', 'Metadata embedded in EPUB', 'DRM decision made (DRM-free recommended)', 'KF8/MOBI conversion created (for KDP)', 'Testing on multiple devices completed'] },
      { id: 'ebook-2', title: 'Platform Setup', description: 'Upload and configure on each eBook platform.', role: 'Production Manager', checklist: ['IngramSpark eBook uploaded (distributes to most platforms)', 'Amazon KDP uploaded (if going direct)', 'Apple Books uploaded via iTunes Connect (optional direct)', 'Kobo Writing Life uploaded (optional direct)', 'Google Play Books uploaded (optional direct)', 'All platform metadata synchronized'] },
      { id: 'ebook-3', title: 'Pricing Strategy', description: 'Set pricing across platforms.', role: 'Publisher', checklist: ['US price set', 'UK price set', 'Other territory prices set', 'Price parity maintained across platforms', 'Launch pricing/promotions planned'] },
      { id: 'ebook-4', title: 'Verification', description: 'Verify eBook is live and properly formatted on all platforms.', role: 'Production Manager', checklist: ['Amazon Kindle listing verified', 'Apple Books listing verified', 'Kobo listing verified', 'B&N Nook listing verified', 'Google Play listing verified', 'Sample download tested', 'Buy links collected'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // MARKETING & LAUNCH (8)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Book Launch Campaign',
    category: 'marketing',
    icon: '🚀',
    description: 'Complete launch campaign from 6 months pre-pub to 3 months post-pub.',
    steps: [
      { id: 'launch-1', title: 'T-6 Months: Pre-Launch Planning', description: 'Strategic planning and early buzz building.', role: 'Marketing Director', checklist: ['Launch date confirmed', 'Marketing budget allocated', 'Cover reveal date scheduled', 'ARC timeline planned', 'Influencer/reviewer list compiled', 'Author platform audit completed', 'Media kit created', 'Landing page built'] },
      { id: 'launch-2', title: 'T-4 Months: ARC Distribution', description: 'Distribute ARCs to reviewers, influencers, and early readers.', role: 'Marketing Coordinator', checklist: ['ARCs printed (or digital ARCs prepared)', 'NetGalley listing created', 'ARCs sent to priority reviewers', 'ARCs sent to bookstagrammers/BookTubers', 'ARCs sent to trade review outlets (Kirkus, PW, LJ)', 'ARC tracking spreadsheet updated', 'Goodreads giveaway set up'] },
      { id: 'launch-3', title: 'T-3 Months: Cover Reveal & Buzz', description: 'Execute cover reveal and build pre-publication buzz.', role: 'Marketing Coordinator', checklist: ['Cover reveal partner confirmed', 'Cover reveal assets prepared', 'Cover reveal executed', 'Pre-order links live', 'Social media campaign launched', 'Newsletter feature sent', 'Author interviews pitched'] },
      { id: 'launch-4', title: 'T-1 Month: Final Push', description: 'Final marketing push before publication.', role: 'Marketing Director', checklist: ['Final pre-order push (social, newsletter, ads)', 'Launch event planned (virtual/in-person)', 'Bookstore placement confirmed', 'Blog tour scheduled', 'Podcast interviews scheduled', 'Social media content calendar finalized', 'Author talking points prepared'] },
      { id: 'launch-5', title: 'Launch Week', description: 'Book launch week activities.', role: 'Marketing Coordinator', checklist: ['Launch day social media blitz', 'Launch event executed', 'Author newsletter sent', 'Publisher newsletter feature', 'Cross-promotion with other authors', 'Real-time sales tracking', 'Review monitoring started', 'Retailer availability confirmed'] },
      { id: 'launch-6', title: 'Post-Launch (Weeks 2-12)', description: 'Sustained marketing after launch.', role: 'Marketing Coordinator', checklist: ['Blog tour posts going live', 'BookTube/Bookstagram content sharing', 'Ongoing social media engagement', 'Book club outreach', 'Library promotion', 'Award submissions initiated', 'Sales data reviewed weekly', 'Marketing strategy adjusted based on data'] },
    ],
  },
  {
    title: 'ARC (Advance Reader Copy) Campaign',
    category: 'marketing',
    icon: '📖',
    description: 'End-to-end ARC distribution and tracking for maximum review coverage.',
    steps: [
      { id: 'arc-1', title: 'ARC Production', description: 'Prepare ARC files for distribution.', role: 'Production Manager', checklist: ['ARC interior finalized (uncorrected proof notice added)', 'ARC cover created (with "Advance Reader Copy" banner)', 'Physical ARCs ordered (quantity: ___)', 'Digital ARC files created (EPUB, PDF, MOBI)', 'NetGalley listing created', 'Edelweiss listing created'] },
      { id: 'arc-2', title: 'Target List', description: 'Build targeted list of ARC recipients.', role: 'Marketing Coordinator', checklist: ['Trade reviewers (Kirkus, PW, LJ, Booklist, Foreword)', 'Genre bloggers identified', 'Bookstagrammers identified', 'BookTubers identified', 'Podcasters identified', 'Book clubs identified', 'Librarians identified', 'Author network (for blurb requests)', 'Priority-ranked by audience size and relevance'] },
      { id: 'arc-3', title: 'Distribution', description: 'Send ARCs with personalized pitches.', role: 'Marketing Coordinator', checklist: ['Personalized pitch emails drafted', 'Physical ARCs mailed with press kit', 'Digital ARCs distributed via NetGalley/direct', 'Shipping confirmations tracked', 'Follow-up schedule set (2 weeks, 4 weeks)', 'ARC tracking spreadsheet updated'] },
      { id: 'arc-4', title: 'Follow-up & Results', description: 'Track ARC recipients and collect reviews.', role: 'Marketing Coordinator', checklist: ['First follow-up emails sent', 'Second follow-up emails sent', 'Reviews tracked as they appear', 'Pull quotes extracted for marketing', 'Thank-you notes sent to reviewers', 'Results report compiled'] },
    ],
  },
  {
    title: 'Social Media Campaign',
    category: 'marketing',
    icon: '📱',
    description: 'Social media strategy and content creation for book promotion.',
    steps: [
      { id: 'social-1', title: 'Strategy', description: 'Define social media strategy for the title.', role: 'Social Media Manager', checklist: ['Platform priorities identified (Instagram, TikTok, Twitter/X, Threads)', 'Content themes defined', 'Posting frequency established', 'Influencer partnerships planned', 'Hashtag strategy created', 'Budget for paid promotion allocated'] },
      { id: 'social-2', title: 'Content Creation', description: 'Create social media content assets.', role: 'Social Media Manager', checklist: ['Quote graphics created (10-15)', 'Cover reveal assets', 'Author spotlight content', 'Behind-the-scenes content planned', 'Video content (reels/TikToks) planned', 'User-generated content strategy', 'Content calendar populated'] },
      { id: 'social-3', title: 'Community Engagement', description: 'Build and engage community around the book.', role: 'Social Media Manager', checklist: ['Hashtag monitored daily', 'Reader content shared/amplified', 'Author engagement facilitated', 'Reader questions answered', 'Community challenges/read-alongs created', 'Engagement metrics tracked weekly'] },
    ],
  },
  {
    title: 'Newsletter Campaign',
    category: 'marketing',
    icon: '📧',
    description: 'Email marketing strategy for book launches and ongoing reader engagement.',
    steps: [
      { id: 'news-1', title: 'List Segmentation', description: 'Segment email list for targeted campaigns.', role: 'Marketing Coordinator', checklist: ['Genre-interest segments identified', 'Past-purchaser segments created', 'ARC reviewer segment identified', 'Engaged subscriber segment identified', 'New subscriber welcome sequence active'] },
      { id: 'news-2', title: 'Campaign Content', description: 'Create email campaign content.', role: 'Marketing Coordinator', checklist: ['Cover reveal email designed', 'Pre-order announcement email', 'Launch week email(s) designed', 'Author letter/note drafted', 'Exclusive content/excerpt prepared', 'Post-launch follow-up email'] },
      { id: 'news-3', title: 'Execution & Analysis', description: 'Send campaigns and analyze results.', role: 'Marketing Coordinator', checklist: ['Emails scheduled and sent', 'Open rates tracked', 'Click rates tracked', 'Conversion tracking enabled', 'A/B test results evaluated', 'List churn monitored'] },
    ],
  },
  {
    title: 'Author Event & Signing',
    category: 'marketing',
    icon: '🎤',
    description: 'Planning and executing author events, signings, readings, and panel appearances.',
    steps: [
      { id: 'event-1', title: 'Event Planning', description: 'Plan the event logistics.', role: 'Events Coordinator', checklist: ['Venue secured (bookstore, library, convention, virtual)', 'Date and time confirmed', 'Event type defined (signing, reading, panel, Q&A)', 'Co-participants confirmed (if panel)', 'Author travel arranged', 'Books ordered for event sales', 'Event listing created'] },
      { id: 'event-2', title: 'Promotion', description: 'Promote the event to drive attendance.', role: 'Marketing Coordinator', checklist: ['Event flyer/graphic created', 'Social media promotion posted', 'Newsletter announcement sent', 'Local media contacted', 'Event co-promotion with venue', 'RSVP tracking (if applicable)'] },
      { id: 'event-3', title: 'Execution', description: 'Execute the event day.', role: 'Events Coordinator', checklist: ['Books and merch transported', 'Signing supplies (pens, bookmarks, stickers)', 'Payment/POS system ready', 'Audio/video equipment tested', 'Author introduced and welcomed', 'Photos/video captured', 'Mailing list sign-ups collected'] },
      { id: 'event-4', title: 'Post-Event', description: 'Follow-up after the event.', role: 'Events Coordinator', checklist: ['Thank-you to venue/host', 'Event photos shared on social media', 'Recap blog post or newsletter', 'Sales numbers recorded', 'Lessons learned documented'] },
    ],
  },
  {
    title: 'Bookstore Outreach Campaign',
    category: 'marketing',
    icon: '🏪',
    description: 'Pitching indie bookstores for shelf placement, staff picks, and events.',
    steps: [
      { id: 'store-1', title: 'Research', description: 'Build target list of indie bookstores.', role: 'Sales / Marketing', checklist: ['Target bookstores identified by region', 'SFF-focused bookstores prioritized', 'BIPOC/Queer-owned bookstores identified', 'Buyer names and contacts gathered', 'IndieBound relationship verified'] },
      { id: 'store-2', title: 'Pitch', description: 'Send customized pitches to bookstore buyers.', role: 'Sales / Marketing', checklist: ['Pitch letter customized per store', 'Sell sheet/one-pager included', 'Sample chapter or ARC offered', 'IngramSpark availability confirmed in pitch', 'Meeting/call offered', 'Follow-up scheduled'] },
      { id: 'store-3', title: 'Partnership', description: 'Build ongoing relationships with partner stores.', role: 'Sales / Marketing', checklist: ['Consignment terms agreed (if applicable)', 'Signed copies offered', 'Event partnership explored', 'Staff-pick promotion pitched', 'Bookmarks/swag provided for display', 'Relationship maintained quarterly'] },
    ],
  },
  {
    title: 'Blog Tour Organization',
    category: 'marketing',
    icon: '✍️',
    description: 'Coordinate a multi-stop blog tour for maximum online visibility.',
    steps: [
      { id: 'blog-1', title: 'Planning', description: 'Plan blog tour scope and timeline.', role: 'Marketing Coordinator', checklist: ['Tour dates established (typically 1-2 weeks)', 'Number of stops determined (8-15)', 'Content types planned (reviews, interviews, guest posts, excerpts)', 'Blog tour service considered (or DIY)'] },
      { id: 'blog-2', title: 'Blogger Recruitment', description: 'Recruit blog hosts.', role: 'Marketing Coordinator', checklist: ['Target bloggers identified', 'Invitation emails sent', 'Hosts confirmed and assigned dates', 'Content types assigned per host', 'ARCs and assets sent to hosts', 'Schedule finalized and shared'] },
      { id: 'blog-3', title: 'Execution', description: 'Run the blog tour.', role: 'Marketing Coordinator', checklist: ['Tour posts shared daily on social media', 'Author engages with each post (comments)', 'Giveaway entries monitored (if applicable)', 'Traffic and engagement tracked', 'Tour roundup post published', 'Thank-you notes sent to all hosts'] },
    ],
  },
  {
    title: 'Award Submission Campaign',
    category: 'marketing',
    icon: '🏆',
    description: 'Strategic submission of titles to literary awards.',
    steps: [
      { id: 'award-1', title: 'Title Assessment', description: 'Evaluate which titles should be submitted for which awards.', role: 'Publisher', checklist: ['All eligible titles identified', 'Awards matched to each title by genre/criteria', 'Submission calendar reviewed', 'Budget allocated for fees and copies', 'Priority rankings established'] },
      { id: 'award-2', title: 'Materials Preparation', description: 'Prepare submission materials.', role: 'Marketing Coordinator', checklist: ['Submission forms completed', 'Required copies ordered/printed', 'Supporting materials prepared (press kit, reviews)', 'Entry fees paid', 'Mailing arranged'] },
      { id: 'award-3', title: 'Tracking & Promotion', description: 'Track results and promote any recognition.', role: 'Marketing Coordinator', checklist: ['Submission confirmations received', 'Longlist/shortlist announcements monitored', 'Results recorded in awards tracker', 'Any recognition immediately promoted (social, newsletter, website)', 'Award badges added to marketing materials'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // BUSINESS & OPERATIONS (8)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Royalty Calculation & Payment',
    category: 'operations',
    icon: '💰',
    description: 'Semi-annual royalty calculation, statement generation, and author payment process.',
    steps: [
      { id: 'roy-1', title: 'Sales Data Collection', description: 'Gather sales data from all channels for the royalty period.', role: 'Finance / Operations', checklist: ['IngramSpark sales report downloaded', 'KDP sales report downloaded (if applicable)', 'Direct sales data compiled', 'Audiobook royalties collected', 'Rights/subsidiary income recorded', 'Returns data reconciled', 'All data for royalty period confirmed'] },
      { id: 'roy-2', title: 'Royalty Calculation', description: 'Calculate royalties per contract terms.', role: 'Finance', checklist: ['Contract terms reviewed per author', 'Net receipts calculated per channel', 'Royalty percentages applied', 'Advance earn-out status checked', 'Subsidiary rights income allocated', 'Agent commission deducted (if applicable)', 'Tax withholding calculated (if applicable)'] },
      { id: 'roy-3', title: 'Statement Generation', description: 'Generate and review royalty statements.', role: 'Finance', checklist: ['Royalty statements generated per title per author', 'Sales breakdown by format and territory included', 'YTD and lifetime figures included', 'Statement reviewed for accuracy', 'Publisher sign-off obtained'] },
      { id: 'roy-4', title: 'Payment', description: 'Issue royalty payments to authors.', role: 'Finance', checklist: ['Payment amounts finalized', 'W-9/tax documents on file verified', 'Payments issued (check, ACH, PayPal)', 'Statements sent with payment', 'Payment confirmations recorded', 'Author correspondence handled'] },
    ],
  },
  {
    title: 'New Author Welcome & Onboarding',
    category: 'operations',
    icon: '🤝',
    description: 'Welcoming new authors into the Rüna Atlas family and setting expectations.',
    steps: [
      { id: 'onb-1', title: 'Welcome Package', description: 'Send welcome materials to newly signed author.', role: 'Editor / Operations', checklist: ['Welcome letter from Publisher/EIC', 'Author Handbook sent (expectations, timeline, process)', 'Author portal credentials created', 'Marketing questionnaire sent', 'Author bio template sent', 'High-res photo guidelines sent', 'Tax forms (W-9) sent', 'Direct deposit form sent'] },
      { id: 'onb-2', title: 'Kickoff Meeting', description: 'First meeting with author and their editorial team.', role: 'Editor', checklist: ['Meeting scheduled with author, editor, marketing', 'Publishing timeline reviewed', 'Editorial process explained', 'Marketing expectations discussed', 'Author platform capabilities assessed', 'Communication preferences established', 'Meeting notes distributed'] },
      { id: 'onb-3', title: 'System Setup', description: 'Set up author in all internal systems.', role: 'Operations', checklist: ['Author profile created in admin panel', 'Payment information entered', 'Manuscript tracking entry created', 'Marketing/CRM entry created', 'Author added to internal comms channels', 'First editorial milestone scheduled'] },
    ],
  },
  {
    title: 'Financial Planning & P&L',
    category: 'operations',
    icon: '📊',
    description: 'Per-title profit & loss analysis and financial planning.',
    steps: [
      { id: 'fin-1', title: 'Pre-Acquisition P&L', description: 'Project financials before acquiring a title.', role: 'Publisher / Finance', checklist: ['Expected print run estimated', 'Print cost per unit calculated', 'Cover design budget', 'Editorial costs estimated (dev edit, copy edit, proof)', 'Marketing budget allocated', 'Advance amount determined', 'Break-even analysis completed', 'Revenue projections (Y1, Y2, Y3)', 'ROI threshold met'] },
      { id: 'fin-2', title: 'Production Budget Tracking', description: 'Track actual costs against budget during production.', role: 'Finance', checklist: ['Editorial invoices tracked', 'Design invoices tracked', 'Printing costs tracked', 'Marketing spend tracked', 'Freelancer payments recorded', 'Budget variance monitored monthly'] },
      { id: 'fin-3', title: 'Post-Publication P&L', description: 'Review actual financial performance.', role: 'Publisher / Finance', checklist: ['Actual revenue compiled', 'Actual costs compiled', 'P&L statement generated', 'Comparison to projections', 'ROI calculated', 'Lessons learned for future titles'] },
    ],
  },
  {
    title: 'Rights Reversion Process',
    category: 'operations',
    icon: '⚖️',
    description: 'Handling rights reversion requests from authors per contract terms.',
    steps: [
      { id: 'rev-1', title: 'Request Review', description: 'Review reversion request against contract terms.', role: 'Publisher / Legal', checklist: ['Reversion request received', 'Contract reversion clause reviewed', 'Eligibility criteria checked (time, sales thresholds)', 'Outstanding obligations identified (advance, expenses)'] },
      { id: 'rev-2', title: 'Decision & Communication', description: 'Make decision and communicate to author.', role: 'Publisher', checklist: ['Decision made (grant/deny/negotiate)', 'Author notified in writing', 'If granting: reversion letter drafted', 'If denying: rationale provided', 'Timeline for transition discussed'] },
      { id: 'rev-3', title: 'Execution', description: 'Execute the rights reversion.', role: 'Operations / Legal', checklist: ['Reversion agreement signed', 'Titles removed from distribution channels', 'IngramSpark listing deactivated', 'eBook listings deactivated', 'Final royalty payment issued', 'Production files transferred to author', 'Records updated'] },
    ],
  },
  {
    title: 'Catalog & Frontlist Planning',
    category: 'operations',
    icon: '📅',
    description: 'Seasonal catalog planning for upcoming titles.',
    steps: [
      { id: 'cat-1', title: 'Season Planning', description: 'Plan the publishing season (Spring/Fall or quarterly).', role: 'Publisher / Acquisitions', checklist: ['Titles confirmed for season', 'Publication dates assigned', 'Genre/imprint balance reviewed', 'Production schedules verified', 'Sales conference date set', 'Catalog layout timeline established'] },
      { id: 'cat-2', title: 'Catalog Production', description: 'Create the seasonal catalog.', role: 'Marketing / Designer', checklist: ['Catalog template designed', 'Each title featured with: cover, description, metadata, sell-in points', 'Backlist highlights included', 'Author bios and photos placed', 'Ordering information included', 'PDF catalog created', 'Print catalog ordered (if applicable)'] },
      { id: 'cat-3', title: 'Distribution', description: 'Distribute catalog to trade partners.', role: 'Sales / Marketing', checklist: ['Catalog sent to distributors', 'Catalog sent to bookstore buyers', 'Catalog sent to library contacts', 'Digital catalog available on website', 'Edelweiss catalog updated', 'Trade show/conference copies ordered'] },
    ],
  },
  {
    title: 'Readers Circle / Book Club Kit',
    category: 'operations',
    icon: '📚',
    description: 'Creating and distributing book club discussion kits for the Readers Circle program.',
    steps: [
      { id: 'rc-1', title: 'Kit Creation', description: 'Develop book club discussion materials.', role: 'Marketing / Editor', checklist: ['Discussion questions written (10-15 questions)', 'Author\'s note/letter included', 'Themes and motifs highlighted', 'Suggested pairing reads listed', 'Recipe/activity tie-in (if applicable)', 'Author availability for virtual visit noted', 'Downloadable PDF designed'] },
      { id: 'rc-2', title: 'Distribution', description: 'Make kit available through all channels.', role: 'Marketing Coordinator', checklist: ['PDF uploaded to website (book detail page)', 'Kit included in ARC mailings', 'Kit sent to book club contacts in CRM', 'Kit shared on Readers Circle page', 'Librarians notified of availability', 'Social media promotion'] },
      { id: 'rc-3', title: 'Community Engagement', description: 'Support book clubs reading the title.', role: 'Community Manager', checklist: ['Book club sign-ups tracked', 'Author virtual visits scheduled', 'Book club reader feedback collected', 'Community discussion forum moderated', 'Follow-up reading recommendations sent'] },
    ],
  },
  {
    title: 'Beta Reader Campaign Management',
    category: 'operations',
    icon: '👥',
    description: 'Running beta reading campaigns for manuscripts in development.',
    steps: [
      { id: 'beta-1', title: 'Campaign Setup', description: 'Define beta reading campaign parameters.', role: 'Editor', checklist: ['Manuscript stage confirmed (draft complete, post-dev edit)', 'Number of beta readers needed (10-20)', 'Reader profile defined (genre readers, sensitivity readers, target demographic)', 'Timeline established (typically 4-6 weeks)', 'Feedback questions drafted', 'NDA/agreement prepared'] },
      { id: 'beta-2', title: 'Recruitment', description: 'Find and onboard beta readers.', role: 'Community Manager', checklist: ['Call for beta readers posted (community, social media)', 'Applications reviewed', 'Readers selected and contacted', 'NDAs signed', 'Manuscripts distributed securely', 'Deadline and expectations communicated'] },
      { id: 'beta-3', title: 'Feedback Collection', description: 'Collect and synthesize beta reader feedback.', role: 'Editor', checklist: ['Mid-read check-in conducted', 'Feedback surveys collected', 'Individual responses reviewed', 'Common themes identified', 'Feedback summary report created', 'Report shared with author and dev editor'] },
      { id: 'beta-4', title: 'Acknowledgment', description: 'Thank and acknowledge beta readers.', role: 'Community Manager', checklist: ['Thank-you emails sent', 'Beta reader credits confirmed for acknowledgments', 'Complimentary finished copy promised', 'Beta readers added to CRM for future campaigns'] },
    ],
  },
  {
    title: 'Anthology Curation & Production',
    category: 'operations',
    icon: '📕',
    description: 'Complete workflow for curating, editing, and producing themed anthologies.',
    steps: [
      { id: 'anth-1', title: 'Concept & Call', description: 'Define anthology theme and issue call for submissions.', role: 'Anthology Editor', checklist: ['Theme/concept finalized', 'Submission guidelines written', 'Pay rates established', 'Open/invite-only decision made', 'Call for submissions published', 'Submission deadline set', 'Constellation voting integrated (if community-curated)'] },
      { id: 'anth-2', title: 'Selection', description: 'Read and select stories for the anthology.', role: 'Anthology Editor', checklist: ['All submissions read', 'Shortlist created', 'Invited contributors confirmed', 'Balance checked (diversity of voice, style, subgenre)', 'Acceptance/rejection notices sent', 'Contracts issued for selected stories'] },
      { id: 'anth-3', title: 'Editing', description: 'Edit selected stories.', role: 'Anthology Editor', checklist: ['Individual story edits completed', 'Story order determined', 'Transitions and flow checked', 'Introduction/foreword written', 'Contributor bios collected', 'Permissions cleared for any reprints'] },
      { id: 'anth-4', title: 'Production', description: 'Produce the anthology.', role: 'Production Manager', checklist: ['Interior typeset', 'Cover designed', 'ISBNs assigned', 'Copyright page prepared (per-story copyrights)', 'Proofs reviewed', 'Files uploaded to printer/distributor'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // COMMUNITY & READER ENGAGEMENT (5)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Constellation Voting Campaign',
    category: 'community',
    icon: '⭐',
    description: 'Running community constellation voting for themed anthology curation and reader engagement.',
    steps: [
      { id: 'const-1', title: 'Theme Proposal', description: 'Propose constellation themes for community voting.', role: 'Community Manager', checklist: ['3-5 theme concepts developed', 'Theme descriptions written', 'Visual mood boards created per theme', 'Voting mechanism set up on platform', 'Voting announcement drafted'] },
      { id: 'const-2', title: 'Voting Period', description: 'Run the community voting period.', role: 'Community Manager', checklist: ['Voting opened on Runeweave', 'Announcement posted (newsletter, social, community)', 'Daily engagement with voter comments', 'Voting progress shared', 'Voting closed on deadline', 'Results tallied'] },
      { id: 'const-3', title: 'Results & Action', description: 'Announce results and initiate anthology or curated collection.', role: 'Community Manager / Editor', checklist: ['Winning theme announced', 'Thank-you to all voters', 'Call for submissions issued (if anthology)', 'Curated reading list published (if collection)', 'Next constellation voting teased'] },
    ],
  },
  {
    title: 'Forge (Creative Writing Tool) Content Update',
    category: 'community',
    icon: '🔥',
    description: 'Updating writing prompts, worldbuilding tools, and creative resources in the Forge.',
    steps: [
      { id: 'forge-1', title: 'Content Audit', description: 'Review current Forge content and identify gaps.', role: 'Content Manager', checklist: ['Current prompt categories reviewed', 'Usage analytics analyzed', 'Community feedback collected', 'Gap analysis completed', 'New content themes identified'] },
      { id: 'forge-2', title: 'Content Creation', description: 'Create new prompts, generators, and resources.', role: 'Content Manager', checklist: ['New writing prompts written (20+)', 'Character generators updated', 'Worldbuilding templates added', 'Genre-specific resources created', 'Author tips/craft essays added'] },
      { id: 'forge-3', title: 'Publication', description: 'Publish new content to the Forge.', role: 'Content Manager', checklist: ['Content uploaded to CMS', 'Categorization and tagging completed', 'Community announcement posted', 'Newsletter feature sent', 'Usage tracking enabled'] },
    ],
  },
  {
    title: 'Reading Challenge / Wrap Program',
    category: 'community',
    icon: '🎯',
    description: 'Organizing seasonal reading challenges and year-end reading wrap experiences.',
    steps: [
      { id: 'read-1', title: 'Challenge Design', description: 'Design the reading challenge structure.', role: 'Community Manager', checklist: ['Challenge theme set (seasonal, genre-based, diversity-focused)', 'Categories/prompts created (15-25)', 'Point system defined (if gamified)', 'Prizes/rewards planned', 'Start and end dates set', 'Tracking mechanism chosen'] },
      { id: 'read-2', title: 'Launch & Promotion', description: 'Launch the reading challenge.', role: 'Community Manager', checklist: ['Challenge page created on website', 'Social media launch campaign', 'Newsletter announcement', 'Downloadable challenge card/bingo designed', 'Partner bookstores/libraries notified'] },
      { id: 'read-3', title: 'Ongoing Engagement', description: 'Keep participants engaged throughout the challenge.', role: 'Community Manager', checklist: ['Weekly check-in posts', 'Mid-challenge spotlight features', 'Progress sharing encouraged', 'Community discussions facilitated', 'End-of-challenge wrap-up', 'Winners announced (if applicable)', 'Reading Wrapped data generated for participants'] },
    ],
  },
  {
    title: 'Membership Program Management',
    category: 'community',
    icon: '👑',
    description: 'Managing the membership/subscription program including perks, renewals, and exclusive content.',
    steps: [
      { id: 'mem-1', title: 'Monthly Content Planning', description: 'Plan exclusive member content for the month.', role: 'Community Manager', checklist: ['Exclusive excerpt or short story selected', 'Author Q&A or AMA scheduled', 'Behind-the-scenes content prepared', 'Early access to new title announcements', 'Member-only discount codes generated', 'Content calendar finalized'] },
      { id: 'mem-2', title: 'Content Delivery', description: 'Deliver monthly member content.', role: 'Community Manager', checklist: ['Content uploaded to member portal', 'Member newsletter sent', 'Discord/community exclusive posted', 'Physical perks shipped (if applicable)'] },
      { id: 'mem-3', title: 'Member Health', description: 'Monitor membership health and retention.', role: 'Operations / Marketing', checklist: ['New member welcomes sent', 'Renewal reminders sent (30, 14, 7 days before)', 'Churn rate monitored', 'Exit surveys reviewed', 'Retention strategies adjusted', 'Member feedback incorporated'] },
    ],
  },
  {
    title: 'Content Compass / Mood Matcher Update',
    category: 'community',
    icon: '🧭',
    description: 'Updating the recommendation engine and mood-based discovery tools.',
    steps: [
      { id: 'compass-1', title: 'Data Update', description: 'Update book data for recommendation algorithms.', role: 'Content Manager', checklist: ['New titles added to recommendation pool', 'Tags and mood markers updated', 'Content warnings/triggers updated', 'Similar-title connections mapped', 'Reader rating data incorporated'] },
      { id: 'compass-2', title: 'Algorithm Tuning', description: 'Adjust recommendation logic based on user behavior.', role: 'Technical Lead', checklist: ['User interaction data analyzed', 'Recommendation accuracy reviewed', 'A/B test results evaluated', 'Algorithm weights adjusted', 'New mood categories added (if needed)', 'Feature flags updated'] },
      { id: 'compass-3', title: 'QA & Launch', description: 'Test and deploy updates.', role: 'QA / Technical Lead', checklist: ['Updated recommendations tested', 'Edge cases checked', 'Performance impact assessed', 'Changes deployed', 'User feedback monitored post-deploy'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // EDITORIAL & QUALITY — BATCH 2 (3)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Manuscript Quality Rubric Evaluation',
    category: 'editorial',
    icon: '📊',
    description: 'Standardized rubric-based evaluation for manuscript acquisitions. Scores on 7 criteria to ensure consistent, fair assessment.',
    steps: [
      { id: 'rub-1', title: 'Initial Read & Scoring', description: 'Read manuscript and score on the 7-point rubric.', role: 'Acquisitions Editor', checklist: ['Full manuscript read', 'Voice & Craft scored (1-5)', 'Structure & Pacing scored (1-5)', 'Character Development scored (1-5)', 'Worldbuilding & Setting scored (1-5)', 'Representation & Authenticity scored (1-5)', 'Market Viability scored (1-5)', 'Mission Alignment scored (1-5)', 'Total score calculated (out of 35)', 'Written justification for each score'] },
      { id: 'rub-2', title: 'Second Reader Evaluation', description: 'Independent second reader scores the manuscript without seeing first scores.', role: 'Second Reader', checklist: ['Second reader assigned', 'Independent scoring completed', 'Written commentary submitted', 'Score comparison prepared'] },
      { id: 'rub-3', title: 'Committee Review', description: 'Present both evaluations to editorial committee for decision.', role: 'Editor-in-Chief', checklist: ['Score comparison sheet prepared', 'Discrepancies flagged for discussion', 'Committee meeting held', 'P&L projection reviewed', 'Decision recorded: Accept / Revise & Resubmit / Decline', 'Decision communicated to acquisitions editor'] },
      { id: 'rub-4', title: 'Author Communication', description: 'Communicate decision to author with constructive feedback.', role: 'Acquisitions Editor', checklist: ['Decision letter drafted', 'Constructive feedback included (regardless of decision)', 'If accepted: next steps outlined', 'If R&R: specific revision guidance provided', 'If declined: encouraging personalized rejection', 'Response sent within 48 hours of committee decision'] },
    ],
  },
  {
    title: 'Sensitivity Review Remediation',
    category: 'editorial',
    icon: '⚠️',
    description: 'Protocol for when sensitivity issues are discovered post-publication. Covers assessment, remediation, and communication.',
    steps: [
      { id: 'senr-1', title: 'Issue Assessment', description: 'Evaluate the severity and scope of the sensitivity concern.', role: 'Editor-in-Chief', checklist: ['Source of concern documented (reader feedback, internal review, media)', 'Specific passages/elements identified', 'Severity assessed (minor inaccuracy vs. harmful representation)', 'Impact scope determined (single passage vs. core narrative element)', 'Sensitivity reader consultation scheduled', 'Legal counsel consulted if needed'] },
      { id: 'senr-2', title: 'Stakeholder Communication', description: 'Brief author and internal team on the concern.', role: 'Editor-in-Chief', checklist: ['Author notified privately and sensitively', 'Author perspective heard and documented', 'Internal team briefed', 'Communication plan drafted', 'Social media response plan prepared (if public)', 'External statement drafted (if needed)'] },
      { id: 'senr-3', title: 'Remediation Plan', description: 'Develop and execute corrections.', role: 'Editor', checklist: ['Sensitivity reader report completed', 'Corrections identified and agreed with author', 'Revised text prepared', 'Updated eBook files created', 'Updated print files created (for next print run)', 'Audiobook corrections assessed (errata note or re-record)'] },
      { id: 'senr-4', title: 'Publication Update', description: 'Deploy corrected editions and communicate transparently.', role: 'Production Manager', checklist: ['Updated eBook pushed to all retailers', 'Updated print files uploaded to IngramSpark', 'Author note/acknowledgment added (if appropriate)', 'Public statement issued (if issue was public)', 'Internal debrief conducted', 'Process improvements documented'] },
    ],
  },
  {
    title: 'Backlist Title Refresh',
    category: 'editorial',
    icon: '🔄',
    description: 'Annual workflow for refreshing backlist titles to sustain sales — covers cover updates, metadata, pricing, and promotions.',
    steps: [
      { id: 'back-1', title: 'Performance Audit', description: 'Review sales data and identify refresh candidates.', role: 'Operations', checklist: ['Trailing 12-month sales pulled per title', 'YoY change calculated', 'Titles categorized: Evergreen / Declining / Dormant', 'Current review count and rating checked', 'Category ranking assessed', 'Refresh candidates shortlisted'] },
      { id: 'back-2', title: 'Cover Assessment', description: 'Evaluate whether cover needs updating.', role: 'Art Director / Publisher', checklist: ['Cover compared to current genre trends', 'Cover age assessed (3+ years = candidate)', 'Sales decline correlated with cover staleness', 'Cover refresh budget approved (if needed)', 'Cover designer briefed'] },
      { id: 'back-3', title: 'Metadata & Pricing Refresh', description: 'Update all metadata and optimize pricing.', role: 'Marketing', checklist: ['Book description rewritten with fresh hooks', 'New comp titles added', 'Keywords updated for current search trends', 'BISAC codes reviewed', 'Review quotes updated (new reviews, award wins)', 'Price point evaluated for current market', 'Series metadata verified'] },
      { id: 'back-4', title: 'Promotion Push', description: 'Execute promotional campaign for refreshed title.', role: 'Marketing', checklist: ['BookBub deal submitted', 'Freebooksy/Bargain Booksy listing', 'Newsletter feature scheduled', 'Social media campaign planned', 'Cross-promotion with new releases', 'Amazon ad campaign (re)launched', 'Results tracked after 30/60/90 days'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PRODUCTION & DISTRIBUTION — BATCH 2 (4)
  // ═══════════════════════════════════════════════════════
  {
    title: 'eBook Quality Assurance',
    category: 'production',
    icon: '📱',
    description: 'Comprehensive QA workflow for validating eBook files before distribution.',
    steps: [
      { id: 'eqa-1', title: 'File Validation', description: 'Validate EPUB file against industry standards.', role: 'Production Manager', checklist: ['EPUBCheck validation passed (zero errors)', 'File size within platform limits', 'Cover image embedded and correct', 'Metadata embedded (title, author, ISBN, publisher)', 'Table of contents functional', 'Copyright page complete'] },
      { id: 'eqa-2', title: 'Device Testing', description: 'Test eBook on all major reading platforms.', role: 'QA Tester', checklist: ['Kindle Previewer test passed', 'Apple Books test passed', 'Kobo reading test', 'Google Play Books test', 'Generic EPUB reader test (Calibre)', 'Font rendering checked on each platform', 'Image display verified', 'Hyperlinks functional (TOC, footnotes, external)'] },
      { id: 'eqa-3', title: 'Content Review', description: 'Spot-check content for formatting issues.', role: 'QA Tester', checklist: ['Chapter breaks render correctly', 'Scene breaks visible', 'Special characters display properly', 'Italics/bold preserved', 'Drop caps or special formatting intact', 'Front matter pages correct', 'Back matter (about author, also-by) present', 'Content warnings page included'] },
      { id: 'eqa-4', title: 'Certification & Upload', description: 'Certify file as distribution-ready and upload.', role: 'Production Manager', checklist: ['QA sign-off recorded', 'Final file archived', 'Uploaded to KDP', 'Uploaded to IngramSpark', 'Uploaded to Draft2Digital / Smashwords', 'Uploaded to Google Play', 'Pre-order / live date confirmed across all platforms'] },
    ],
  },
  {
    title: 'Audiobook Production',
    category: 'production',
    icon: '🎧',
    description: 'End-to-end workflow for producing and distributing audiobooks.',
    steps: [
      { id: 'aud-1', title: 'Narrator Selection', description: 'Cast the right narrator for the book.', role: 'Producer', checklist: ['Narrator requirements defined (accent, tone, gender)', 'Audition scripts prepared (3 selections: dialogue, action, emotional)', 'Auditions received (minimum 3 narrators)', 'Author involved in selection', 'Narrator selected and contracted', 'Rate agreed (per finished hour)', 'NDA signed', 'Production timeline set'] },
      { id: 'aud-2', title: 'Recording', description: 'Record the audiobook with quality standards.', role: 'Narrator / Producer', checklist: ['Studio booked or home studio verified', 'Pronunciation guide provided to narrator', 'Character voice guide created', 'Recording sessions scheduled', 'First 15 minutes reviewed for quality/direction', 'Weekly check-ins during recording', 'Raw files received and backed up'] },
      { id: 'aud-3', title: 'Post-Production', description: 'Edit, master, and QA the audio files.', role: 'Audio Engineer', checklist: ['Noise floor verified (below -60dB)', 'Room tone consistent', 'Mouth clicks and breaths cleaned', 'Chapter markers inserted', 'Opening/closing credits added', 'Mastered to ACX specifications', 'Final files in required format (MP3, M4B)'] },
      { id: 'aud-4', title: 'QA Review', description: 'Quality check the finished audiobook.', role: 'Producer / Author', checklist: ['Full listen-through completed', 'Mispronunciations flagged and corrected', 'Audio quality consistent throughout', 'Chapter breaks and markers accurate', 'Author sign-off received'] },
      { id: 'aud-5', title: 'Distribution', description: 'Distribute to all audio platforms.', role: 'Production Manager', checklist: ['Uploaded to ACX/Audible (if exclusive) or Findaway Voices', 'Uploaded to Libro.fm (indie audiobookstore)', 'Uploaded to Apple Books', 'Cover image (square format) prepared and uploaded', 'Metadata completed on all platforms', 'Release date confirmed', 'Marketing notified for launch'] },
    ],
  },
  {
    title: 'Offset Print Run Management',
    category: 'production',
    icon: '🏭',
    description: 'Managing a traditional offset print run from quoting through fulfillment — for special editions or high-volume orders.',
    steps: [
      { id: 'off-1', title: 'Specification & Quoting', description: 'Define print specifications and obtain quotes.', role: 'Production Manager', checklist: ['Trim size confirmed', 'Page count finalized', 'Paper stock selected (weight, color, finish)', 'Binding type chosen (perfect, case, Smyth-sewn)', 'Special features specified (foil, sprayed edges, endpapers, ribbon)', 'Quantity determined', 'Quotes obtained from 3+ printers', 'Shipping costs estimated', 'Budget approved by Publisher'] },
      { id: 'off-2', title: 'Prepress', description: 'Prepare final files for the printer.', role: 'Production Manager / Designer', checklist: ['Interior PDF/X-1a exported', 'Cover PDF exported (CMYK, full bleed, spine calculation)', 'Special finishes specified in file', 'Files sent to printer', 'Digital proof reviewed', 'Physical proof (F&G) received and reviewed', 'Color proof approved', 'Press proof approved (if attending press check)'] },
      { id: 'off-3', title: 'Production', description: 'Monitor the print run.', role: 'Production Manager', checklist: ['Production start confirmed', 'Mid-run quality check (if possible)', 'Overrun/underrun tolerance agreed (typically 5-10%)', 'Production completion confirmed', 'Inspection photos received', 'Quality inspection passed'] },
      { id: 'off-4', title: 'Fulfillment', description: 'Receive and distribute printed books.', role: 'Operations', checklist: ['Shipping arranged (printer to warehouse/fulfillment)', 'Books received and inventoried', 'Spot-check quality on arrival', 'Inventory entered in tracking system', 'Pre-orders fulfilled', 'Bookstore/library orders shipped', 'Remaining stock stored properly (climate-controlled)'] },
    ],
  },
  {
    title: 'International Rights Submission',
    category: 'distribution',
    icon: '🌍',
    description: 'Workflow for pitching and licensing translation and international rights to foreign publishers.',
    steps: [
      { id: 'intl-1', title: 'Candidate Identification', description: 'Identify titles with strong international potential.', role: 'Rights Manager', checklist: ['Titles with universal themes flagged', 'Award winners/nominees prioritized', 'Titles with international comp titles identified', 'Series with multi-book commitment potential noted', 'Author enthusiasm for international editions confirmed'] },
      { id: 'intl-2', title: 'Materials Preparation', description: 'Create rights submission materials.', role: 'Rights Manager', checklist: ['One-page rights guide per title (cover, synopsis, sales, reviews)', 'Seasonal rights catalog compiled', 'Sample translation (first chapter) commissioned (for priority markets)', 'Author biography translated (for select markets)', 'Sales data and review quotes compiled'] },
      { id: 'intl-3', title: 'Pitching', description: 'Pitch to target publishers in each market.', role: 'Rights Manager', checklist: ['Target publishers identified per market/language', 'Rights catalog submitted to Frankfurt/London Book Fair centers', 'Direct outreach emails sent', 'Follow-up calls/meetings scheduled', 'Book fair meetings attended (if applicable)', 'Responses tracked in CRM'] },
      { id: 'intl-4', title: 'Deal Negotiation', description: 'Negotiate and close translation rights deals.', role: 'Rights Manager / Publisher', checklist: ['Offer received and reviewed', 'Terms negotiated (advance, royalty, territory, term)', 'Author consulted and approved', 'Contract drafted/reviewed by legal', 'Contract signed by both parties', 'Advance payment received', 'Author notified of deal'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // MARKETING & COMMUNICATIONS — BATCH 2 (4)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Award Submission Workflow',
    category: 'marketing',
    icon: '🏆',
    description: 'Step-by-step process for submitting titles to literary awards — from eligibility check through promotion of results.',
    steps: [
      { id: 'awd-1', title: 'Eligibility Screening', description: 'Determine which awards each title is eligible for.', role: 'Marketing Manager', checklist: ['Publication date verified against award eligibility window', 'Genre/category eligibility confirmed', 'Membership requirements checked (SFWA, HWA, etc.)', 'Entry fee budgeted', 'Awards calendar updated with deadlines', 'Author notified of planned submissions'] },
      { id: 'awd-2', title: 'Materials Preparation', description: 'Prepare all submission materials.', role: 'Marketing Manager', checklist: ['Entry form completed', 'Synopsis prepared (per award requirements)', 'Physical copies ordered/set aside (if required)', 'Digital files prepared (PDF, EPUB)', 'Author bio and headshot ready', 'Publication data compiled (ISBN, price, page count)', 'Cover image (high-res) ready'] },
      { id: 'awd-3', title: 'Submission', description: 'Submit entries and track confirmation.', role: 'Marketing Manager', checklist: ['Online entry submitted OR physical copies mailed', 'Entry fee paid', 'Confirmation of receipt obtained', 'Submission logged in tracking spreadsheet', 'Expected announcement date noted', 'Reminder set for results date'] },
      { id: 'awd-4', title: 'Results & Promotion', description: 'Handle nomination/win announcements.', role: 'Marketing Manager', checklist: ['Results monitored on announcement date', 'If nominated: social media announcement within 24 hours', 'If nominated: newsletter feature prepared', 'If nominated: retailer metadata updated with "FINALIST"', 'If won: cover updated with award badge', 'If won: press release issued', 'If won: promotional pricing campaign launched', 'All awards activity logged for annual review'] },
    ],
  },
  {
    title: 'Book Launch Campaign',
    category: 'marketing',
    icon: '🚀',
    description: 'Comprehensive launch campaign from T-6 months through T+3 months — the full playbook for every title release.',
    steps: [
      { id: 'launch-1', title: 'T-6 Months: Foundation', description: 'Set up launch infrastructure and begin early buzz.', role: 'Marketing Manager', checklist: ['Launch date confirmed', 'Pre-order pages live on all retailers', 'NetGalley listing created', 'ARC production scheduled', 'Influencer/reviewer target list finalized (50+ contacts)', 'Launch team assembled (street team, super-fans)', 'Marketing budget allocated'] },
      { id: 'launch-2', title: 'T-4 Months: ARCs & Outreach', description: 'Distribute ARCs and begin outreach.', role: 'Marketing Manager', checklist: ['ARCs printed and/or digital copies ready', 'ARCs distributed to top 30-50 reviewers', 'Blog tour hosts recruited (10-15 stops)', 'Author interviews scheduled (podcast, print, video)', 'Cover reveal date set and exclusive partner chosen', 'BookBub pre-order alert submitted'] },
      { id: 'launch-3', title: 'T-2 Months: Build Momentum', description: 'Ramp up visibility and excitement.', role: 'Marketing Manager', checklist: ['Cover reveal executed', 'Social media countdown campaign started', 'Excerpt/teaser content published', 'Author talking points finalized', 'Launch event details confirmed (virtual or in-person)', 'Email pre-launch sequence drafted', 'Amazon A+ Content created (if applicable)'] },
      { id: 'launch-4', title: 'Launch Week', description: 'Execute the launch.', role: 'Marketing Manager / Author', checklist: ['Launch day social media blitz', 'Newsletter blast to full list', 'All ad campaigns activated (Amazon, BookBub, social)', 'Launch event held', 'Author guest posts/interviews go live', 'Influencer posts coordinated', 'Sales monitored in real-time', 'Thank-you messages sent to launch team'] },
      { id: 'launch-5', title: 'T+1 to T+3 Months: Sustain', description: 'Maintain momentum and optimize.', role: 'Marketing Manager', checklist: ['Blog tour runs', 'Review monitoring and amplification', 'Ad campaigns optimized based on data', 'Reader Circle / book club outreach', 'Award submissions filed', 'Backlist cross-promotion activated', 'Post-mortem report written (what worked, what didnt)', '90-day sales assessment'] },
    ],
  },
  {
    title: 'Crisis Communications Response',
    category: 'marketing',
    icon: '🚨',
    description: 'Protocol for handling PR crises — author controversy, bad press, piracy, legal threats, or social media blowups.',
    steps: [
      { id: 'crisis-1', title: 'Incident Detection & Triage', description: 'Identify and assess the crisis.', role: 'Publisher / Marketing', checklist: ['Incident source identified (social media, press, internal)', 'Severity assessed: Low (grumbling) / Medium (trending) / High (mainstream press)', 'All scheduled social media posts paused', 'Internal stakeholders notified', 'Facts gathered before any public response', 'Legal counsel engaged (if legal risk involved)'] },
      { id: 'crisis-2', title: 'Response Development', description: 'Develop appropriate response strategy.', role: 'Publisher', checklist: ['Response strategy chosen: Acknowledge / Apologize / Clarify / No comment', 'Draft statement written', 'Statement reviewed by legal counsel', 'Author consulted (if author-related)', 'Advocacy Board consulted (if representation issue)', 'Statement approved by Publisher'] },
      { id: 'crisis-3', title: 'Response Execution', description: 'Deploy the response.', role: 'Marketing / Publisher', checklist: ['Statement posted on appropriate channel(s)', 'Direct responses to key stakeholders sent', 'Social media monitored for reaction', 'Trolls/bad-faith actors blocked without engagement', 'FAQ prepared for team if receiving inquiries', 'Media inquiries routed to Publisher'] },
      { id: 'crisis-4', title: 'Recovery & Debrief', description: 'Monitor resolution and learn from the incident.', role: 'Publisher', checklist: ['Ongoing monitoring for 7-14 days', 'Follow-up actions completed (if commitments made)', 'Internal debrief held', 'Process improvements documented', 'Crisis playbook updated', 'Team wellness check (crises are stressful)'] },
    ],
  },
  {
    title: 'Author Onboarding Workflow',
    category: 'marketing',
    icon: '🤝',
    description: 'Complete onboarding process for new authors from signed contract to first editorial call.',
    steps: [
      { id: 'onb-1', title: 'Welcome & Administration', description: 'Send welcome materials and collect essential information.', role: 'Operations', checklist: ['Welcome email sent with Rüna Atlas welcome packet', 'Signed contract filed', 'Author information form collected (legal name, pen name, address, SSN/TIN)', 'W-9 received (for US-based authors)', 'Payment information collected', 'Author portal account created', 'Author added to internal CRM'] },
      { id: 'onb-2', title: 'Platform Assessment', description: 'Evaluate author platform and set goals.', role: 'Marketing Manager', checklist: ['Social media presence assessed', 'Email newsletter status checked', 'Website reviewed (or noted as needed)', 'Goodreads author profile claimed', 'Platform tier assigned (Emerging/Developing/Established/Strong)', 'Platform building recommendations provided'] },
      { id: 'onb-3', title: 'Editorial Setup', description: 'Initialize the editorial process.', role: 'Editor', checklist: ['Assigned editor introduced to author', 'Editorial timeline shared', 'Style guide and house preferences provided', 'Manuscript submission format confirmed', 'Communication preferences established (email, Slack, calls)', 'First editorial kickoff call scheduled'] },
      { id: 'onb-4', title: 'Marketing Foundation', description: 'Collect marketing assets and set expectations.', role: 'Marketing Manager', checklist: ['Marketing questionnaire sent and collected', 'Professional author headshot requested', 'Author bio collected (short, medium, long versions)', 'Comp titles and influences discussed', 'Author availability for events confirmed', 'Newsletter cross-promotion set up', 'Author page created on runaatlas.com'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // COMMUNITY & ENGAGEMENT — BATCH 2 (3)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Reader Circle Launch',
    category: 'community',
    icon: '📖',
    description: 'Launching and running a Reader Circle (guided book club) for a specific title.',
    steps: [
      { id: 'rc-1', title: 'Title Selection & Planning', description: 'Choose the book and plan the circle.', role: 'Community Manager', checklist: ['Title selected (consider launch timing, diversity, discussion potential)', 'Discussion guide written (10-15 questions)', 'Timeline set (typically 4-6 weeks)', 'Maximum participants determined (15-30)', 'Author participation confirmed (Q&A, live chat, or written responses)', 'Registration page created'] },
      { id: 'rc-2', title: 'Recruitment', description: 'Recruit and onboard circle participants.', role: 'Community Manager', checklist: ['Call for participants posted (newsletter, social, community)', 'Applications/registrations reviewed', 'Participants selected and notified', 'Books distributed (eBook codes or physical copies)', 'Welcome message sent with schedule and guidelines', 'Community space set up (Discord channel, forum thread, or group)'] },
      { id: 'rc-3', title: 'Facilitation', description: 'Run the reading and discussion period.', role: 'Community Manager', checklist: ['Weekly discussion prompts posted on schedule', 'Moderator present for each discussion session', 'Engagement monitored and encouraged', 'Mid-read check-in poll conducted', 'Content warnings shared proactively where needed', 'Author interaction facilitated (guest appearance, written Q&A)'] },
      { id: 'rc-4', title: 'Wrap-Up & Conversion', description: 'Close the circle and convert engaged readers.', role: 'Community Manager', checklist: ['Final discussion and reflection session held', 'Participants invited to post reviews (Goodreads, Amazon, StoryGraph)', 'Thank-you message and certificate/badge sent', 'Feedback survey collected', 'Active members invited to future circles', 'Best quotes/testimonials saved for marketing', 'Metrics recorded (participation rate, review conversion, sentiment)'] },
    ],
  },
  {
    title: 'Influencer Campaign',
    category: 'community',
    icon: '📸',
    description: 'End-to-end workflow for executing a paid or gifted influencer marketing campaign.',
    steps: [
      { id: 'inf-1', title: 'Research & Selection', description: 'Identify and vet influencers for the campaign.', role: 'Marketing Manager', checklist: ['Campaign goals defined (awareness, reviews, pre-orders)', 'Target audience matched to influencer audience', 'Potential influencers identified (15-20 candidates)', 'Engagement rates verified (not just follower count)', 'Previous book content quality assessed', 'Diversity of platforms considered (Bookstagram, BookTok, BookTube)', 'Final influencer list approved (5-10 selected)'] },
      { id: 'inf-2', title: 'Outreach & Negotiation', description: 'Contact influencers and agree on terms.', role: 'Marketing Manager', checklist: ['Personalized outreach emails sent', 'Campaign terms discussed (gifted vs. paid, timeline, content type)', 'Rates negotiated (if paid campaign)', 'Content requirements clarified (post type, hashtags, buy links)', 'FTC disclosure requirements communicated', 'Agreement/contract signed', 'Payment processed (if upfront)'] },
      { id: 'inf-3', title: 'Execution', description: 'Ship products and coordinate content.', role: 'Marketing Manager', checklist: ['ARCs/finished copies shipped with press kit', 'Influencer confirmed receipt', 'Content timeline confirmed', 'Draft content reviewed (if approval rights negotiated)', 'Posts go live on schedule', 'Rüna Atlas amplifies influencer content (reshare, comment)', 'Cross-promotion across our channels'] },
      { id: 'inf-4', title: 'Measurement & Follow-Up', description: 'Track results and maintain relationships.', role: 'Marketing Manager', checklist: ['Posts saved and screenshotted for records', 'Engagement metrics collected (likes, comments, shares, views)', 'Referral traffic tracked (UTM links)', 'Sales impact estimated', 'ROI calculated', 'Thank-you message sent', 'Top performers flagged for future campaigns', 'Campaign report written'] },
    ],
  },
  {
    title: 'Blog Tour Execution',
    category: 'community',
    icon: '🗺️',
    description: 'Planning and executing a multi-stop blog tour for a new release.',
    steps: [
      { id: 'blog-1', title: 'Tour Planning', description: 'Design the blog tour structure and recruit host blogs.', role: 'Marketing Manager', checklist: ['Tour dates set (typically 1-2 weeks)', 'Number of stops determined (10-15)', 'Content types assigned (review, interview, excerpt, guest post, spotlight)', 'Potential host blogs identified (genre-relevant, engaged audience)', 'Outreach emails sent to blog hosts', 'Blog hosts confirmed and scheduled', 'Tour calendar finalized'] },
      { id: 'blog-2', title: 'Materials Preparation', description: 'Create and distribute all tour materials.', role: 'Marketing Manager', checklist: ['Press kit compiled (cover images, synopsis, author bio, headshot)', 'Interview questions drafted (unique per stop if possible)', 'Guest post topics assigned and collected from author', 'Excerpt selections chosen', 'Giveaway prizes prepared (signed copies, swag, gift cards)', 'All materials sent to blog hosts 2+ weeks before their stop'] },
      { id: 'blog-3', title: 'Tour Execution', description: 'Run the tour day by day.', role: 'Marketing Manager / Author', checklist: ['Each day: verify post is live', 'Each day: share blog post on all Rüna Atlas social channels', 'Each day: author engages in comments on blog post', 'Cross-promote between tour stops', 'Monitor engagement and traffic', 'Giveaway entries tracked'] },
      { id: 'blog-4', title: 'Tour Wrap-Up', description: 'Close the tour and measure results.', role: 'Marketing Manager', checklist: ['Giveaway winners selected and notified', 'Prizes shipped', 'Thank-you notes sent to all blog hosts', 'Tour metrics compiled (page views, comments, social shares)', 'Best review quotes pulled for marketing', 'Host blogs added to partnership database for future tours', 'Post-mortem report written'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // OPERATIONS — BATCH 2 (1)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Quarterly Financial Review',
    category: 'operations',
    icon: '💹',
    description: 'Standard quarterly financial review process — P&L analysis, royalty calculations, tax estimates, and budget comparison.',
    steps: [
      { id: 'fin-1', title: 'Data Gathering', description: 'Collect all revenue and expense data for the quarter.', role: 'Operations', checklist: ['Retailer sales reports downloaded (Amazon, Ingram, D2D, Apple, Google, Kobo)', 'Direct sales data exported', 'Subscription/membership revenue totaled', 'Rights licensing income recorded', 'All expenses categorized in accounting software', 'Bank statements reconciled', 'Outstanding invoices (payable and receivable) identified'] },
      { id: 'fin-2', title: 'Per-Title P&L', description: 'Calculate profit and loss for each active title.', role: 'Operations', checklist: ['Revenue per title calculated (by format)', 'Direct costs per title tallied (editorial, design, production)', 'Marketing spend per title allocated', 'Overhead allocation applied (if used)', 'Net profit/loss per title calculated', 'ROI per title determined', 'Titles ranked by profitability'] },
      { id: 'fin-3', title: 'Royalty Calculations', description: 'Calculate author royalties for the period.', role: 'Operations', checklist: ['Net receipts per title calculated', 'Milestone tier verified per title', 'Royalty amount computed at applicable rate', 'Advance earn-out status checked', 'Milestone bonuses triggered?', 'Subsidiary rights income allocated', 'Royalty statements drafted', 'Statements reviewed for accuracy'] },
      { id: 'fin-4', title: 'Tax & Budget Review', description: 'Estimate taxes and compare against budget.', role: 'Operations / Publisher', checklist: ['Quarterly tax estimate calculated', 'Tax payment made (federal + state)', '1099 obligations tracked', 'Budget vs actual comparison prepared', 'Variance analysis for major deviations', 'Cash reserve status checked (3-month target)', 'Next quarter budget adjustments recommended', 'Financial summary presented to Publisher'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // BUSINESS & STRATEGY — BATCH 3 (3)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Annual Business Planning & Budget',
    category: 'operations',
    icon: '📈',
    description: 'Annual strategic planning process — set goals, build the budget, plan the catalog, and align all departments.',
    steps: [
      { id: 'abp-1', title: 'Year-in-Review', description: 'Assess the previous year performance.', role: 'Publisher', checklist: ['Total revenue vs target', 'Per-title P&L reviewed', 'Marketing ROI assessed', 'Author satisfaction surveyed', 'Community growth metrics reviewed', 'Awards won/nominated compiled', 'Biggest wins and failures identified', 'Team feedback collected'] },
      { id: 'abp-2', title: 'Strategic Goal Setting', description: 'Define goals for the coming year.', role: 'Publisher', checklist: ['Revenue target set', 'Number of titles to publish determined', 'Genre/imprint mix decided', 'Diversity targets confirmed', 'New market/format goals (audio, international, etc.)', 'Community growth targets set', 'Author acquisition goals set', 'Key hires or freelancer needs identified'] },
      { id: 'abp-3', title: 'Budget Development', description: 'Build the annual operating budget.', role: 'Operations / Publisher', checklist: ['Revenue projections built (by title, format, channel)', 'Editorial budget allocated', 'Design & production budget allocated', 'Marketing budget allocated (per-title + brand)', 'Freelancer budget allocated', 'Technology/platform budget allocated', 'Awards submission budget allocated', 'Conference & event budget allocated', 'Contingency reserve set (10-15%)', 'Cash flow projections completed'] },
      { id: 'abp-4', title: 'Department Alignment', description: 'Ensure all functions are aligned to the plan.', role: 'Publisher', checklist: ['Editorial calendar drafted', 'Marketing calendar drafted', 'Production schedule drafted', 'Rights & licensing goals set', 'Community programming planned', 'All calendars synced and conflicts resolved', 'Plan documented and shared with team'] },
    ],
  },
  {
    title: 'Ad Campaign Management',
    category: 'marketing',
    icon: '📣',
    description: 'Setting up, running, and optimizing paid advertising campaigns across Amazon, BookBub, Facebook, Instagram, and TikTok.',
    steps: [
      { id: 'ad-1', title: 'Campaign Strategy', description: 'Define campaign objectives and parameters.', role: 'Marketing Manager', checklist: ['Campaign goal defined (launches, backlist, series read-through)', 'Target audience defined (genre readers, comp title readers, lookalikes)', 'Budget allocated (daily and total)', 'Platform(s) selected (Amazon Ads, BookBub Ads, Meta Ads, TikTok)', 'Campaign duration set', 'Success metrics defined (ACOS, CTR, impressions, sales)'] },
      { id: 'ad-2', title: 'Creative Production', description: 'Create ad assets.', role: 'Marketing Manager / Designer', checklist: ['Ad copy written (3-5 variations for A/B testing)', 'Ad images/graphics created (per platform specs)', 'Video assets created (for TikTok/Reels if applicable)', 'Targeting keywords researched (Amazon: 100+ keywords)', 'Category targets identified', 'ASIN/product targets identified (Amazon)', 'Landing page / buy link confirmed'] },
      { id: 'ad-3', title: 'Launch & Monitor', description: 'Launch campaigns and monitor performance.', role: 'Marketing Manager', checklist: ['Campaigns launched on all selected platforms', 'Daily monitoring for first 7 days', 'Unprofitable keywords/targets paused', 'Bids adjusted based on performance', 'Budget reallocated to winning ads', 'Weekly performance report generated'] },
      { id: 'ad-4', title: 'Optimize & Scale', description: 'Optimize winning campaigns and scale.', role: 'Marketing Manager', checklist: ['Top-performing ads identified', 'Losing ads paused/killed', 'New keyword/target expansions tested', 'Budget increased on profitable campaigns', 'A/B test results documented', 'Monthly ROI report generated', 'Learnings documented for future campaigns'] },
    ],
  },
  {
    title: 'Email Marketing & Newsletter',
    category: 'marketing',
    icon: '📧',
    description: 'Managing the Rüna Atlas email list — growth, segmentation, campaigns, and automation.',
    steps: [
      { id: 'email-1', title: 'List Management', description: 'Maintain and grow the email list.', role: 'Marketing Manager', checklist: ['Email platform configured (ConvertKit/Mailchimp/etc.)', 'Sign-up forms on website, socials, and landing pages', 'Lead magnets active (free short story, reading guide, etc.)', 'List segmented: readers by genre, authors, industry, press/media', 'Unengaged subscribers cleaned quarterly', 'Compliance verified (CAN-SPAM, GDPR)'] },
      { id: 'email-2', title: 'Campaign Calendar', description: 'Plan email content for the month.', role: 'Marketing Manager', checklist: ['Monthly email calendar created', 'Weekly newsletter content planned', 'Launch campaign emails drafted (for upcoming releases)', 'Promotional emails scheduled (sales, deals)', 'Community updates planned (events, reading challenges)', 'Automated sequences reviewed (welcome, post-purchase, re-engagement)'] },
      { id: 'email-3', title: 'Content & Design', description: 'Create email content.', role: 'Marketing Manager', checklist: ['Subject lines written (A/B test 2 variations)', 'Preheader text written', 'Email body copy drafted', 'Design template applied', 'Call-to-action clear and linked', 'Mobile preview checked', 'Personalization tokens verified'] },
      { id: 'email-4', title: 'Send & Analyze', description: 'Send emails and track performance.', role: 'Marketing Manager', checklist: ['Test email sent and reviewed', 'Email scheduled or sent manually', 'Open rate tracked (target: 25%+)', 'Click rate tracked (target: 3%+)', 'Unsubscribe rate monitored (concern if >0.5%)', 'Revenue attributed (if promotional)', 'A/B test results documented', 'Insights applied to next campaign'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LEGAL & COMPLIANCE — BATCH 3 (3)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Permissions & Clearances',
    category: 'editorial',
    icon: '⚖️',
    description: 'Securing permissions for copyrighted material used in publications — epigraphs, lyrics, images, or quoted text.',
    steps: [
      { id: 'perm-1', title: 'Identify Needs', description: 'Identify all copyrighted material requiring permission.', role: 'Editor', checklist: ['All epigraphs flagged', 'All direct quotes over fair use flagged', 'Song lyrics identified (even partial lines)', 'Poem excerpts identified', 'Images/illustrations requiring license identified', 'Trademarks in text reviewed', 'Fair use assessment completed for borderline cases'] },
      { id: 'perm-2', title: 'Request Permissions', description: 'Contact rights holders and request permissions.', role: 'Editor / Rights Manager', checklist: ['Rights holder identified for each item', 'Permission request letters sent', 'Fee quotes received (if applicable)', 'Usage terms confirmed (territory, format, edition, duration)', 'Fees budgeted and approved', 'Alternatives identified (in case permission denied)'] },
      { id: 'perm-3', title: 'Documentation', description: 'Document all permissions and pay fees.', role: 'Operations', checklist: ['Written permission received for every item', 'Permission letters filed', 'Fees paid', 'Credit lines/attribution confirmed per terms', 'Permissions log updated', 'Copyright page acknowledgments drafted'] },
    ],
  },
  {
    title: 'Author Contract Renewal & Option',
    category: 'operations',
    icon: '📝',
    description: 'Process for exercising option clauses, renewing contracts, and maintaining author relationships for multi-book deals.',
    steps: [
      { id: 'ren-1', title: 'Option Period Review', description: 'Review upcoming option clause deadlines.', role: 'Publisher', checklist: ['Contract option clause terms reviewed', 'Option period deadline noted (typically 30-60 days after last pub)', 'Author relationship health assessed', 'Sales performance of previous title(s) reviewed', 'Author next project assessed for fit', 'Market conditions evaluated'] },
      { id: 'ren-2', title: 'Decision & Terms', description: 'Decide whether to exercise option and prepare terms.', role: 'Publisher', checklist: ['Decision made: Exercise / Decline / Renegotiate', 'If exercise: updated terms prepared (advance, royalties)', 'If declining: respectful communication drafted', 'P&L projection for next book prepared', 'Advance amount determined (informed by sales data)', 'Author goals and timeline discussed'] },
      { id: 'ren-3', title: 'Negotiation & Execution', description: 'Negotiate and execute the new agreement.', role: 'Publisher / Legal', checklist: ['Offer presented to author/agent', 'Terms negotiated', 'New contract drafted', 'Contract reviewed by both parties', 'Contract signed', 'Contract filed in system', 'Author onboarding refreshed (timeline, editorial assignment)'] },
    ],
  },
  {
    title: 'ISBN & Copyright Registration',
    category: 'operations',
    icon: '🔢',
    description: 'Process for purchasing/assigning ISBNs, registering copyrights, and obtaining CIP data for each title.',
    steps: [
      { id: 'isbn-1', title: 'ISBN Assignment', description: 'Assign ISBNs for all editions.', role: 'Operations', checklist: ['ISBN block purchased from Bowker (or use existing stock)', 'Unique ISBN assigned per format (paperback, hardcover, eBook, audiobook, large print)', 'ISBNs registered in Bowker system with full metadata', 'ISBN log updated internally', 'ISBNs provided to production team'] },
      { id: 'isbn-2', title: 'Copyright Registration', description: 'Register copyright with US Copyright Office.', role: 'Operations', checklist: ['Electronic copyright registration filed via copyright.gov', 'Registration fee paid', 'Deposit copies sent (as required)', 'Registration confirmation received and filed', 'Copyright page text confirmed for the book'] },
      { id: 'isbn-3', title: 'Library of Congress CIP', description: 'Apply for Cataloging in Publication data.', role: 'Operations', checklist: ['CIP application submitted to Library of Congress (8+ weeks before pub)', 'Galley/proof provided with application', 'CIP data received', 'CIP block incorporated into copyright page', 'MARC record created and distributed'] },
      { id: 'isbn-4', title: 'LCCN & PCN', description: 'Obtain Library of Congress Control Number.', role: 'Operations', checklist: ['Preassigned Control Number (PCN) application filed', 'LCCN received', 'LCCN printed on copyright page', 'Complimentary copy sent to LC after publication'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PRODUCTION — BATCH 3 (3)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Reprint Decision & Execution',
    category: 'production',
    icon: '🔁',
    description: 'Process for deciding when to reprint, how many copies, and managing the reprint cycle.',
    steps: [
      { id: 'rep-1', title: 'Reprint Trigger Assessment', description: 'Determine if a reprint is warranted.', role: 'Operations', checklist: ['Current inventory level checked', 'Weeks of supply calculated (inventory ÷ weekly sales rate)', 'Reorder trigger hit? (typically <8 weeks supply)', 'Demand forecast reviewed (seasonal, awards buzz, media)', 'Format still selling? (print vs shifting to digital)', 'Backlist refresh recently done? (may boost demand)'] },
      { id: 'rep-2', title: 'Quantity & Spec Decision', description: 'Determine reprint quantity and any changes.', role: 'Operations / Publisher', checklist: ['Reprint quantity calculated (cover 6-12 months demand)', 'POD vs offset decision made (break-even analysis)', 'Any corrections needed? (typos, updated blurbs, new cover)', 'Updated cover with award badges (if applicable)', 'Updated back matter (new titles, reviews)', 'Quote obtained from printer'] },
      { id: 'rep-3', title: 'Reprint Execution', description: 'Execute the reprint.', role: 'Production Manager', checklist: ['Updated files sent to printer', 'Proof reviewed (if changes made)', 'Print order confirmed', 'Delivery date confirmed', 'Books received and inventoried', 'Retailer/distributor stock replenished', 'Inventory system updated'] },
    ],
  },
  {
    title: 'Accessibility Format Production',
    category: 'production',
    icon: '♿',
    description: 'Producing accessible formats — large print, EPUB accessibility, and audio descriptions.',
    steps: [
      { id: 'acc-1', title: 'Large Print Edition', description: 'Produce a large print edition of the title.', role: 'Production Manager', checklist: ['Interior reformatted at 16pt minimum font size', 'Line spacing increased to 1.5', 'Margins widened for handling', 'Paper stock: cream/off-white (less glare)', 'Trim size adjusted (typically 6x9 or larger)', 'Separate ISBN assigned', 'Cover updated with "LARGE PRINT" designation', 'Proofed for line breaks and page flow', 'Uploaded to IngramSpark'] },
      { id: 'acc-2', title: 'EPUB Accessibility Audit', description: 'Ensure EPUB meets accessibility standards.', role: 'QA Tester', checklist: ['EPUB passes ACE (Accessibility Checker for EPUB)', 'Logical reading order verified', 'All images have alt text', 'Navigation (TOC) fully functional', 'Language attribute set', 'Accessibility metadata included in OPF file', 'Tested with screen reader (VoiceOver, NVDA, or JAWS)', 'Conformance claim added to metadata'] },
      { id: 'acc-3', title: 'Distribution', description: 'Distribute accessible formats.', role: 'Production Manager', checklist: ['Large print edition available on IngramSpark', 'Accessible EPUB distributed to all retailers', 'Title registered with Bookshare (if applicable)', 'Title submitted to NLS for Braille/audio (if applicable)', 'Accessibility features noted in retailer metadata'] },
    ],
  },
  {
    title: 'Series & Sequel Planning',
    category: 'production',
    icon: '📚',
    description: 'Planning and coordinating multi-book series — continuity, branding, scheduling, and reader retention.',
    steps: [
      { id: 'ser-1', title: 'Series Architecture', description: 'Define the series structure and plan.', role: 'Editor / Publisher', checklist: ['Number of books in series determined (or open-ended plan)', 'Series arc outlined (if applicable)', 'Book-by-book synopsis reviewed', 'Publication cadence decided (6 months, 12 months between books)', 'Series bible created (characters, worldbuilding, timeline)', 'Continuity editor assigned'] },
      { id: 'ser-2', title: 'Branding & Design', description: 'Create consistent series branding.', role: 'Art Director', checklist: ['Series name and logo finalized', 'Cover template designed (consistent look with variations)', 'Spine design consistent for shelf display', 'Series number placement standardized', 'Back cover cross-promotion to other books in series', 'Digital series page created on website'] },
      { id: 'ser-3', title: 'Reader Retention Strategy', description: 'Plan how to keep readers engaged between releases.', role: 'Marketing Manager', checklist: ['Email automation: purchase of Book N triggers promo for Book N+1', 'Back matter includes excerpt from next book', 'BookBub series deal alert set up', 'Read-through rate tracked (Book 1 → Book 2 → Book 3)', 'Pricing strategy: Book 1 discounted or perma-free as funnel', 'Social media series countdown for each new release', 'Series box set planned (when 3+ books available)'] },
      { id: 'ser-4', title: 'Continuity Management', description: 'Maintain continuity across books.', role: 'Editor', checklist: ['Series bible updated after each book', 'Continuity review added to editing workflow', 'Character name/detail consistency checked', 'World rules consistency checked', 'Timeline consistency verified', 'Reader-reported continuity errors addressed in reprints'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // DISTRIBUTION & SETUP — BATCH 3 (2)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Distributor & Retail Account Setup',
    category: 'distribution',
    icon: '🏪',
    description: 'Setting up accounts with all distribution channels and retailers for a new or expanding publisher.',
    steps: [
      { id: 'dist-1', title: 'Primary Distribution', description: 'Set up primary print and digital distribution.', role: 'Operations', checklist: ['IngramSpark publisher account created and verified', 'Amazon KDP publisher account created', 'Draft2Digital account created (for wide digital distribution)', 'Apple Books publisher account created', 'Google Play Books partner account created', 'Kobo Writing Life account created', 'Publisher compensation details set on all platforms'] },
      { id: 'dist-2', title: 'Specialty Distribution', description: 'Set up specialty and library distribution.', role: 'Operations', checklist: ['OverDrive/Libby account set up (library eBooks)', 'Hoopla distributor set up (library)', 'Baker & Taylor profile optimized', 'Bookshop.org affiliate set up', 'Libro.fm account created (indie audiobook)', 'Findaway Voices account (audio distribution)', 'NetGalley publisher account created (ARCs)'] },
      { id: 'dist-3', title: 'Direct Sales', description: 'Set up direct-to-reader sales capability.', role: 'Operations / Technical', checklist: ['Shopify/WooCommerce store set up for direct eBook/print sales', 'Payment processing configured (Stripe)', 'Digital delivery system configured (BookFunnel or similar)', 'Tax collection configured (state sales tax)', 'Shipping rates configured (for print)', 'Author discount codes set up', 'Bundle deals created'] },
    ],
  },
  {
    title: 'Pre-Publication Master Checklist',
    category: 'production',
    icon: '✅',
    description: 'The definitive checklist before any title goes live — ensures nothing is missed across all departments.',
    steps: [
      { id: 'pre-1', title: 'Editorial Complete', description: 'Confirm all editorial work is finalized.', role: 'Editor', checklist: ['Final manuscript approved by author', 'All editorial rounds completed', 'Sensitivity review completed (if applicable)', 'Content warnings finalized', 'Dedication and acknowledgment pages finalized', 'About the author page updated', 'Also-by page updated', 'Excerpt from next book included (if series)'] },
      { id: 'pre-2', title: 'Production Complete', description: 'Confirm all production assets are final.', role: 'Production Manager', checklist: ['Print interior PDF final and uploaded', 'eBook EPUB final and uploaded (all platforms)', 'Cover final (front, back, spine) and uploaded', 'ISBNs assigned and registered for all formats', 'Copyright registration filed', 'CIP/LCCN obtained and on copyright page', 'Barcode on back cover verified', 'Price on back cover (if applicable)'] },
      { id: 'pre-3', title: 'Distribution Ready', description: 'Confirm all distribution channels are set up.', role: 'Operations', checklist: ['Title live on Amazon KDP (or scheduled)', 'Title live on IngramSpark', 'Title live on all digital retailers', 'Metadata consistent across all platforms', 'BISAC codes correct', 'Categories optimized', 'Keywords optimized', 'Series metadata linked', 'Pre-order functioning correctly'] },
      { id: 'pre-4', title: 'Marketing Ready', description: 'Confirm all marketing assets and campaigns are prepared.', role: 'Marketing Manager', checklist: ['Book page live on runaatlas.com', 'Social media announcement graphics ready', 'Newsletter launch email drafted and scheduled', 'ARCs distributed to reviewers', 'Launch event planned', 'Ad campaigns ready to activate', 'Author talking points prepared', 'Press release drafted (for significant titles)'] },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // OUTREACH & PUBLICITY — BATCH 3 (2)
  // ═══════════════════════════════════════════════════════
  {
    title: 'Podcast & Media Outreach',
    category: 'marketing',
    icon: '🎙️',
    description: 'Systematic outreach to podcasts, media outlets, and interview platforms for author promotion.',
    steps: [
      { id: 'pod-1', title: 'Target Research', description: 'Identify podcasts and media relevant to the book.', role: 'Marketing Manager', checklist: ['Genre-specific podcasts identified (20-50)', 'SFF/literary podcasts identified', 'Diversity/identity-focused podcasts identified', 'Book review podcasts identified', 'Local media identified (for local authors)', 'Industry media identified (Publishers Weekly, Locus, etc.)', 'Podcast audience size and engagement assessed', 'Contact information compiled'] },
      { id: 'pod-2', title: 'Pitch Creation', description: 'Create tailored pitches.', role: 'Marketing Manager', checklist: ['Author talking points prepared', 'Custom pitch email drafted (personalized per podcast)', 'Press kit prepared (book summary, author bio, headshot, review quotes)', 'Unique angles identified per outlet (diversity angle, craft angle, genre angle)', 'Digital ARC or finished copy ready to send', 'Author availability confirmed'] },
      { id: 'pod-3', title: 'Outreach Execution', description: 'Send pitches and follow up.', role: 'Marketing Manager', checklist: ['Pitch emails sent (stagger over 2-3 weeks)', 'Follow-up sent after 10-14 days (for non-responders)', 'Confirmed bookings calendared', 'Author prep call held before each interview', 'ARC/copy sent to confirmed hosts', 'Interview dates/times confirmed'] },
      { id: 'pod-4', title: 'Amplification', description: 'Amplify interviews when they air.', role: 'Marketing Manager', checklist: ['Episode links shared on all social channels', 'Featured in newsletter', 'Added to author page on website', 'Quote pulls from interview for social content', 'Thank-you sent to host', 'Host added to database for future outreach'] },
    ],
  },
  {
    title: 'Author Event & Signing Coordination',
    category: 'community',
    icon: '🎤',
    description: 'Planning and executing author events — virtual and in-person readings, signings, panels, and festival appearances.',
    steps: [
      { id: 'evt-1', title: 'Event Planning', description: 'Plan the event logistics.', role: 'Marketing Manager', checklist: ['Event type determined (signing, reading, panel, workshop, Q&A)', 'Virtual vs in-person decided', 'Venue/platform chosen', 'Date and time set (check for conflicts)', 'Partner bookstore/library/org contacted', 'Author availability confirmed', 'Moderator/host identified (if panel)', 'Budget allocated (travel, books, food, A/V)'] },
      { id: 'evt-2', title: 'Promotion', description: 'Promote the event to drive attendance.', role: 'Marketing Manager', checklist: ['Event graphic designed', 'Event page created (Eventbrite, website, or social)', 'Social media promotion (2-3 weeks before)', 'Newsletter announcement sent', 'Cross-promotion with venue/partner', 'Reminder posts 1 week and 1 day before', 'Local media/community calendars notified'] },
      { id: 'evt-3', title: 'Execution', description: 'Run the event smoothly.', role: 'Marketing Manager / Author', checklist: ['Books available for sale (online or at venue)', 'Signing supplies ready (pens, bookmarks, bookplates)', 'A/V equipment tested (if virtual or with projection)', 'Event captured (photos, video for social content)', 'Attendee email sign-ups collected', 'Author introduced properly', 'Q&A moderated', 'Books signed and personalized'] },
      { id: 'evt-4', title: 'Follow-Up', description: 'Post-event follow-up and metrics.', role: 'Marketing Manager', checklist: ['Thank-you sent to venue/partner', 'Thank-you sent to attendees (with purchase link)', 'Event photos/video posted to social', 'Attendance metrics recorded', 'Books sold at event recorded', 'Email sign-ups added to list', 'Event recap for internal records', 'Lessons learned documented'] },
    ],
  },
];
