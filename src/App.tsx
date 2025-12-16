import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Services from './components/Services';
import RepairConfigurator from './components/RepairConfigurator';
import Articles from './components/Articles';
import Contact from './components/Contact';
import WhyUs from './components/WhyUs';
import FAQ from './components/FAQ';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AnnouncementPopup from './components/AnnouncementPopup';
import VacationBanner from './components/VacationBanner';

const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const AGB = lazy(() => import('./pages/AGB'));
const Kontakt = lazy(() => import('./pages/Kontakt'));
const CookieRichtlinie = lazy(() => import('./pages/CookieRichtlinie'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ArticleManager = lazy(() => import('./pages/admin/ArticleManager'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));
const PageTextManager = lazy(() => import('./pages/admin/PageTextManager'));
const PriceManager = lazy(() => import('./pages/admin/PriceManager'));
const FAQManager = lazy(() => import('./pages/admin/FAQManager'));
const GoogleManager = lazy(() => import('./pages/admin/GoogleManager'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const VoucherManager = lazy(() => import('./pages/admin/VoucherManager'));
const HeroSlideManager = lazy(() => import('./pages/admin/HeroSlideManager'));
const PopManager = lazy(() => import('./pages/admin/PopManager'));
const LegalConfigManager = lazy(() => import('./pages/admin/LegalConfigManager'));
const VacationModeManager = lazy(() => import('./pages/admin/VacationModeManager'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <VacationBanner />
      <Header />
      <Hero />
      <Services />
      <RepairConfigurator />
      <Articles />
      <Contact />
      <WhyUs />
      <FAQ />
      <Testimonials />
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementPopup />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/cookie-richtlinie" element={<CookieRichtlinie />} />
          <Route path="/artikel/:slug" element={<ArticleDetail />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="hero-slides" element={<HeroSlideManager />} />
            <Route path="articles" element={<ArticleManager />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="page-texts" element={<PageTextManager />} />
            <Route path="prices" element={<PriceManager />} />
            <Route path="faq" element={<FAQManager />} />
            <Route path="google" element={<GoogleManager />} />
            <Route path="vouchers" element={<VoucherManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="pop" element={<PopManager />} />
            <Route path="legal-config" element={<LegalConfigManager />} />
            <Route path="vacation" element={<VacationModeManager />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
