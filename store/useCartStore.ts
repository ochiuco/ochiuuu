import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number | string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  hemming?: boolean;
  hemmingFee?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number | string, color: string, size: string) => void;
  updateQuantity: (id: number | string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: CartItem) => {
        set((state: CartStore) => {
          const existing = state.items.find(
            (item: CartItem) =>
              item.id === newItem.id &&
              item.color === newItem.color &&
              item.size === newItem.size &&
              item.hemming === newItem.hemming
          );
          if (existing) {
            return {
              items: state.items.map((item: CartItem) =>
                item.id === newItem.id &&
                item.color === newItem.color &&
                item.size === newItem.size &&
                item.hemming === newItem.hemming
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id: number | string, color: string, size: string) => {
        set((state: CartStore) => ({
          items: state.items.filter(
            (item: CartItem) =>
              !(item.id === id && item.color === color && item.size === size)
          ),
        }));
      },

      updateQuantity: (id: number | string, color: string, size: string, quantity: number) => {
        if (quantity <= 0) {
          set((state: CartStore) => ({
            items: state.items.filter(
              (item: CartItem) =>
                !(item.id === id && item.color === color && item.size === size)
            ),
          }));
        } else {
          set((state: CartStore) => ({
            items: state.items.map((item: CartItem) =>
              item.id === id && item.color === color && item.size === size
                ? { ...item, quantity }
                : item
            ),
          }));
        }
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum: number, item: CartItem) => {
            const hemmingCost = item.hemming ? (item.hemmingFee || 15) : 0;
            return sum + (item.price + hemmingCost) * item.quantity;
          },
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;