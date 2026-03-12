// ═══════════════════════════════════════════════════════════════
// NDA TEMPLATES — Legally Binding Confidentiality Agreements
// Cites: ESIGN Act (15 U.S.C. §7001–7031), UETA, EU eIDAS
// ═══════════════════════════════════════════════════════════════

export interface NDATemplate {
  id: string;
  title: string;
  version: string;
  effectiveDate: string;
  sections: { heading: string; body: string }[];
  legalNotice: string;
  signatureBlock: string;
}

// ── Dynamic field substitution ──
// Templates use {{FIELD}} tokens replaced at render time
// Available: {{SIGNER_NAME}}, {{SIGNER_EMAIL}}, {{DATE}},
//            {{MANUSCRIPT_TITLE}}, {{AUTHOR_NAME}}, {{COMPANY_NAME}}

const COMPANY = 'Rüna Atlas Press, LLC';
const JURISDICTION = 'the State of New York, United States';

export const NDA_TEMPLATES: Record<string, NDATemplate> = {

  // ═══════════════════════════════════════════
  // BETA READER NDA
  // ═══════════════════════════════════════════
  beta_reader: {
    id: 'beta_reader',
    title: 'Beta Reader Non-Disclosure Agreement',
    version: '1.0.0',
    effectiveDate: '2026-03-12',
    sections: [
      {
        heading: 'Parties',
        body: `This Non-Disclosure Agreement ("Agreement") is entered into as of {{DATE}} by and between:\n\n**Disclosing Party:** ${COMPANY} ("Company"), and\n\n**Receiving Party:** {{SIGNER_NAME}} ({{SIGNER_EMAIL}}) ("Beta Reader").\n\nCollectively referred to as the "Parties."`,
      },
      {
        heading: '1. Definition of Confidential Information',
        body: `"Confidential Information" includes, but is not limited to:\n\n(a) All manuscript content, including but not limited to text, plot, characters, world-building, dialogue, and narrative structure;\n(b) Any editorial notes, feedback forms, or revision materials shared through the Platform;\n(c) The identity of other beta readers and their feedback;\n(d) Publication timelines, marketing strategies, and business plans;\n(e) Any information marked or reasonably understood to be confidential.\n\nConfidential Information does not include information that: (i) is or becomes publicly available through no fault of the Receiving Party; (ii) was known to the Receiving Party prior to disclosure; or (iii) is independently developed by the Receiving Party without reference to the Confidential Information.`,
      },
      {
        heading: '2. Obligations of the Receiving Party',
        body: `The Beta Reader agrees to:\n\n(a) Hold all Confidential Information in strict confidence and not disclose it to any third party without the prior written consent of the Company;\n(b) Use Confidential Information solely for the purpose of providing beta reading feedback through the ${COMPANY} platform;\n(c) Not copy, reproduce, distribute, screenshot, photograph, or otherwise duplicate any Confidential Information;\n(d) Not discuss manuscript content, plot details, character arcs, or any other Confidential Information on social media, forums, blogs, podcasts, or any public or private communication channel;\n(e) Submit all feedback exclusively through the ${COMPANY} platform;\n(f) Notify the Company immediately upon discovery of any unauthorized use or disclosure of Confidential Information;\n(g) Return or destroy all Confidential Information upon request or upon termination of this Agreement.`,
      },
      {
        heading: '3. Term and Termination',
        body: `This Agreement shall remain in effect for a period of three (3) years from the date of execution, or until the Confidential Information becomes publicly available through authorized publication, whichever occurs first.\n\nThe confidentiality obligations under this Agreement shall survive the termination of the Beta Reader's participation in the ${COMPANY} Beta Reader Program.`,
      },
      {
        heading: '4. Intellectual Property',
        body: `Nothing in this Agreement grants the Beta Reader any rights, title, or interest in any Confidential Information. All manuscripts and related materials remain the sole property of their respective authors and ${COMPANY}.\n\nFeedback provided by the Beta Reader through the Platform may be used by the author and ${COMPANY} without restriction. The Beta Reader waives any claim of ownership over feedback provided through the Platform.`,
      },
      {
        heading: '5. Remedies',
        body: `The Beta Reader acknowledges that unauthorized disclosure of Confidential Information may cause irreparable harm to the Company and/or the author(s). In the event of a breach or threatened breach, the Company shall be entitled to seek:\n\n(a) Injunctive relief without the necessity of proving actual damages;\n(b) Specific performance;\n(c) Monetary damages, including consequential and incidental damages;\n(d) Reasonable attorneys' fees and costs.`,
      },
      {
        heading: '6. Governing Law and Jurisdiction',
        body: `This Agreement shall be governed by and construed in accordance with the laws of ${JURISDICTION}, without regard to its conflict of law provisions.\n\nAny dispute arising out of or relating to this Agreement shall be resolved exclusively in the state or federal courts located in ${JURISDICTION}. The Parties consent to the personal jurisdiction of such courts.`,
      },
      {
        heading: '7. Electronic Signature and Legal Framework',
        body: `This Agreement is executed electronically. By affixing your electronic signature below, you acknowledge and agree that:\n\n(a) **United States — ESIGN Act (15 U.S.C. §7001–7031):** The Electronic Signatures in Global and National Commerce Act establishes that electronic signatures and records have the same legal validity, enforceability, and effect as traditional paper-based signatures and documents. This Agreement, executed electronically, carries the full force and effect of a signed written agreement.\n\n(b) **United States — Uniform Electronic Transactions Act (UETA):** Adopted by 49 U.S. states, UETA provides that an electronic record or signature may not be denied legal effect solely because it is in electronic form. Your electronic signature on this Agreement constitutes a legally binding commitment.\n\n(c) **European Union — eIDAS Regulation (EU No 910/2014):** For parties within the EU, this electronic signature qualifies as an advanced electronic signature under Article 26 of the eIDAS Regulation, uniquely linked to the signatory and capable of identifying the signatory, created using electronic signature creation data under the signatory's sole control.\n\n(d) **Cryptographic Verification:** This Agreement is secured using ECDSA P-256 digital signature technology. The full text of this Agreement is hashed using SHA-256, and the hash is cryptographically signed using a key pair generated at the time of signing. The digital signature, document hash, and public verification key are stored as an immutable record. Any alteration to the Agreement text after signing will invalidate the cryptographic signature.\n\n(e) **Audit Trail:** The following metadata is recorded and stored: signer identity (verified via Firebase Authentication), email address, signature image, document hash (SHA-256), digital signature (ECDSA P-256), public key (JWK format), IP address (when available), and timestamp (server-generated, UTC).`,
      },
      {
        heading: '8. Entire Agreement',
        body: `This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior or contemporaneous understandings or agreements, whether written or oral.\n\nNo modification of this Agreement shall be valid unless made in writing and signed by both Parties. If any provision is found unenforceable, the remaining provisions shall continue in full force and effect.`,
      },
    ],
    legalNotice: `By signing below, you confirm that you have read, understood, and agree to be bound by all terms of this Non-Disclosure Agreement. This electronic signature is legally binding under the ESIGN Act (15 U.S.C. §7001–7031), the Uniform Electronic Transactions Act (UETA), and EU eIDAS Regulation (EU No 910/2014).`,
    signatureBlock: `I, {{SIGNER_NAME}}, hereby affirm that I have read and understood the terms of this Non-Disclosure Agreement and agree to be bound by its provisions. I understand that my electronic signature below has the same legal force and effect as a handwritten signature.`,
  },

  // ═══════════════════════════════════════════
  // SENSITIVITY READER NDA
  // ═══════════════════════════════════════════
  sensitivity_reader: {
    id: 'sensitivity_reader',
    title: 'Sensitivity Reader Non-Disclosure Agreement',
    version: '1.0.0',
    effectiveDate: '2026-03-12',
    sections: [
      {
        heading: 'Parties',
        body: `This Non-Disclosure Agreement ("Agreement") is entered into as of {{DATE}} by and between:\n\n**Disclosing Party:** ${COMPANY} ("Company"), and\n\n**Receiving Party:** {{SIGNER_NAME}} ({{SIGNER_EMAIL}}) ("Sensitivity Reader").`,
      },
      {
        heading: '1. Scope of Confidential Information',
        body: `In addition to the standard manuscript confidentiality terms, Sensitivity Reader acknowledges that their role involves access to particularly sensitive content areas including:\n\n(a) Draft material being evaluated for cultural accuracy and representation;\n(b) Author notes and research materials regarding marginalized communities;\n(c) Internal sensitivity assessments and editorial recommendations;\n(d) The nature and scope of sensitivity concerns identified.\n\nThe Sensitivity Reader agrees to treat all such information with the highest degree of confidentiality and shall not discuss the nature of their sensitivity recommendations outside the Platform.`,
      },
      {
        heading: '2. Additional Obligations',
        body: `Beyond the standard Beta Reader confidentiality obligations (which are incorporated by reference), the Sensitivity Reader further agrees to:\n\n(a) Not disclose the identity of authors seeking sensitivity reading;\n(b) Not publicly discuss the specific sensitivity concerns raised in any manuscript;\n(c) Maintain the confidentiality of sensitivity reading outcomes regardless of whether the author incorporates the recommendations;\n(d) Not use sensitivity reading engagements for personal publicity without written consent.`,
      },
      {
        heading: '3. Legal Framework',
        body: `This Agreement is executed electronically under the authority of the ESIGN Act (15 U.S.C. §7001–7031), the Uniform Electronic Transactions Act (UETA), and where applicable, EU eIDAS Regulation (EU No 910/2014). The electronic signature affixed hereto carries the full legal weight and enforceability of a handwritten signature. The Agreement is secured via ECDSA P-256 digital signature with SHA-256 document hashing.`,
      },
      {
        heading: '4. Governing Law',
        body: `This Agreement shall be governed by the laws of ${JURISDICTION}. The confidentiality obligations survive for five (5) years from execution or until authorized publication.`,
      },
    ],
    legalNotice: `By signing below, you confirm that you have read, understood, and agree to be bound by all terms of this Sensitivity Reader Non-Disclosure Agreement. This electronic signature is legally binding under the ESIGN Act, UETA, and EU eIDAS Regulation.`,
    signatureBlock: `I, {{SIGNER_NAME}}, hereby affirm that I have read and understood the terms of this Sensitivity Reader Non-Disclosure Agreement and agree to be bound by its provisions.`,
  },

  // ═══════════════════════════════════════════
  // AUTHOR PLATFORM NDA
  // ═══════════════════════════════════════════
  author: {
    id: 'author',
    title: 'Author Platform Confidentiality Agreement',
    version: '1.0.0',
    effectiveDate: '2026-03-12',
    sections: [
      {
        heading: 'Parties',
        body: `This Confidentiality Agreement ("Agreement") is entered into as of {{DATE}} by and between:\n\n**Platform Operator:** ${COMPANY} ("Company"), and\n\n**Author:** {{SIGNER_NAME}} ({{SIGNER_EMAIL}}) ("Author").`,
      },
      {
        heading: '1. Platform Confidential Information',
        body: `The Author agrees to keep confidential:\n\n(a) Other authors' unpublished manuscripts accessed through the Platform;\n(b) Beta reader identities, feedback, and participation;\n(c) Editorial pipeline information, acquisition strategies, and publication schedules;\n(d) Platform proprietary tools, algorithms, and matching systems;\n(e) Financial terms, royalty structures, and business arrangements.`,
      },
      {
        heading: '2. Manuscript Submissions',
        body: `The Company agrees to:\n\n(a) Treat all submitted manuscripts as confidential;\n(b) Not share manuscript content with unauthorized parties;\n(c) Limit access to editorial staff and approved beta readers who have signed the Beta Reader NDA;\n(d) Return or destroy manuscripts upon request after the conclusion of the publishing relationship.`,
      },
      {
        heading: '3. Legal Framework',
        body: `This Agreement is executed electronically under the ESIGN Act (15 U.S.C. §7001–7031), UETA, and EU eIDAS Regulation (EU No 910/2014). Secured via ECDSA P-256 digital signature.`,
      },
      {
        heading: '4. Term',
        body: `This Agreement remains in effect for the duration of the Author's relationship with ${COMPANY} and for two (2) years thereafter. Governed by the laws of ${JURISDICTION}.`,
      },
    ],
    legalNotice: `By signing below, you confirm your agreement to this Confidentiality Agreement. This electronic signature is legally binding under applicable law.`,
    signatureBlock: `I, {{SIGNER_NAME}}, hereby execute this Author Platform Confidentiality Agreement and agree to be bound by its terms.`,
  },
};

/**
 * Render an NDA template with dynamic fields substituted
 */
export function renderNDATemplate(
  templateId: string,
  fields: Record<string, string>
): NDATemplate | null {
  const template = NDA_TEMPLATES[templateId];
  if (!template) return null;

  const substitute = (text: string): string => {
    let result = text;
    for (const [key, value] of Object.entries(fields)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
  };

  return {
    ...template,
    sections: template.sections.map(s => ({
      heading: substitute(s.heading),
      body: substitute(s.body),
    })),
    legalNotice: substitute(template.legalNotice),
    signatureBlock: substitute(template.signatureBlock),
  };
}

/**
 * Get the full NDA text as a single string (for hashing)
 */
export function getNDAFullText(template: NDATemplate): string {
  const parts = [
    `${template.title} — Version ${template.version}`,
    `Effective Date: ${template.effectiveDate}`,
    '',
    ...template.sections.map(s => `${s.heading}\n\n${s.body}`),
    '',
    'LEGAL NOTICE',
    template.legalNotice,
    '',
    'SIGNATURE',
    template.signatureBlock,
  ];
  return parts.join('\n\n');
}
