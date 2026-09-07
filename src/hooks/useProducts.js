import { useEffect, useState } from "react";
import { subscribeToProducts } from "../services/productService";

export function useProducts(shopId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    const unsubscribe = subscribeToProducts(
      shopId,
      (data) => {
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("We couldn't load the menu. Check your connection and try again.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [shopId]);

  return { products, loading, error };
}
