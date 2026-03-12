import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpen, Menu, X, Scroll, Newspaper, Flame, Users, Calendar,
  PenTool, Feather, BookMarked, Eye, ChevronDown, LogIn, LayoutDashboard
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { user, isAdmin, isAuthor } = useAuth();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when navigating
  useEffect(() => { setOpenDropdown(null); setIsMenuOpen(false); }, [location.pathname]);

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(name);
  };
  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  // ── Top nav: role-based landing pages + key modules ──
  const navItems = [
    {
      name: 'For Authors', path: '/for-authors', icon: Feather, show: true,
      children: [
        { name: 'Publish With Us', path: '/for-authors' },
        { name: 'What We Publish', path: '/genres' },
        { name: 'Author Directory', path: '/authors' },
        { name: 'Author Connect', path: '/connect' },
        { name: 'Royalty Calculator', path: '/royalty-calculator' },
        { name: 'Submissions', path: '/submissions' },
      ],
    },
    {
      name: 'For Readers', path: '/for-readers', icon: BookMarked, show: true,
      children: [
        { name: 'Reader Home', path: '/for-readers' },
        { name: 'Mood Matcher', path: '/mood-matcher' },
        { name: 'Book DNA', path: '/book-dna' },
        { name: 'Reader Compatibility', path: '/compatibility' },
        { name: 'Spoiler Shield', path: '/spoiler-shield' },
        { name: 'Content Compass', path: '/content-compass' },
        { name: 'Reading Wrapped', path: '/wrapped' },
        { name: 'Passage Collections', path: '/passages' },
      ],
    },
    {
      name: 'Beta Readers', path: '/for-beta-readers', icon: Eye, show: true,
      children: [
        { name: 'Beta Reader Info', path: '/for-beta-readers' },
        { name: 'Beta Reader Hub', path: '/beta-reader' },
        { name: 'Beta Campaigns', path: '/beta-campaign' },
      ],
    },
    { name: 'Catalog', path: '/catalog', icon: BookOpen, show: true },
    { name: 'Serials', path: '/journeys', icon: Scroll, show: true },
    { name: 'The Forge', path: '/forge', icon: Flame, show: true },
    { name: 'Events', path: '/events', icon: Calendar, show: true },
    { name: 'Community', path: '/community', icon: Users, show: true },
    { name: 'News', path: '/posts', icon: Newspaper, show: true },
  ].filter(l => l.show);

  // ── Footer sections ──
  const footerExplore = [
    { name: 'Catalog', path: '/catalog' },
    { name: 'Serials', path: '/journeys' },
    { name: 'The Forge', path: '/forge' },
    { name: 'Events', path: '/events' },
    { name: 'Community', path: '/community' },
    { name: 'News', path: '/posts' },
    { name: 'About Us', path: '/about' },
  ];

  const footerReaderTools = [
    { name: 'Book DNA', path: '/book-dna' },
    { name: 'Reading Wrapped', path: '/wrapped' },
    { name: 'Mood Matcher', path: '/mood-matcher' },
    { name: 'Spoiler Shield', path: '/spoiler-shield' },
    { name: 'Content Compass', path: '/content-compass' },
    { name: 'Passage Collections', path: '/passages' },
    { name: 'Reader Compatibility', path: '/compatibility' },
  ];

  const footerImprints = [
    { name: '✦ Rüna Atlas Press', path: '/for-authors' },
    { name: '☀ Bohío Press', path: '/imprints/bohio' },
    { name: '🌑 Void Noir', path: '/imprints/void-noir' },
  ];

  const footerCompany = [
    { name: 'For Authors', path: '/for-authors' },
    { name: 'For Readers', path: '/for-readers' },
    { name: 'For Beta Readers', path: '/for-beta-readers' },
    { name: 'Membership', path: '/membership' },
    { name: 'Contact', path: '/contact' },
    { name: 'Foreign Rights', path: '/rights' },
    { name: 'Press', path: '/press' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col bg-void-black text-text-primary font-body">
      {/* ═══ Navigation ═══ */}
      <nav className="border-b border-border bg-deep-space/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo — just text, no star rune, no "PRESS" */}
            <Link to="/" className="flex items-center group">
              <h1 className="font-display text-xl tracking-wider text-text-primary uppercase group-hover:text-starforge-gold transition-colors">
                Rüna Atlas
              </h1>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 font-ui text-[13px] tracking-wide">
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = 'children' in item && item.children;
                const active = isActive(item.path);

                if (hasChildren) {
                  return (
                    <div key={item.name} className="relative"
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}>
                      <Link to={item.path}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors
                          ${active ? 'text-starforge-gold' : 'text-text-secondary hover:text-starforge-gold'}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.name}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                      </Link>
                      {openDropdown === item.name && (
                        <div className="absolute top-full left-0 mt-1 w-52 bg-surface border border-border rounded-lg shadow-xl py-1 z-50"
                          onMouseEnter={() => handleMouseEnter(item.name)}
                          onMouseLeave={handleMouseLeave}>
                          {item.children.map(child => (
                            <Link key={child.path} to={child.path}
                              className={`block px-4 py-2 text-xs transition-colors
                                ${isActive(child.path) ? 'text-starforge-gold bg-white/[0.04]' : 'text-text-secondary hover:text-starforge-gold hover:bg-white/[0.04]'}`}>
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link key={item.name} to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors
                      ${active ? 'text-starforge-gold' : 'text-text-secondary hover:text-starforge-gold'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth Button (Desktop) */}
            <div className="hidden lg:flex items-center ml-2">
              {user ? (
                <Link to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-starforge-gold/10 border border-starforge-gold/20 text-starforge-gold hover:bg-starforge-gold/20 transition-all text-[13px] font-ui tracking-wide">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  )}
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link to="/portal"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-starforge-gold text-void-black hover:bg-yellow-400 transition-colors text-[13px] font-ui font-semibold tracking-wide">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-text-secondary hover:text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="lg:hidden bg-surface border-b border-border max-h-[75vh] overflow-y-auto">
            <div className="px-2 pt-2 pb-3 space-y-1 font-ui">
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = 'children' in item && item.children;
                return (
                  <div key={item.name}>
                    <Link to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 transition-colors
                        ${isActive(item.path) ? 'text-starforge-gold' : 'text-text-secondary hover:text-starforge-gold'}`}
                      onClick={() => !hasChildren && setIsMenuOpen(false)}>
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                    {hasChildren && (
                      <div className="ml-10 space-y-1 mb-2">
                        {item.children!.map(child => (
                          <Link key={child.path} to={child.path}
                            className={`block px-3 py-1.5 text-sm transition-colors
                              ${isActive(child.path) ? 'text-starforge-gold' : 'text-text-muted hover:text-starforge-gold'}`}
                            onClick={() => setIsMenuOpen(false)}>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              {/* Mobile Auth Button */}
              <div className="border-t border-border mx-2 mt-2 pt-3 pb-2">
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-starforge-gold/10 text-starforge-gold">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-semibold">Dashboard</span>
                  </Link>
                ) : (
                  <Link to="/portal" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-starforge-gold text-void-black font-semibold">
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
          </div>
        )}
      </nav>

      {/* ═══ Main Content ═══ */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="bg-deep-space border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-4">
                <span className="font-display text-lg tracking-wider text-text-primary uppercase">Rüna Atlas</span>
              </Link>
              <p className="text-text-secondary text-sm font-ui leading-relaxed mb-6">
                Charting the unwritten territories of speculative fiction.
              </p>
              <form className="flex gap-2">
                <input type="email" placeholder="Email"
                  className="bg-surface border border-border rounded-md px-3 py-2 text-sm font-ui w-full focus:outline-none focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold text-text-primary" />
                <button type="submit" className="bg-starforge-gold text-void-black px-3 py-2 rounded-md font-ui text-xs font-medium hover:bg-white transition-colors whitespace-nowrap">
                  Go
                </button>
              </form>
            </div>

            {/* Explore */}
            <div>
              <h3 className="font-ui text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">Explore</h3>
              <ul className="space-y-2.5 font-ui text-sm text-text-secondary">
                {footerExplore.map(link => (
                  <li key={link.path}><Link to={link.path} className="hover:text-starforge-gold transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Reader Tools */}
            <div>
              <h3 className="font-ui text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">Reader Tools</h3>
              <ul className="space-y-2.5 font-ui text-sm text-text-secondary">
                {footerReaderTools.map(link => (
                  <li key={link.path}><Link to={link.path} className="hover:text-starforge-gold transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Our Imprints */}
            <div>
              <h3 className="font-ui text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">Our Imprints</h3>
              <ul className="space-y-2.5 font-ui text-sm text-text-secondary">
                {footerImprints.map(link => (
                  <li key={link.path}><Link to={link.path} className="hover:text-starforge-gold transition-colors">{link.name}</Link></li>
                ))}
              </ul>
              <Link to="/genres" className="inline-block mt-4 font-ui text-xs text-text-muted hover:text-starforge-gold transition-colors">Browse all genres →</Link>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-ui text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-2.5 font-ui text-sm text-text-secondary">
                {footerCompany.map(link => (
                  <li key={link.path}><Link to={link.path} className="hover:text-starforge-gold transition-colors">{link.name}</Link></li>
                ))}
                {isAdmin && <li><Link to="/admin" className="hover:text-starforge-gold transition-colors">Admin Panel</Link></li>}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-muted text-xs font-ui">
              &copy; {new Date().getFullYear()} Rüna Atlas. All rights reserved.
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
