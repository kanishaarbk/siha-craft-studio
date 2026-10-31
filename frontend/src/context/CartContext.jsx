import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  const getSessionKey = () => {
    let key = localStorage.getItem('siha_session_key');
    if (!key) {
      key = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('siha_session_key', key);
    }
    return key;
  };

  const fetchCart = useCallback(async () => {
    try {
      const sessionKey = getSessionKey();
      const res = await api.get(`/cart/?session_key=${sessionKey}`);
      setCart(res.data);
      if (res.data.session_key) {
        localStorage.setItem('siha_session_key', res.data.session_key);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, user]);

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    try {
      const sessionKey = getSessionKey();
      const res = await api.post('/cart/add/', {
        product_id: productId,
        variant_id: variantId,
        quantity,
        session_key: sessionKey,
      });
      setCart(res.data.cart);
      toast.success(res.data.message || 'Added to your handmade basket!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not add item to cart.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const sessionKey = getSessionKey();
      const res = await api.put(`/cart/items/${itemId}/`, {
        quantity,
        session_key: sessionKey,
      });
      setCart(res.data.cart);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not update item quantity.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const sessionKey = getSessionKey();
      const res = await api.delete(`/cart/items/${itemId}/delete/?session_key=${sessionKey}`);
      setCart(res.data.cart);
      toast.info('Item removed from cart.');
      return { success: true };
    } catch (err) {
      toast.error('Could not remove item.');
      return { success: false };
    }
  };

  const clearCart = () => {
    setCart(null);
    fetchCart();
  };

  const cartCount = cart?.total_items || 0;
  const subtotal = cart?.subtotal ? parseFloat(cart.subtotal) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        subtotal,
        addToCart,
        updateCartItem,
        removeFromCart,
        fetchCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
