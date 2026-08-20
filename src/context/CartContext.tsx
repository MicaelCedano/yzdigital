'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types';
import { getTierPrice } from '@/lib/utils';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalUnits: number;
  totalAmount: number;
  currency: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wholesale_quote_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem('wholesale_quote_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, initialized]);

  const calculateItemPrice = (product: Product, quantity: number) => {
    const p = product.currentPrice;
    if (!p) {
      return { price: 0, tierLabel: '1-9 uds', currency: 'USD' };
    }
    const { price, tierLabel } = getTierPrice(quantity, {
      tier1: p.priceTier1,
      tier2: p.priceTier2,
      tier3: p.priceTier3,
    });
    return { price, tierLabel, currency: p.currency || 'USD' };
  };

  const addItem = (product: Product, quantity: number = 1) => {
    if (!product.currentPrice) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const newQty = prev[existingIndex].quantity + quantity;
        const { price, tierLabel, currency } = calculateItemPrice(product, newQty);
        const updated = [...prev];
        updated[existingIndex] = {
          product,
          quantity: newQty,
          unitPrice: price,
          tierLabel,
          currency,
        };
        return updated;
      } else {
        const { price, tierLabel, currency } = calculateItemPrice(product, quantity);
        return [
          ...prev,
          {
            product,
            quantity,
            unitPrice: price,
            tierLabel,
            currency,
          },
        ];
      }
    });

    success(`Agregado a la cotización: ${product.brand} ${product.model} (${quantity} un.)`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const { price, tierLabel, currency } = calculateItemPrice(item.product, quantity);
          return {
            ...item,
            quantity,
            unitPrice: price,
            tierLabel,
            currency,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const currency = items.length > 0 ? items[0].currency : 'USD';

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalUnits,
        totalAmount,
        currency,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
