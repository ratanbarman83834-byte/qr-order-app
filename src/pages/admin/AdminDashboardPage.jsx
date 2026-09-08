
import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOwnerShop } from "../../hooks/useOwnerShop";
import { useOrders } from "../../hooks/useOrders";
import StatsCards from "../../components/admin/StatsCards";
import { OrderCard } from "../../components/admin/OrderCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { registerOwnerForPush } from "../../firebase/messaging";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  // Register the owner for push notifications
  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;

    async function setupPushNotifications() {
      const result = await registerOwnerForPush(user.uid);

      if (!cancelled) {
        console.log("🔔 Push registration result:", result);
      }
    }

    setupPushNotifications();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Get owner's shop
  const {
    shop,
    loading: shopLoading,
    error: shopError,
  } = useOwnerShop();

  // Load orders for this shop
  const {
    orders = [],
    loading: ordersLoading,
    error: ordersError,
    updateOrderStatus,
  } = useOrders(shop?.id);

  // Wait for shop and orders
  if (shopLoading || ordersLoading) {
    return <LoadingSkeleton count={4} />;
  }

  // Shop error
  if (shopError) {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-5 text-rose-700">
        {shopError}
      </div>
    );
  }

  // Orders error
  if (ordersError) {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-5 text-rose-700">
        {ordersError}
      </div>
    );
  }

  // No shop
  if (!shop?.id) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-amber-700">
        No shop found for this account.
      </div>
    );
  }

  // ==============================
  // NORMALIZE STATUS
  // ==============================

  const getStatus = (status) => {
    if (!status) return "New";

    const value = String(status).toLowerCase();

    switch (value) {
      case "new":
      case "received":
        return "New";

      case "accepted":
        return "Accepted";

      case "preparing":
        return "Preparing";

      case "ready":
        return "Ready";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  // ==============================
  // DASHBOARD STATISTICS
  // ==============================

  const totalOrders = orders.length;

  // Total sales
  // Cancelled orders are excluded
  const totalSales = orders.reduce((sum, order) => {
    const status = getStatus(order.status);

    if (status === "Cancelled") {
      return sum;
    }

    // Your Firestore currently uses "total"
    let amount = Number(order.total) || 0;

    // Compatibility with totalAmount
    if (amount === 0) {
      amount = Number(order.totalAmount) || 0;
    }

    // Final fallback: calculate from items
    if (amount === 0 && Array.isArray(order.items)) {
      amount = order.items.reduce((itemTotal, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        return itemTotal + price * quantity;
      }, 0);
    }

    return sum + amount;
  }, 0);

  // Pending / active orders
  const pendingOrders = orders.filter((order) => {
    const status = getStatus(order.status);

    return [
      "New",
      "Accepted",
      "Preparing",
      "Ready",
    ].includes(status);
  }).length;

  // Completed orders
  const completedOrders = orders.filter((order) => {
    return getStatus(order.status) === "Completed";
  }).length;

  // Latest 6 orders
  const latestOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">

      {/* ==============================
          STATS CARDS
      ============================== */}

      <StatsCards orders={orders} />

      {/* ==============================
          LATEST ORDERS
      ============================== */}

      <div>
        <h2 className="mb-4 text-xl font-bold text-stone-900">
          Latest orders
        </h2>

        {latestOrders.length === 0 ? (
          <div className="rounded-xl bg-white border border-stone-200 p-8 text-center">
            <p className="text-stone-500">
              No orders placed yet.
            </p>

            <p className="mt-2 text-xs text-stone-400">
              Shop ID: {shop.id}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {latestOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

