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

const PlatformContext =
  createContext<PlatformContextType | null>(null);

export function PlatformProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  /* =========================================================
     PLATFORM
  ========================================================= */

  const [platform, setPlatformState] =
    useState<Platform>("workkerz");

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

  /* =========================================================
     CART
  ========================================================= */

  const [cart, setCart] = useState<CartItem[]>([]);

  const [cartHydrated, setCartHydrated] =
    useState(false);

  /* =========================================================
     LOAD CART FROM LOCAL STORAGE
  ========================================================= */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem("eaurix-cart");

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load E-Aurix cart:",
        error,
      );
    } finally {
      setCartHydrated(true);
    }
  }, []);

  /* =========================================================
     SAVE CART
  ========================================================= */

  useEffect(() => {
    if (!cartHydrated) return;

    try {
      localStorage.setItem(
        "eaurix-cart",
        JSON.stringify(cart),
      );
    } catch (error) {
      console.error(
        "Failed to save E-Aurix cart:",
        error,
      );
    }
  }, [cart, cartHydrated]);

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = (
    item: Omit<CartItem, "id">,
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (cartItem) =>
          cartItem.productId ===
          item.productId,
      );

      /* EXISTING PRODUCT */
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.productId ===
          item.productId
            ? {
                ...cartItem,
                qty:
                  cartItem.qty + item.qty,
              }
            : cartItem,
        );
      }

      /* NEW PRODUCT */
      return [
        ...prev,
        {
          ...item,
          id: `cart-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
        },
      ];
    });
  };

  /* =========================================================
     REMOVE FROM CART
  ========================================================= */

  const removeFromCart = (id: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => item.id !== id,
      ),
    );
  };

  /* =========================================================
     UPDATE QUANTITY
  ========================================================= */

  const updateQty = (
    id: string,
    qty: number,
  ) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty,
            }
          : item,
      ),
    );
  };

  /* =========================================================
     CLEAR CART
  ========================================================= */

  const clearCart = () => {
    setCart([]);
  };

  /* =========================================================
     CART COUNT
  ========================================================= */

  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.qty || 0),
    0,
  );

  /* =========================================================
     CART TOTAL
  ========================================================= */

  const cartTotal = Number(
    cart
      .reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.qty || 0),
        0,
      )
      .toFixed(2),
  );

  /* =========================================================
     PROVIDER
  ========================================================= */

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

/* =========================================================
   HOOK
========================================================= */

export function usePlatform() {
  const ctx =
    useContext(PlatformContext);

  if (!ctx) {
    throw new Error(
      "usePlatform must be used within PlatformProvider",
    );
  }

  return ctx;
}