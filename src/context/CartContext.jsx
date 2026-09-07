import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

function storageKey(shopId) {
  return `cart:${shopId}`;
}

/**
 * Cart is scoped to a single shopId (from the QR URL /shop/:shopId).
 * We store only display data (name, price, image) client-side for
 * rendering the cart — the actual order total is always recalculated
 * server-side from Firestore prices before the order is saved. See
 * services/orderService.js and functions/index.js.
 */
export function CartProvider({ shopId, children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey(shopId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey(shopId), JSON.stringify(items));
  }, [items, shopId]);

  function addItem(product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ];
    });
  }

  function increment(productId) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }

  function decrement(productId) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items]
  );

  const quantityOf = (productId) =>
    items.find((i) => i.productId === productId)?.quantity ?? 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        increment,
        decrement,
        removeItem,
        clearCart,
        quantityOf,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
