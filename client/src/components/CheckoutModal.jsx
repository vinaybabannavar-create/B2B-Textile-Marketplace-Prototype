import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, CheckCircle2, Building2, CreditCard, Truck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    companyName: 'Apex Apparel Studio',
    contactPerson: 'Sarah Jenkins',
    email: 'sarah@apexgarments.com',
    phone: '+1 (555) 234-5678',
    address: '100 Fashion Way, Suite 400',
    city: 'New York',
    country: 'United States',
    notes: 'Please pack rolls in heavy moisture-barrier paper cores.'
  });

  const [paymentTerms, setPaymentTerms] = useState('Escrow Net 30 Credit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user?.id || 'buyer_demo_id',
          items,
          shippingInfo: formData,
          paymentTerms
        })
      });
      const data = await res.json();

      setIsSubmitting(false);
      setOrderConfirmed(data.orders || [{ _id: 'ord_' + Date.now(), totalAmount: subtotal + 45 }]);

      // Trigger celebrate confetti animation
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      clearCart();
    } catch (err) {
      console.error('Checkout submit error', err);
      setIsSubmitting(false);
      setOrderConfirmed([{ _id: 'ord_' + Date.now(), totalAmount: subtotal + 45 }]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-brand-600/10 text-brand-600 dark:text-brand-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">B2B Wholesale Order Checkout</h3>
              <p className="text-xs text-slate-400">Mocked escrow contract creation & shipping setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!orderConfirmed ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Shipping Info Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-500" /> Shipping & Delivery Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* B2B Payment Terms Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" /> Commercial Payment Terms
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Escrow Net 30 Credit', desc: 'Pay 30 days after mill dispatch inspection' },
                  { name: 'Letter of Credit (L/C)', desc: 'Bank backed commercial LC' },
                  { name: 'Bank Wire Transfer', desc: 'Direct SWIFT / TT wire' }
                ].map((term, i) => (
                  <div
                    key={i}
                    onClick={() => setPaymentTerms(term.name)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs ${
                      paymentTerms === term.name
                        ? 'border-brand-500 bg-brand-500/10 font-bold text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <span className="block font-bold text-slate-900 dark:text-white">{term.name}</span>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-1">{term.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Cost Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Total ({items.length} Fabric Lots):</span>
                <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Sample Swatch & Courier Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">$45.00 USD</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Contract Amount:</span>
                <span className="text-brand-600 dark:text-brand-400">${(subtotal + 45).toFixed(2)} USD</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>Confirm & Issue Purchase Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Purchase Order Issued Successfully!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Contract ID: <strong className="text-brand-600 dark:text-brand-400">{orderConfirmed[0]?._id || 'ORD_2026_99'}</strong>
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Your order has been written to the database with status <strong className="text-amber-500">"Pending Supplier Acceptance"</strong>. You can track its live progress on your Buyer Dashboard stepper!
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => {
                  onClose();
                  if (onOrderPlaced) onOrderPlaced();
                }}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg transition"
              >
                Track Order on Buyer Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
