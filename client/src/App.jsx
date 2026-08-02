import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import TextureZoomModal from './components/TextureZoomModal';
import AiAssistant from './components/AiAssistant';
import OnboardingModal from './components/OnboardingModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import BuyerDashboard from './components/BuyerDashboard';
import SupplierDashboard from './components/SupplierDashboard';
import AuthModal from './components/AuthModal';
import { Filter, SlidersHorizontal, Sparkles, RefreshCw, X, Scale } from 'lucide-react';

function MarketplaceContent() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace', 'buyer_dashboard', 'supplier_dashboard'

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [nluFilter, setNluFilter] = useState(null);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [zoomModal, setZoomModal] = useState({ isOpen: false, img: '', title: '', gsm: 0, comp: '' });
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Multi-product comparison list
  const [comparedProducts, setComparedProducts] = useState([]);

  const categories = ['All', 'Cotton', 'Silk', 'Denim', 'Linen', 'Wool', 'Synthetics', 'Knits', 'Brocade', 'Velvet'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, maxPrice, searchQuery, sortBy, nluFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?category=${selectedCategory}&maxPrice=${maxPrice}&search=${searchQuery}&sort=${sortBy}`;
      if (nluFilter?.category) url += `&category=${nluFilter.category}`;
      if (nluFilter?.maxPrice) url += `&maxPrice=${nluFilter.maxPrice}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Fetch products error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompare = (prod) => {
    const exists = comparedProducts.some(p => (p._id || p.id) === (prod._id || prod.id));
    if (exists) {
      setComparedProducts(comparedProducts.filter(p => (p._id || p.id) !== (prod._id || prod.id)));
    } else {
      if (comparedProducts.length >= 3) {
        alert('You can compare a maximum of 3 products at a time.');
        return;
      }
      setComparedProducts([...comparedProducts, prod]);
      setIsAiOpen(true);
    }
  };

  const handleOpenZoom = (img, title, gsm, comp) => {
    setZoomModal({ isOpen: true, img, title, gsm, comp });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-darkbg text-slate-900 dark:text-slate-100">
      {/* Global Glassmorphic Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchSubmit={(q) => setSearchQuery(q)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'marketplace' && (
          <>
            {/* Hero Banner */}
            <Hero
              onExplore={() => {
                const el = document.getElementById('catalog-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenAi={() => setIsAiOpen(true)}
              onCategorySelect={(cat) => setSelectedCategory(cat)}
            />

            {/* Marketplace Catalog Section */}
            <section id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
              
              {/* Category Pills & Filters Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                {/* Category Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  {categories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setNluFilter(null);
                      }}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Price Filter & Sort Dropdown */}
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Max Price:</span>
                    <span className="text-brand-600 dark:text-brand-400 font-extrabold">${maxPrice}/m</span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-24 accent-brand-600 cursor-pointer"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* NLU Search Active Banner */}
              {nluFilter && (
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Applied AI Natural Query Filter</span>
                  </div>
                  <button
                    onClick={() => setNluFilter(null)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                  >
                    <X className="w-3.5 h-3.5" /> Clear AI Filter
                  </button>
                </div>
              )}

              {/* Catalog Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Filter className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No fabrics match your criteria</h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setMaxPrice(100);
                      setSearchQuery('');
                      setNluFilter(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((prod, idx) => (
                    <ProductCard
                      key={idx}
                      product={prod}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onOpenZoom={handleOpenZoom}
                      onToggleCompare={handleToggleCompare}
                      isCompared={comparedProducts.some(cp => (cp._id || cp.id) === (prod._id || prod.id))}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'buyer_dashboard' && (
          <BuyerDashboard onExploreMarketplace={() => setActiveTab('marketplace')} />
        )}

        {activeTab === 'supplier_dashboard' && (
          <SupplierDashboard />
        )}
      </main>

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenZoom={handleOpenZoom}
        allProducts={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <TextureZoomModal
        isOpen={zoomModal.isOpen}
        onClose={() => setZoomModal({ ...zoomModal, isOpen: false })}
        imageSrc={zoomModal.img}
        title={zoomModal.title}
        gsm={zoomModal.gsm}
        composition={zoomModal.comp}
      />

      <AiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onApplyNluFilter={(filter) => {
          setNluFilter(filter);
          setIsAiOpen(false);
        }}
        comparedProducts={comparedProducts}
        onClearCompared={() => setComparedProducts([])}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <CartDrawer
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={() => setActiveTab('buyer_dashboard')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => setIsOnboardingOpen(true)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            FabricMart © 2026 B2B Textile Marketplace Platform
          </p>
          <p className="text-[11px]">
            Powered by Node.js, Express, MongoDB, Three.js 3D Cloth Physics & FabricMart AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MarketplaceContent />
      </CartProvider>
    </AuthProvider>
  );
}
