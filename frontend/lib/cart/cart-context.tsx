"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/cart/types";

const STORAGE_KEY = "kodigo.cart.v1";

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "remove"; productId: number }
  | { type: "setQuantity"; productId: number; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      const maxQty = action.item.stock;
      if (existing) {
        const nextQty = Math.min(existing.quantity + action.quantity, maxQty);
        return {
          items: state.items.map((i) =>
            i.productId === action.item.productId ? { ...i, quantity: nextQty } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { ...action.item, quantity: Math.min(action.quantity, maxQty) },
        ],
      };
    }
    case "remove":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "setQuantity":
      return {
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: Math.max(1, Math.min(action.quantity, i.stock)) }
            : i
        ),
      };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "hydrate", items: JSON.parse(raw) as CartItem[] });
      }
    } catch {
      // ignore corrupted local storage
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = state.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    return {
      items: state.items,
      count,
      subtotal,
      addItem: (item, quantity = 1) => dispatch({ type: "add", item, quantity }),
      removeItem: (productId) => dispatch({ type: "remove", productId }),
      setQuantity: (productId, quantity) => dispatch({ type: "setQuantity", productId, quantity }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
