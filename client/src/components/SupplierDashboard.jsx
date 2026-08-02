import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Package,
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Product Form State
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Cotton',
    price: 8.50,
    stockQuantity: 1500,
    moq: 50,
    description: '',
    gsm: 220,
    composition: '100% Organic Cotton',
    weaveType: 'Twill',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=800&q=80'
  });
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const supplierId = user?.id || 'sup_vanguard';

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [supplierId]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Fetch supplier products error', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/supplier/${supplierId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Fetch supplier orders error', err);
    }
  };

  // AI Product Description Generator
  const handleGenerateAiDescription = async () => {
    if (!newProd.name) {
      alert('Please enter a product name first.');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await fetch('/api/products/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      const data = await res.json();
      setNewProd(prev => ({ ...prev, description: data.description }));
    } catch (err) {
      setNewProd(prev => ({
        ...prev,
        description: `Premium ${newProd.name} manufactured for B2B garment production. Features ${newProd.gsm} GSM weight with superior handfeel.`
      }));
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        supplierId,
        supplierName: user?.name || 'Vanguard Textile Mills',
        name: newProd.name,
        category: newProd.category,
        description: newProd.description || 'High quality B2B textile fabric.',
        images: [newProd.imageUrl],
        price: Number(newProd.price),
        stockQuantity: Number(newProd.stockQuantity),
        moq: Number(newProd.moq),
        specifications: {
          gsm: Number(newProd.gsm),
          composition: newProd.composition,
          weaveType: newProd.weaveType,
          width: '58/60 inches'
        }
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error('Create product failed', err);
    }
  };

  // Advance Order Status Stepper
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Status update error', err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from your mill inventory?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      console.error('Delete product error', err);
    }
  };

  const lowStockCount = products.filter(p => p.stockQuantity < 500).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-900/40 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-extrabold text-xl flex items-center justify-center shadow-lg">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display">{user?.name || 'Vanguard Textile Mills'}</h2>
            <p className="text-xs text-amber-300">Supplier Mill Portal • Verified B2B Exporter</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Fabric Lot</span>
        </button>
      </div>

      {/* Analytics Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Catalog Items</span>
            <strong className="text-xl font-extrabold text-slate-900 dark:text-white">{products.length} Fabrics</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Pending Acceptance</span>
            <strong className="text-xl font-extrabold text-indigo-500">{pendingOrdersCount} Orders</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Low Stock Alerts</span>
            <strong className="text-xl font-extrabold text-rose-500">{lowStockCount} Lots</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Active Order Revenue</span>
            <strong className="text-xl font-extrabold text-emerald-500">
              ${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(0)} USD
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'inventory' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
        >
          Inventory Management ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'orders' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
        >
          Incoming Purchase Orders ({orders.length})
        </button>
      </div>

      {/* Inventory Management View */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/80 text-[10px] font-bold text-white uppercase">
                      {p.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{p.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Stock Available:</span>
                    <span className={p.stockQuantity < 500 ? 'text-rose-500 font-bold' : 'text-emerald-500'}>
                      {p.stockQuantity} meters
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Wholesale Price:</span>
                    <span className="text-brand-600 dark:text-brand-400 font-extrabold">${p.price}/m</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">MOQ: {p.moq || 50}m</span>
                  <button
                    onClick={() => handleDeleteProduct(p._id || p.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming Orders View with Stepper Action Buttons */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No incoming orders yet.</div>
          ) : (
            orders.map((ord, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-darkcard border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Order #{ord._id || ord.id} • Buyer: {ord.shippingInfo?.companyName || 'Apex Garments'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Current Status: <strong className="text-amber-500 uppercase">{ord.status}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Stepper Buttons for Supplier */}
                    {ord.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id || ord.id, 'accepted')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Accept Order
                      </button>
                    )}
                    {ord.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id || ord.id, 'preparing')}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                      >
                        Start Preparation
                      </button>
                    )}
                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id || ord.id, 'ready_for_dispatch')}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                      >
                        Mark Ready for Dispatch
                      </button>
                    )}
                    {ord.status === 'ready_for_dispatch' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id || ord.id, 'completed')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Complete Order
                      </button>
                    )}
                    {ord.status === 'completed' && (
                      <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" /> <span>Order Fulfilled</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  <p>Shipping To: {ord.shippingInfo?.address}, {ord.shippingInfo?.city}</p>
                  <p>Total Contract Value: <strong className="text-white">${ord.totalAmount?.toFixed(2)} USD</strong></p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal with AI Auto Description */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Fabric Lot to Mill Catalog</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fabric Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14.5oz Indigo Ring-Spun Denim"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {['Cotton', 'Silk', 'Denim', 'Linen', 'Wool', 'Synthetics', 'Knits', 'Velvet'].map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price per Meter ($ USD)</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock (Meters)</label>
                  <input
                    type="number"
                    required
                    value={newProd.stockQuantity}
                    onChange={(e) => setNewProd({ ...newProd, stockQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weight (GSM)</label>
                  <input
                    type="number"
                    required
                    value={newProd.gsm}
                    onChange={(e) => setNewProd({ ...newProd, gsm: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min MOQ (Meters)</label>
                  <input
                    type="number"
                    required
                    value={newProd.moq}
                    onChange={(e) => setNewProd({ ...newProd, moq: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isGeneratingDesc ? 'Generating...' : 'AI Auto-Generate Description'}
                  </button>
                </div>
                <textarea
                  rows="3"
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold"
                >
                  Publish Fabric Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
