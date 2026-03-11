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
];
