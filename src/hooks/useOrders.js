
import { useEffect, useState, useMemo } from "react";

import {
  subscribeToShopOrders,
  updateOrderStatus as updateOrderStatusService,
} from "../services/orderService";

// Check whether an order was created today
function isToday(createdAt) {
  if (!createdAt) return true;

  let date;

  try {
    // Firebase Timestamp
    if (createdAt?.toDate) {
      date = createdAt.toDate();
    } else {
      date = new Date(createdAt);
    }

    // Invalid date safety check
    if (Number.isNaN(date.getTime())) {
      return false;
    }
  } catch (error) {
    console.error("Date parsing error:", error);
    return false;
  }

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

  // Subscribe to live orders
  useEffect(() => {
    if (!shopId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToShopOrders(
      shopId,
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error("Orders subscription error:", err);

        setError(
          "Couldn't load orders. Check your connection and try again."
        );

        setLoading(false);
      }
    );

    return unsubscribe;
  }, [shopId]);

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      if (!orderId) {
        throw new Error("Order ID is missing.");
      }

      if (!status) {
        throw new Error("Order status is missing.");
      }

      await updateOrderStatusService(orderId, status);

      return true;
    } catch (err) {
      console.error("Failed to update order status:", err);

      setError(
        err?.message ||
          "Couldn't update order status. Please try again."
      );

      return false;
    }
  };

  // Today's orders
  const todayOrders = useMemo(() => {
    return orders.filter((order) =>
      isToday(order.createdAt)
    );
  }, [orders]);

  // Today's active orders
  const activeOrders = useMemo(() => {
    return todayOrders.filter((order) =>
      ["New", "Accepted", "Preparing", "Ready"].includes(
        order.status
      )
    );
  }, [todayOrders]);

  // Today's completed/cancelled orders
  const completedOrders = useMemo(() => {
    return todayOrders.filter((order) =>
      ["Completed", "Cancelled"].includes(order.status)
    );
  }, [todayOrders]);

  return {
    orders,
    todayOrders,
    activeOrders,
    completedOrders,
    loading,
    error,
    updateOrderStatus,
  };
}

