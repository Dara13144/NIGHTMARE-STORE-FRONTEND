import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nightmare_cart');
      return saved ? JSON.parse(saved) : { items: [], subtotal: 0, itemCount: 0 };
    } catch {
      return { items: [], subtotal: 0, itemCount: 0 };
    }
  });

  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.getCart();
      if (res && res.success && res.data) {
        if (Array.isArray(res.data.items) && res.data.items.length > 0) {
          setCart(res.data);
          localStorage.setItem('nightmare_cart', JSON.stringify(res.data));
        }
      }
    } catch {
      try {
        const saved = localStorage.getItem('nightmare_cart');
        if (saved) setCart(JSON.parse(saved));
      } catch {
        // silent fallback to local cart
      }
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productOrId, quantity = 1, openDrawer = true) => {
    try {
      setLoading(true);

      // Support passing product object directly
      if (typeof productOrId === 'object' && productOrId !== null) {
        if (productOrId.availableStock !== undefined && Number(productOrId.availableStock) <= 0) {
          showToast('This product is currently out of stock!', 'error');
          setLoading(false);
          return;
        }

        const itemObj = {
          id: productOrId.id || `item-${Date.now()}`,
          productId: productOrId.id,
          name: productOrId.name || productOrId.title,
          platform: productOrId.platform || productOrId.category || 'Digital Key',
          unitPrice: productOrId.price || productOrId.unitPrice || 0.50,
          price: productOrId.price || productOrId.unitPrice || 0.50,
          quantity: quantity,
          subtotal: +(quantity * (productOrId.price || productOrId.unitPrice || 0.50)).toFixed(2),
          coverImage: productOrId.coverImage || productOrId.image || '/card-rockstar-hd.png',
          availableStock: productOrId.availableStock !== undefined ? Number(productOrId.availableStock) : 99,
        };

        setCart((prev) => {
          const existingIndex = prev.items.findIndex(
            (i) => i.id === itemObj.id || (i.productId && i.productId === itemObj.productId)
          );
          let newItems = [...prev.items];
          if (existingIndex >= 0) {
            const updated = { ...newItems[existingIndex] };
            updated.quantity += quantity;
            updated.subtotal = +(updated.quantity * updated.unitPrice).toFixed(2);
            newItems[existingIndex] = updated;
          } else {
            newItems.push(itemObj);
          }
          const newSubtotal = +newItems.reduce((acc, i) => acc + (i.subtotal || i.price * i.quantity), 0).toFixed(2);
          const newItemCount = newItems.reduce((acc, i) => acc + i.quantity, 0);
          const updatedCart = { items: newItems, subtotal: newSubtotal, itemCount: newItemCount };
          localStorage.setItem('nightmare_cart', JSON.stringify(updatedCart));
          return updatedCart;
        });

        showToast('Item added to cart', 'success');
        if (openDrawer) {
          setIsCartOpen(true);
        }
        api.addToCart(productOrId.id, quantity).catch(() => {});
        return;
      }

      // If ID passed, attempt API call
      const res = await api.addToCart(productOrId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
        localStorage.setItem('nightmare_cart', JSON.stringify(res.data));
        showToast('Item added to cart', 'success');
        if (openDrawer) {
          setIsCartOpen(true);
        }
      }
    } catch (err) {
      // Local fallback for test IDs
      const fallbackItem = {
        id: productOrId,
        productId: productOrId,
        name: 'FiveM Activation Code',
        platform: 'Fivem',
        unitPrice: 0.50,
        price: 0.50,
        quantity,
        subtotal: +(quantity * 0.50).toFixed(2),
        coverImage: '/card-rockstar-hd.png',
        availableStock: 99,
      };

      setCart((prev) => {
        const existingIndex = prev.items.findIndex((i) => i.id === fallbackItem.id);
        let newItems = [...prev.items];
        if (existingIndex >= 0) {
          const updated = { ...newItems[existingIndex] };
          updated.quantity += quantity;
          updated.subtotal = +(updated.quantity * updated.unitPrice).toFixed(2);
          newItems[existingIndex] = updated;
        } else {
          newItems.push(fallbackItem);
        }
        const newSubtotal = +newItems.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2);
        const newItemCount = newItems.reduce((acc, i) => acc + i.quantity, 0);
        const updatedCart = { items: newItems, subtotal: newSubtotal, itemCount: newItemCount };
        localStorage.setItem('nightmare_cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      showToast('Item added to cart', 'success');
      if (openDrawer) {
        setIsCartOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    setCart((prev) => {
      const newItems = prev.items.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            quantity,
            subtotal: +(quantity * (i.unitPrice || i.price || 0.50)).toFixed(2),
          };
        }
        return i;
      });
      const newSubtotal = +newItems.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2);
      const newItemCount = newItems.reduce((acc, i) => acc + i.quantity, 0);
      const updatedCart = { items: newItems, subtotal: newSubtotal, itemCount: newItemCount };
      localStorage.setItem('nightmare_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });

    try {
      await api.updateCartQuantity(itemId, quantity);
    } catch (err) {
      console.warn('API sync warning:', err.message);
    }
  };

  const removeFromCart = async (itemId) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.id !== itemId);
      const newSubtotal = +newItems.reduce((acc, i) => acc + (i.subtotal || i.price * i.quantity), 0).toFixed(2);
      const newItemCount = newItems.reduce((acc, i) => acc + i.quantity, 0);
      const updatedCart = { items: newItems, subtotal: newSubtotal, itemCount: newItemCount };
      localStorage.setItem('nightmare_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
    showToast('Item removed from cart', 'info');

    try {
      await api.removeFromCart(itemId);
    } catch (err) {
      console.warn('API sync warning:', err.message);
    }
  };

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, itemCount: 0 });
    localStorage.removeItem('nightmare_cart');
    localStorage.removeItem('sbay_cart');
  };

  const value = {
    cart,
    itemCount: cart.itemCount || 0,
    subtotal: cart.subtotal || 0,
    items: cart.items || [],
    loading,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
      isCartOpen: false,
      setIsCartOpen: () => {},
      addToCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      refreshCart: () => {},
    };
  }
  return context;
}
