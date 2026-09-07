import { useEffect, useState } from "react";
import { subscribeToShopOrders } from "../services/orderService";

export function useOrders(shopId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    const unsubscribe = subscribeToShopOrders(
      shopId,
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Couldn't load orders. Check your connection and try again.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [shopId]);

  return { orders, loading, error };
}
