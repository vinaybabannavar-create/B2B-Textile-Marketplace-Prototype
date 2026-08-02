import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([
    {
      productId: 'prod_demo_1',
      quantity: 200,
      product: {
        _id: 'prod_demo_1',
        id: 'prod_demo_1',
        name: 'Heavyweight Indigo Twill Denim',
        category: 'Denim',
        price: 6.80,
        unit: 'meter',
        images: ['https://images.unsplash.com/photo-1542272604-780c36856d66?w=900&q=80'],
        supplierName: 'Vanguard Textile Mills',
        supplierId: 'sup_vanguard',
        moq: 100
      }
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const buyerId = user?.id || 'buyer_demo_id';

  useEffect(() => {
    fetchCart();
  }, [buyerId]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`/api/cart/${buyerId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.warn('Using local cart fallback');
    }
  };

  const addToCart = async (product, quantity = 100) => {
    const qty = Math.max(quantity, product.moq || 10);
    const existingIdx = items.findIndex(i => (i.productId === product._id || i.productId === product.id));

    let updated;
    if (existingIdx > -1) {
      updated = [...items];
      updated[existingIdx].quantity += qty;
    } else {
      updated = [...items, { productId: product._id || product.id, quantity: qty, product }];
    }

    setItems(updated);
    setIsOpen(true);

    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, productId: product._id || product.id, quantity: qty })
      });
    } catch (err) {
      console.error('Cart add server error', err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updated = items.map(item => {
      if (item.productId === productId || item.product?._id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    setItems(updated);

    try {
      await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, productId, quantity })
      });
    } catch (err) {
      console.error('Cart update error', err);
    }
  };

  const removeFromCart = async (productId) => {
    const updated = items.filter(i => i.productId !== productId && i.product?._id !== productId);
    setItems(updated);

    try {
      await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, productId, quantity: 0 })
      });
    } catch (err) {
      console.error('Cart remove error', err);
    }
  };

  const clearCart = async () => {
    setItems([]);
    try {
      await fetch(`/api/cart/${buyerId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Cart clear error', err);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const totalMeters = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      setIsOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      totalMeters
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
