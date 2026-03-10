/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
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
import { Privacy, Terms, Accessibility, Rights, Press } from './pages/TextPages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
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
          <Route path="posts" element={<Posts />} />
          <Route path="membership" element={<Membership />} />
          <Route path="library" element={<Library />} />
          <Route path="cart" element={<Cart />} />
          <Route path="authors" element={<Authors />} />
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
      </Routes>
    </BrowserRouter>
  );
}
