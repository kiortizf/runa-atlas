import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Star, Menu, X, ShoppingCart, UserCircle, Scroll, Vote, Newspaper, FileText, LayoutDashboard, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isAuthor } = useAuth();

  // Build nav links based on user role
  const navLinks = [
    { name: 'Runeweave', path: '/', icon: Star, show: true },
    { name: 'Journeys', path: '/journeys', icon: Scroll, show: true },
    { name: 'Community', path: '/community', icon: Vote, show: true },
    { name: 'News', path: '/posts', icon: Newspaper, show: true },
    { name: 'Submit', path: '/submissions', icon: FileText, show: isAuthor },
    { name: 'Dashboard', path: '/portal', icon: LayoutDashboard, show: isAuthor },
    { name: 'Admin', path: '/admin', icon: Settings, show: isAdmin },
  ].filter(link => link.show);

  return (
    <div className="min-h-screen flex flex-col bg-void-black text-text-primary font-body">
      {/* Navigation */}
      <nav className="border-b border-border bg-deep-space/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-cosmic-purple flex items-center justify-center border border-starforge-gold/30 group-hover:bg-glow-purple transition-all duration-300">
                  <Star className="w-5 h-5 text-starforge-gold" />
                </div>
                <div>
                  <h1 className="font-display text-xl tracking-wider text-text-primary uppercase">Rüna Atlas</h1>
                  <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-starforge-gold">Publishing</p>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6 font-ui text-sm tracking-wide">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 transition-colors ${isActive ? 'text-starforge-gold' : 'text-text-secondary hover:text-starforge-gold'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-text-secondary hover:text-white"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 font-ui">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2 transition-colors ${isActive ? 'text-starforge-gold' : 'text-text-secondary hover:text-starforge-gold'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-deep-space border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-cosmic-purple flex items-center justify-center border border-starforge-gold/30">
                  <Star className="w-4 h-4 text-starforge-gold" />
                </div>
                <span className="font-display text-lg tracking-wider text-text-primary uppercase">Rüna Atlas</span>
              </Link>
              <p className="text-text-secondary text-sm font-ui leading-relaxed mb-6">
                A celestial forge where stories are transmuted into stars. Forging constellations of voice from marginalized creators.
              </p>
            </div>

            <div>
              <h3 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Explore</h3>
              <ul className="space-y-3 font-ui text-sm text-text-secondary">
                <li><Link to="/catalog" className="hover:text-starforge-gold transition-colors">Catalog</Link></li>
                <li><Link to="/journeys" className="hover:text-starforge-gold transition-colors">Journeys</Link></li>
                <li><Link to="/authors" className="hover:text-starforge-gold transition-colors">Authors</Link></li>
                <li><Link to="/community" className="hover:text-starforge-gold transition-colors">Community</Link></li>
                <li><Link to="/about" className="hover:text-starforge-gold transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Connect</h3>
              <ul className="space-y-3 font-ui text-sm text-text-secondary">
                <li><Link to="/membership" className="hover:text-starforge-gold transition-colors">Membership</Link></li>
                <li><Link to="/submissions" className="hover:text-starforge-gold transition-colors">Submit Your Story</Link></li>
                <li><Link to="/contact" className="hover:text-starforge-gold transition-colors">Contact</Link></li>
                <li><Link to="/rights" className="hover:text-starforge-gold transition-colors">Foreign Rights</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Join the Constellation</h3>
              <p className="text-text-secondary text-sm font-ui mb-4">Subscribe for new releases and submission calls.</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="bg-surface border border-border rounded-md px-4 py-2 text-sm font-ui w-full focus:outline-none focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold text-text-primary"
                />
                <button type="submit" className="bg-starforge-gold text-void-black px-4 py-2 rounded-md font-ui text-sm font-medium hover:bg-white transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-muted text-xs font-ui">
              &copy; {new Date().getFullYear()} Rüna Atlas Publishing. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs font-ui text-text-muted">
              <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
              <Link to="/accessibility" className="hover:text-text-primary transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
