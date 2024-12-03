import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      
      if (existingItem) {
        const updatedItems = currentItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );

        // GTM event for Usermaven tracking
        window.dataLayer?.push({
          event: 'add_to_cart',
          usermaven_event: {
            value: item.price,
            currency: 'USD',
            items: [{
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              quantity: existingItem.quantity + 1
            }]
          }
        });

        return updatedItems;
      }

      // GTM event for Usermaven tracking
      window.dataLayer?.push({
        event: 'add_to_cart',
        usermaven_event: {
          value: item.price,
          currency: 'USD',
          items: [{
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: 1
          }]
        }
      });

      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
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
