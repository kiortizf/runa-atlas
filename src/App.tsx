/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Runeweave from './pages/Runeweave';
import ConstellationDetail from './pages/ConstellationDetail';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Submissions from './pages/Submissions';
import Portal from './pages/Portal';
import Community from './pages/Community';
import Journeys from './pages/Journeys';
import JourneyDetail from './pages/JourneyDetail';
import EpisodeReader from './pages/EpisodeReader';
import Posts from './pages/Posts';
import Membership from './pages/Membership';
import Library from './pages/Library';
import Cart from './pages/Cart';
import Authors from './pages/Authors';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Forge from './pages/Forge';
import AuthorConnect from './pages/AuthorConnect';
import Events from './pages/Events';
import BookReader from './pages/BookReader';
import CreatorStudio from './pages/CreatorStudio';
import ForgeEditor from './pages/ForgeEditor';
import ForAuthors from './pages/ForAuthors';
import ForReaders from './pages/ForReaders';
import AuthorOnboarding from './pages/AuthorOnboarding';
import AuthorProfile from './pages/AuthorProfile';
import RoyaltyCalculator from './pages/RoyaltyCalculator';
import WritingGoals from './pages/WritingGoals';
import BookLaunchPlanner from './pages/BookLaunchPlanner';
import ARCManager from './pages/ARCManager';
import SubmissionTracker from './pages/SubmissionTracker';
import SpoilerShield from './pages/SpoilerShield';
import ReadingWrapped from './pages/ReadingWrapped';
import MoodMatcher from './pages/MoodMatcher';
import PassageCollections from './pages/PassageCollections';
import BookDNA from './pages/BookDNA';
import ReaderCompatibility from './pages/ReaderCompatibility';
import ContentCompass from './pages/ContentCompass';
import BetaReaderHub from './pages/BetaReaderHub';
import ForBetaReaders from './pages/ForBetaReaders';
import ManuscriptPipeline from './pages/ManuscriptPipeline';
import BetaCampaign from './pages/BetaCampaign';
import EditorBridge from './pages/EditorBridge';
import RevisionRounds from './pages/RevisionRounds';
import ManuscriptInbox from './pages/ManuscriptInbox';
import EditorBetaManager from './pages/EditorBetaManager';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Genres from './pages/Genres';
import ImprintBohio from './pages/ImprintBohio';
import ImprintVoidNoir from './pages/ImprintVoidNoir';
import { Privacy, Terms, Accessibility, Rights, Press } from './pages/TextPages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Runeweave />} />
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
          <Route path="journeys/:slug/episode/:num" element={<EpisodeReader />} />
          <Route path="community" element={<Community />} />
          <Route path="forge" element={<Forge />} />
          <Route path="connect" element={<AuthorConnect />} />
          <Route path="events" element={<Events />} />
          <Route path="posts" element={<Posts />} />
          <Route path="membership" element={<Membership />} />
          <Route path="library" element={<Library />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<OrderHistory />} />
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
          <Route path="manuscript-pipeline" element={<ManuscriptPipeline />} />
          <Route path="beta-campaign" element={<BetaCampaign />} />
          <Route path="editor-bridge" element={<EditorBridge />} />
          <Route path="revision-rounds" element={<RevisionRounds />} />
          <Route path="manuscript-inbox" element={<ManuscriptInbox />} />
          <Route path="editor-beta-manager" element={<EditorBetaManager />} />
          <Route path="royalty-calculator" element={<RoyaltyCalculator />} />
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
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <Portal />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/read/:bookId/:chapterId" element={<BookReader />} />
        <Route path="/creator" element={
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <CreatorStudio />
          </ProtectedRoute>
        } />
        <Route path="/forge-editor" element={
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <ForgeEditor />
          </ProtectedRoute>
        } />
        <Route path="/forge-editor/:manuscriptId" element={
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <ForgeEditor />
          </ProtectedRoute>
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <AuthorOnboarding />
          </ProtectedRoute>
        } />
        <Route path="/writing-goals" element={
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <WritingGoals />
          </ProtectedRoute>
        } />
        <Route path="/launch-planner" element={
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <BookLaunchPlanner />
          </ProtectedRoute>
        } />
        <Route path="/arc-manager" element={
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <ARCManager />
          </ProtectedRoute>
        } />
        <Route path="/submission-tracker" element={
          <ProtectedRoute allowedRoles={['author', 'admin']} requireAuth={false}>
            <SubmissionTracker />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
