import React from 'react';
import { useCart } from '../context/CartContext';
import { Sparkles, Maximize2, ShoppingCart, Check, Star, ShieldCheck } from 'lucide-react';

export default function ProductCard({
  product,
  onSelectProduct,
  onOpenZoom,
  onToggleCompare,
  isCompared
}) {
  const { addToCart } = useCart();

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=800&q=80';

  return (
    <div className="group relative bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-brand-500/50 transition-all duration-300 flex flex-col">
      {/* Image Container with Zoom CTA */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-white uppercase tracking-wider">
            {product.category}
          </span>
          {product.specifications?.gsm && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-[10px] font-extrabold text-white">
              {product.specifications.gsm} GSM
            </span>
          )}
        </div>

        {/* High-Res Zoom Magnifier CTA button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenZoom(primaryImage, product.name, product.specifications?.gsm, product.specifications?.composition);
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white hover:border-brand-500 hover:bg-brand-600 transition shadow-lg"
          title="Zoom In / Inspect Weave Texture"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Supplier Badge */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs text-white/90">
          <span className="font-semibold truncate max-w-[180px] drop-shadow-md">
            {product.supplierName}
          </span>
          <div className="flex items-center space-x-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-bold text-xs">{product.rating || 4.8}</span>
          </div>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-base text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer line-clamp-1 transition"
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Specs Highlights */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px]">Composition</span>
            <strong className="truncate block font-semibold text-slate-800 dark:text-slate-200">
              {product.specifications?.composition || '100% Cotton'}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Min MOQ</span>
            <strong className="truncate block font-semibold text-slate-800 dark:text-slate-200">
              {product.moq || 50} {product.unit || 'm'}
            </strong>
          </div>
        </div>

        {/* Price & Action Controls */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Price per {product.unit || 'meter'}</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                ${product.price ? product.price.toFixed(2) : '0.00'}
              </span>
              <span className="text-xs text-slate-400 font-medium">USD</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Compare Checkbox */}
            <button
              onClick={() => onToggleCompare(product)}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition ${
                isCompared
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-500'
              }`}
              title="Compare specs with another product"
            >
              {isCompared ? 'Compared' : '+ Compare'}
            </button>

            {/* Quick Add to Cart */}
            <button
              onClick={() => addToCart(product, product.moq || 50)}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition hover:scale-105 active:scale-95"
              title="Add MOQ to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
