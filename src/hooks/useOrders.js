import { useEffect, useState, useMemo } from "react";
import { subscribeToShopOrders } from "../services/orderService";

// Date ko check karne ke liye safe helper function
function isToday(createdAt) {
  if (!createdAt) return true;
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

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

  // 1. Sirf aaj ke orders filter karein
  const todayOrders = useMemo(() => {
    return orders.filter((order) => isToday(order.createdAt));
  }, [orders]);

  // 2. Aaj ke Active Orders (Pending / Preparing / Ready)
  const activeOrders = useMemo(() => {
    return todayOrders.filter((o) =>
      ["New", "Accepted", "Preparing", "Ready"].includes(o.status)
    );
  }, [todayOrders]);

  // 3. Aaj ke Completed Orders
  const completedOrders = useMemo(() => {
    return todayOrders.filter((o) =>
      ["Completed", "Cancelled"].includes(o.status)
    );
  }, [todayOrders]);

  return { orders, todayOrders, activeOrders, completedOrders, loading, error };
}