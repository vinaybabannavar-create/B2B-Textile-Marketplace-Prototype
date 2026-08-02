import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Maximize2, ShoppingCart, Star, ShieldCheck, Sparkles, Box, Send, ChevronRight } from 'lucide-react';
import Fabric3DVisualizer from './Fabric3DVisualizer';

export default function ProductDetailModal({
  product,
  onClose,
  onOpenZoom,
  allProducts,
  onSelectProduct
}) {
  const { addToCart } = useCart();
  const [selectedImg, setSelectedImg] = useState(product?.images?.[0] || 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=900&q=80');
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', '3d', 'ai_qa'
  const [orderQty, setOrderQty] = useState(product?.moq || 100);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  if (!product) return null;

  const handleAskAi = async () => {
    if (!aiQuestion.trim()) return;
    setIsAskingAi(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ sender: 'user', text: aiQuestion }],
          currentProductId: product._id || product.id
        })
      });
      const data = await res.json();
      setAiAnswer(data.text);
    } catch (err) {
      setAiAnswer('Regarding this fabric: GSM is ' + (product.specifications?.gsm || 200) + ' and MOQ is ' + (product.moq || 50) + ' meters.');
    } finally {
      setIsAskingAi(false);
    }
  };

  const similarProducts = (allProducts || [])
    .filter(p => p.category === product.category && (p._id !== product._id && p.id !== product.id))
    .slice(0, 3);

  const colors = product.colors || ['Indigo', 'White', 'Black'];
  const specs = product.specifications || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase">
              {product.category}
            </span>
            <span className="text-xs text-slate-400">ID: {product._id || product.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Gallery & Zoom Magnifier CTA */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <img
                src={selectedImg}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onOpenZoom(selectedImg, product.name, specs.gsm, specs.composition)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-white hover:bg-brand-600 transition shadow-xl flex items-center space-x-1.5 text-xs font-bold"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Zoom Texture</span>
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${selectedImg === img ? 'border-brand-500 scale-105' : 'border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Supplier Snapshot Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Fabric Manufacturer</span>
                <strong className="text-slate-900 dark:text-white font-bold text-sm">{product.supplierName}</strong>
              </div>
              <div className="flex items-center space-x-1 text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Mill</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Specs, 3D Preview & AI Q&A */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {product.name}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {product.description}
              </p>

              {/* Price & MOQ Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Wholesale Price</span>
                  <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                    ${product.price ? product.price.toFixed(2) : '0.00'}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ {product.unit || 'meter'}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Min Order (MOQ)</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {product.moq || 50} {product.unit || 'meters'}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 mt-6 pb-2">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'specs' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Technical Specs
                </button>
                <button
                  onClick={() => setActiveTab('3d')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${activeTab === '3d' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Box className="w-3.5 h-3.5" /> 3D Cloth Drape
                </button>
                <button
                  onClick={() => setActiveTab('ai_qa')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${activeTab === 'ai_qa' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Product Q&A
                </button>
              </div>

              {/* Tab Contents */}
              <div className="pt-4">
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Weight (GSM)</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{specs.gsm || 220} GSM</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Composition</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{specs.composition || '100% Cotton'}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Weave Type</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{specs.weaveType || 'Twill'}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Usable Width</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{specs.width || '58 inches'}</strong>
                    </div>
                  </div>
                )}

                {activeTab === '3d' && (
                  <Fabric3DVisualizer
                    fabricName={product.name}
                    color={colors[0] === 'Indigo' ? '#1e3a8a' : colors[0] === 'Gold' ? '#d97706' : '#334155'}
                    gsm={specs.gsm || 220}
                  />
                )}

                {activeTab === 'ai_qa' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ask AI e.g. Is this suitable for summer dresses?"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                        className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button
                        onClick={handleAskAi}
                        disabled={isAskingAi}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-brand-600 text-white text-xs font-bold"
                      >
                        {isAskingAi ? '...' : <Send className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {aiAnswer && (
                      <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 space-y-1">
                        <div className="flex items-center space-x-1.5 font-bold text-indigo-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>FabricMart AI Answer:</span>
                        </div>
                        <p className="leading-relaxed">{aiAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Order Quantity ({product.unit || 'meters'}):</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setOrderQty(prev => Math.max(product.moq || 50, prev - 50))}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(product.moq || 50, Number(e.target.value)))}
                    className="w-20 text-center py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold"
                  />
                  <button
                    onClick={() => setOrderQty(prev => prev + 50)}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Subtotal ({orderQty} {product.unit || 'meters'}):</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  ${((product.price || 0) * orderQty).toFixed(2)} USD
                </span>
              </div>

              <button
                onClick={() => {
                  addToCart(product, orderQty);
                  onClose();
                }}
                className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center space-x-2 transition hover:scale-[1.01]"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add {orderQty} {product.unit || 'Meters'} to Cart</span>
              </button>
            </div>

          </div>

        </div>

        {/* AI Similar Fabrics Strip */}
        {similarProducts.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Similar Fabric Suggestions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarProducts.map((sp, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectProduct(sp)}
                  className="flex items-center space-x-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:border-brand-500 transition"
                >
                  <img src={sp.images?.[0]} alt={sp.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{sp.name}</p>
                    <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">${sp.price}/m</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
