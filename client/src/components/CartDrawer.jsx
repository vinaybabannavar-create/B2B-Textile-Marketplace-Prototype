import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingCart, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CartDrawer({ onProceedCheckout }) {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, subtotal, totalMeters } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-darkcard border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Wholesale Sourcing Cart</h3>
            <p className="text-xs text-slate-400">{items.length} Fabric Lots ({totalMeters} Total Meters)</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Your sourcing cart is empty</p>
            <p className="text-xs text-slate-400">Browse the marketplace catalog or ask AI to add fabric swatches.</p>
          </div>
        ) : (
          items.map((item, idx) => {
            const product = item.product || {};
            const itemSubtotal = (product.price || 0) * item.quantity;
            const moqWarning = item.quantity < (product.moq || 10);

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex items-center space-x-4"
              >
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=400&q=80'}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {product.name || 'Fabric Lot'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mill: {product.supplierName || 'Vanguard Mills'}
                  </p>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      ${product.price ? product.price.toFixed(2) : '0.00'}/m
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-400 font-semibold">${itemSubtotal.toFixed(2)} USD</span>
                  </div>

                  {moqWarning && (
                    <div className="flex items-center space-x-1 text-[10px] text-amber-500 font-bold">
                      <AlertCircle className="w-3 h-3" />
                      <span>Below Supplier MOQ ({product.moq}m)</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 50)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-1 text-slate-800 dark:text-slate-200">{item.quantity}m</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 50)}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                    title="Remove fabric lot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary Footer */}
      {items.length > 0 && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Fabric Subtotal:</span>
              <span className="font-bold text-slate-900 dark:text-white">${subtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Sample Swatch Freight:</span>
              <span className="font-bold text-slate-900 dark:text-white">$45.00 USD</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Total Order Estimate:</span>
              <span className="text-brand-600 dark:text-brand-400">${(subtotal + 45).toFixed(2)} USD</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Protected by FabricMart B2B Escrow Net 30 Terms</span>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onProceedCheckout();
            }}
            className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition hover:scale-[1.01]"
          >
            <span>Proceed to B2B Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
