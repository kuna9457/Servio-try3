'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service } from '@/types/service';

interface CartItem {
  id: string;
  service: {
    _id: string;
    category: string;
    provider: string;
    price: number;
    image: string;
    description: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (service: CartItem['service']) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  getCartCount: (serviceId: string) => number;
  getTotal: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem('cart');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('cart', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  }, [items, isInitialized]);

  const addToCart = (service: any) => {
    if (!service || !service._id) {
      console.error('Invalid service:', service);
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.service._id === service._id);
      if (existingItem) {
        return prevItems.map(item =>
          item.service._id === service._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { id: service._id, service, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    if (!serviceId) {
      console.error('Invalid serviceId:', serviceId);
      return;
    }

    setItems(prevItems => prevItems.filter(item => item.service._id !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (!serviceId || quantity < 0) {
      console.error('Invalid serviceId or quantity:', { serviceId, quantity });
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.service._id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const getCartCount = (serviceId: string) => {
    if (!serviceId) {
      console.error('Invalid serviceId:', serviceId);
      return 0;
    }

    const item = items.find(item => item.service._id === serviceId);
    return item ? item.quantity : 0;
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.service.price * item.quantity, 0);
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Don't render children until cart is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartCount,
        getTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 