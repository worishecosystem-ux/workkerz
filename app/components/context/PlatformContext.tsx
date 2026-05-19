"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

export type Platform = "workkerz" | "eaurix";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
  icon?: string;
  color: string;
  unit: string;
}

interface PlatformContextType {
  platform: Platform;
  setPlatform: (p: Platform) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // ✅ FIX: NO localStorage here
  const [platform, setPlatformState] = useState<Platform>("workkerz");

  // ✅ MAIN FIX: Sync with URL
  useEffect(() => {
    if (pathname.startsWith("/eaurix")) {
      setPlatformState("eaurix");
    } else {
      setPlatformState("workkerz");
    }
  }, [pathname]);

  const setPlatform = (p: Platform) => {
    setPlatformState(p);
  };

  // CART (same as before)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("eaurix-cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("eaurix-cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === item.productId);
      if (existing) {
        return prev.map((c) =>
          c.productId === item.productId
            ? { ...c, qty: c.qty + item.qty }
            : c
        );
      }
      return [
        ...prev,
        { ...item, id: `cart-${Date.now()}-${Math.random()}` },
      ];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((c) => c.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) removeFromCart(id);
    else
      setCart((prev) =>
        prev.map((c) => (c.id === id ? { ...c, qty } : c))
      );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = parseFloat(
    cart.reduce((s, c) => s + c.price * c.qty, 0).toFixed(2)
  );

  return (
    <PlatformContext.Provider
      value={{
        platform,
        setPlatform,
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}