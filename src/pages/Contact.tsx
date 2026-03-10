import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-6">
            <span className="text-starforge-gold">Contact</span> Us
          </h1>
          <p className="font-ui text-xl text-text-secondary max-w-3xl mx-auto">
            Reach across the void. We're always listening for new signals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-surface border border-border p-8 rounded-sm"
          >
            <h2 className="font-heading text-2xl text-text-primary mb-6">Send a Transmission</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block font-ui text-sm text-text-secondary mb-2 uppercase tracking-wider">Name</label>
                  <input type="text" id="name" className="w-full bg-void-black border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-starforge-gold transition-colors" placeholder="Your Name" />
                </div>
                <div>
                  <label htmlFor="email" className="block font-ui text-sm text-text-secondary mb-2 uppercase tracking-wider">Email</label>
                  <input type="email" id="email" className="w-full bg-void-black border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-starforge-gold transition-colors" placeholder="your@email.com" />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block font-ui text-sm text-text-secondary mb-2 uppercase tracking-wider">Subject</label>
                <select id="subject" className="w-full bg-void-black border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-starforge-gold transition-colors appearance-none">
                  <option>General Inquiry</option>
                  <option>Press & Media</option>
                  <option>Foreign Rights</option>
                  <option>Order Support</option>
                  <option>Author Portal Help</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block font-ui text-sm text-text-secondary mb-2 uppercase tracking-wider">Message</label>
                <textarea id="message" rows={6} className="w-full bg-void-black border border-border rounded-sm px-4 py-3 text-text-primary focus:outline-none focus:border-starforge-gold transition-colors resize-none" placeholder="Your message here..."></textarea>
              </div>

              <button type="submit" className="w-full bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-widest py-4 rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-2">
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-surface border border-border p-8 rounded-sm">
              <h3 className="font-heading text-xl text-text-primary mb-6 border-b border-border pb-4">Direct Channels</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-void-black border border-starforge-gold/30 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-starforge-gold" />
                  </div>
                  <div>
                    <h4 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-1">Email</h4>
                    <p className="font-body text-text-secondary text-sm mb-1">General: hello@runaatlas.com</p>
                    <p className="font-body text-text-secondary text-sm mb-1">Press: press@runaatlas.com</p>
                    <p className="font-body text-text-secondary text-sm">Rights: rights@runaatlas.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-void-black border border-starforge-gold/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-starforge-gold" />
                  </div>
                  <div>
                    <h4 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-1">Headquarters</h4>
                    <p className="font-body text-text-secondary text-sm">
                      101 Nebula Way, Suite 404<br />
                      Portland, OR 97204<br />
                      Earth, Sol System
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-void-black border border-starforge-gold/30 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-starforge-gold" />
                  </div>
                  <div>
                    <h4 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-1">Comm Link</h4>
                    <p className="font-body text-text-secondary text-sm">+1 (555) 019-8372</p>
                    <p className="font-ui text-xs text-text-muted mt-1">Mon-Fri, 9am - 5pm PST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-8 rounded-sm">
              <h3 className="font-heading text-xl text-text-primary mb-4">Submissions</h3>
              <p className="font-body text-text-secondary text-sm mb-4">
                Please do not send manuscript submissions via this contact form or email. All submissions must go through our dedicated portal during open reading periods.
              </p>
              <a href="/submissions" className="font-ui text-sm text-starforge-gold hover:text-white transition-colors uppercase tracking-wider flex items-center gap-2">
                View Submission Guidelines &rarr;
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
