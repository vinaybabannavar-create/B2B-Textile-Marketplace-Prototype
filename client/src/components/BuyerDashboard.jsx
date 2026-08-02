import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle2, Truck, Sparkles, Building2, ChevronRight, FileText } from 'lucide-react';

export default function BuyerDashboard({ onExploreMarketplace }) {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const buyerId = user?.id || 'buyer_demo_id';

  useEffect(() => {
    fetchOrders();
  }, [buyerId]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/buyer/${buyerId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Fetch buyer orders error', err);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Pending Acceptance' },
    { key: 'accepted', label: 'Accepted by Mill' },
    { key: 'preparing', label: 'Preparing Dye Lot' },
    { key: 'ready_for_dispatch', label: 'Ready for Dispatch' },
    { key: 'completed', label: 'Completed' }
  ];

  const getStepIndex = (status) => {
    const idx = statusSteps.findIndex(s => s.key === status);
    return idx > -1 ? idx : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 border border-slate-800 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display">{user?.name || 'Apex Apparel Studio'}</h2>
            <p className="text-xs text-brand-300">Buyer Account • {profile?.businessType || 'Garment Manufacturer'}</p>
          </div>
        </div>

        <button
          onClick={onExploreMarketplace}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition"
        >
          Source More Fabric
        </button>
      </div>

      {/* Orders Stepper Tracking Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-500" /> Active Purchase Orders & Live Stepper
        </h3>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading order pipeline...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-darkcard rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No active purchase orders</h4>
            <p className="text-xs text-slate-400">Place your first order from the marketplace catalog to track mill production!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const currentStepIdx = getStepIndex(order.status);

              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800/80 shadow-md space-y-6"
                >
                  {/* Order Meta Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          Order #{order._id || order.id}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold capitalize">
                          {order.supplierName || 'Vanguard Textile Mills'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} • Terms: {order.paymentTerms || 'Net 30'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Contract Total</span>
                      <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                        ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} USD
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Stepper Bar */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Live Order Pipeline Progress:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {statusSteps.map((step, sIdx) => {
                        const isDone = sIdx <= currentStepIdx;
                        const isCurrent = sIdx === currentStepIdx;

                        return (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              isCurrent
                                ? 'bg-brand-600 text-white border-brand-600 font-extrabold shadow-lg scale-[1.02]'
                                : isDone
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold'
                                : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-1.5 mb-1">
                              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              <span className="text-[10px] uppercase font-bold">Step {sIdx + 1}</span>
                            </div>
                            <span className="text-xs block truncate">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-400 block mb-2">Itemized Fabric Lots:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items?.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                        >
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=200&q=80'}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {item.quantity} meters @ ${item.price}/m
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
