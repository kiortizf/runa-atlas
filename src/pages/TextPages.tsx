import { motion } from 'framer-motion';

export function Privacy() {
  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl text-text-primary uppercase tracking-widest mb-6">Privacy Policy</h1>
          <div className="prose prose-invert prose-p:font-body prose-headings:font-heading text-text-secondary">
            <p>Last updated: October 2026</p>
            <p>At Rüna Atlas Publishing, we take your privacy seriously. This policy describes how we collect, use, and handle your personal information.</p>
            <h2>Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, subscribe to our newsletter, make a purchase, or contact us for support.</p>
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl text-text-primary uppercase tracking-widest mb-6">Terms of Service</h1>
          <div className="prose prose-invert prose-p:font-body prose-headings:font-heading text-text-secondary">
            <p>Last updated: October 2026</p>
            <p>Please read these terms carefully before using our services.</p>
            <h2>Acceptance of Terms</h2>
            <p>By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            <h2>Intellectual Property</h2>
            <p>All content published by Rüna Atlas Publishing, including but not limited to text, graphics, logos, and images, is the property of Rüna Atlas Publishing or its authors and is protected by copyright laws.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Accessibility() {
  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl text-text-primary uppercase tracking-widest mb-6">Accessibility Statement</h1>
          <div className="prose prose-invert prose-p:font-body prose-headings:font-heading text-text-secondary">
            <p>Rüna Atlas Publishing is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
            <h2>Conformance Status</h2>
            <p>We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA.</p>
            <h2>Feedback</h2>
            <p>We welcome your feedback on the accessibility of our website. Please let us know if you encounter accessibility barriers by contacting us through our Contact page.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Rights() {
  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl text-text-primary uppercase tracking-widest mb-6">Foreign Rights</h1>
          <div className="prose prose-invert prose-p:font-body prose-headings:font-heading text-text-secondary">
            <p>Rüna Atlas Publishing actively licenses translation and territorial rights for our titles across the globe.</p>
            <h2>Inquiries</h2>
            <p>For all foreign rights inquiries, including translation, audio, and film/TV rights, please contact our rights department at rights@runaatlas.com.</p>
            <p>Please include the specific title(s) you are interested in and the territories/languages you represent.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Press() {
  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl text-text-primary uppercase tracking-widest mb-6">Press Kit</h1>
          <div className="prose prose-invert prose-p:font-body prose-headings:font-heading text-text-secondary">
            <p>Welcome to the Rüna Atlas Publishing press room. Here you will find resources for media professionals.</p>
            <h2>Media Contacts</h2>
            <p>For review copies, author interviews, or general media inquiries, please contact press@runaatlas.com.</p>
            <h2>Brand Assets</h2>
            <p>High-resolution logos, author photos, and book covers are available upon request.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
