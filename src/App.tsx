/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ── Loading Fallback ──
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-starforge-gold/30 border-t-starforge-gold rounded-full animate-spin" />
      <p className="text-text-muted text-sm font-ui tracking-wide">Loading…</p>
    </div>
  </div>
);

// ── Lazy-loaded route components ──
// Public pages
const Runeweave = lazy(() => import('./pages/Runeweave'));
const ConstellationDetail = lazy(() => import('./pages/ConstellationDetail'));
const Catalog = lazy(() => import('./pages/Catalog'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Genres = lazy(() => import('./pages/Genres'));
const ImprintBohio = lazy(() => import('./pages/ImprintBohio'));
const ImprintVoidNoir = lazy(() => import('./pages/ImprintVoidNoir'));
const Journeys = lazy(() => import('./pages/Journeys'));
const JourneyDetail = lazy(() => import('./pages/JourneyDetail'));
const EpisodeReader = lazy(() => import('./pages/EpisodeReader'));
const Community = lazy(() => import('./pages/Community'));
const Forge = lazy(() => import('./pages/Forge'));
const AuthorConnect = lazy(() => import('./pages/AuthorConnect'));
const Events = lazy(() => import('./pages/Events'));
const Posts = lazy(() => import('./pages/Posts'));
const Membership = lazy(() => import('./pages/Membership'));
const Library = lazy(() => import('./pages/Library'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Authors = lazy(() => import('./pages/Authors'));
const ForAuthors = lazy(() => import('./pages/ForAuthors'));
const ForReaders = lazy(() => import('./pages/ForReaders'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

// Reader tools
const SpoilerShield = lazy(() => import('./pages/SpoilerShield'));
const ReadingWrapped = lazy(() => import('./pages/ReadingWrapped'));
const MoodMatcher = lazy(() => import('./pages/MoodMatcher'));
const PassageCollections = lazy(() => import('./pages/PassageCollections'));
const BookDNA = lazy(() => import('./pages/BookDNA'));
const ReaderCompatibility = lazy(() => import('./pages/ReaderCompatibility'));
const ContentCompass = lazy(() => import('./pages/ContentCompass'));

// Beta reader / editorial
const BetaReaderHub = lazy(() => import('./pages/BetaReaderHub'));
const ForBetaReaders = lazy(() => import('./pages/ForBetaReaders'));
const ManuscriptPipeline = lazy(() => import('./pages/ManuscriptPipeline'));
const BetaCampaign = lazy(() => import('./pages/BetaCampaign'));
const EditorBridge = lazy(() => import('./pages/EditorBridge'));
const RevisionRounds = lazy(() => import('./pages/RevisionRounds'));
const ManuscriptInbox = lazy(() => import('./pages/ManuscriptInbox'));
const EditorBetaManager = lazy(() => import('./pages/EditorBetaManager'));

// Author tools (protected)
const Submissions = lazy(() => import('./pages/Submissions'));
const Portal = lazy(() => import('./pages/Portal'));
const BookReader = lazy(() => import('./pages/BookReader'));
const CreatorStudio = lazy(() => import('./pages/CreatorStudio'));
const ForgeEditor = lazy(() => import('./pages/ForgeEditor'));
const AuthorOnboarding = lazy(() => import('./pages/AuthorOnboarding'));
const AuthorProfile = lazy(() => import('./pages/AuthorProfile'));
const RoyaltyCalculator = lazy(() => import('./pages/RoyaltyCalculator'));
const WritingGoals = lazy(() => import('./pages/WritingGoals'));
const BookLaunchPlanner = lazy(() => import('./pages/BookLaunchPlanner'));
const ARCManager = lazy(() => import('./pages/ARCManager'));
const SubmissionTracker = lazy(() => import('./pages/SubmissionTracker'));

// Admin (only 1 user)
const Admin = lazy(() => import('./pages/Admin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Legal / text pages (named exports — need wrapping)
const Privacy = lazy(() => import('./pages/TextPages').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/TextPages').then(m => ({ default: m.Terms })));
const Accessibility = lazy(() => import('./pages/TextPages').then(m => ({ default: m.Accessibility })));
const Rights = lazy(() => import('./pages/TextPages').then(m => ({ default: m.Rights })));
const Press = lazy(() => import('./pages/TextPages').then(m => ({ default: m.Press })));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Runeweave />} />
            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={['member', 'author', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="constellation/:id" element={<ConstellationDetail />} />
            <Route path="genres" element={<Genres />} />
            <Route path="imprints/bohio" element={<ImprintBohio />} />
            <Route path="imprints/void-noir" element={<ImprintVoidNoir />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="catalog/:id" element={<BookDetail />} />
            <Route path="submissions" element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <Submissions />
              </ProtectedRoute>
            } />
            <Route path="journeys" element={<Journeys />} />
            <Route path="journeys/:slug" element={<JourneyDetail />} />
            <Route path="journeys/:slug/episode/:num" element={
              <ProtectedRoute allowedRoles={['member', 'author', 'admin']}>
                <EpisodeReader />
              </ProtectedRoute>
            } />
            <Route path="community" element={<Community />} />
            <Route path="forge" element={<Forge />} />
            <Route path="connect" element={<AuthorConnect />} />
            <Route path="events" element={<Events />} />
            <Route path="posts" element={<Posts />} />
            <Route path="membership" element={<Membership />} />
            <Route path="library" element={
              <ProtectedRoute allowedRoles={['member', 'author', 'admin']}>
                <Library />
              </ProtectedRoute>
            } />
            <Route path="cart" element={
              <ProtectedRoute allowedRoles={['member', 'author', 'admin']}>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="checkout" element={
              <ProtectedRoute allowedRoles={['member', 'author', 'admin']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute allowedRoles={['member', 'author', 'admin']}>
                <OrderHistory />
              </ProtectedRoute>
            } />
            <Route path="authors" element={<Authors />} />
            <Route path="for-authors" element={<ForAuthors />} />
            <Route path="for-readers" element={<ForReaders />} />
            <Route path="spoiler-shield" element={<SpoilerShield />} />
            <Route path="wrapped" element={<ReadingWrapped />} />
            <Route path="mood-matcher" element={<MoodMatcher />} />
            <Route path="passages" element={<PassageCollections />} />
            <Route path="book-dna" element={<BookDNA />} />
            <Route path="compatibility" element={<ReaderCompatibility />} />
            <Route path="content-compass" element={<ContentCompass />} />
            <Route path="beta-reader" element={<BetaReaderHub />} />
            <Route path="for-beta-readers" element={<ForBetaReaders />} />
            <Route path="manuscript-pipeline" element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <ManuscriptPipeline />
              </ProtectedRoute>
            } />
            <Route path="beta-campaign" element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <BetaCampaign />
              </ProtectedRoute>
            } />
            <Route path="editor-bridge" element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <EditorBridge />
              </ProtectedRoute>
            } />
            <Route path="revision-rounds" element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <RevisionRounds />
              </ProtectedRoute>
            } />
            <Route path="manuscript-inbox" element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <ManuscriptInbox />
              </ProtectedRoute>
            } />
            <Route path="editor-beta-manager" element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <EditorBetaManager />
              </ProtectedRoute>
            } />
            <Route path="royalty-calculator" element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <RoyaltyCalculator />
              </ProtectedRoute>
            } />
            <Route path="author/:slug" element={<AuthorProfile />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="rights" element={<Rights />} />
            <Route path="press" element={<Press />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="accessibility" element={<Accessibility />} />
          </Route>
          <Route path="/portal" element={
              <Portal />
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/read/:bookId/:chapterId" element={
            <ProtectedRoute allowedRoles={['member', 'author', 'admin']}>
              <BookReader />
            </ProtectedRoute>
          } />
          <Route path="/creator" element={
            <ProtectedRoute allowedRoles={['author', 'admin']}>
              <CreatorStudio />
            </ProtectedRoute>
          } />
          <Route path="/forge-editor" element={
            <ProtectedRoute allowedRoles={['author', 'admin']}>
              <ForgeEditor />
            </ProtectedRoute>
          } />
          <Route path="/forge-editor/:manuscriptId" element={
            <ProtectedRoute allowedRoles={['author', 'admin']}>
              <ForgeEditor />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute allowedRoles={['author', 'admin']}>
              <AuthorOnboarding />
            </ProtectedRoute>
          } />
          <Route path="/writing-goals" element={
            <ProtectedRoute allowedRoles={['author', 'admin']}>
              <WritingGoals />
            </ProtectedRoute>
          } />
          <Route path="/launch-planner" element={
            <ProtectedRoute allowedRoles={['author', 'admin']}>
              <BookLaunchPlanner />
            </ProtectedRoute>
          } />
          <Route path="/arc-manager" element={
            <ProtectedRoute allowedRoles={['author', 'admin']}>
              <ARCManager />
            </ProtectedRoute>
          } />
          <Route path="/submission-tracker" element={
            <ProtectedRoute allowedRoles={['author', 'admin']}>
              <SubmissionTracker />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
