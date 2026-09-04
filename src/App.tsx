import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { StoreProvider } from "./context/StoreContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ReviewChoiceModal from "./components/ReviewChoiceModal";
import { BrandLoader } from "./components/ui";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Categories = lazy(() => import("./pages/Categories"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const ProductPage = lazy(() => import("./pages/Product"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const About = lazy(() => import("./pages/About"));
const Journal = lazy(() => import("./pages/Journal"));
const JournalPost = lazy(() => import("./pages/JournalPost"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Contact = lazy(() => import("./pages/Contact"));
const Faq = lazy(() => import("./pages/Faq"));
const Policy = lazy(() => import("./pages/Policy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminApp = lazy(() => import("./pages/admin/AdminApp"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function PublicShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-olive focus:px-4 focus:py-2 focus:text-cream">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.6, 0.3, 1] }}
          >
            <Suspense fallback={<BrandLoader />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/new-arrivals" element={<Shop newArrivals />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:slug" element={<CollectionDetail />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/track/:token" element={<TrackOrder />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/about" element={<About />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/journal/:slug" element={<JournalPost />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/privacy-policy" element={<Policy kind="privacy" />} />
                <Route path="/shipping-policy" element={<Policy kind="shipping" />} />
                <Route path="/returns" element={<Policy kind="returns" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppFloat />
      <ReviewChoiceModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ScrollToTop />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<BrandLoader />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<PublicShell />} />
      </Routes>
    </StoreProvider>
  );
}
