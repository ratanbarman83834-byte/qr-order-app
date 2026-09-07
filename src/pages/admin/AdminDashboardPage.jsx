
import React from "react";
import { useOwnerShop } from "../../hooks/useOwnerShop";
import { useOrders } from "../../hooks/useOrders";
import StatsCards from "../../components/admin/StatsCards";
import { OrderCard } from "../../components/admin/OrderCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";

export default function AdminDashboardPage() {
  // Get owner's shop
  const {
    shop,
    loading: shopLoading,
    error: shopError,
  } = useOwnerShop();

  // Load orders only after shop ID is available
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

  // Show shop error
  if (shopError) {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-5 text-rose-700">
        {shopError}
      </div>
    );
  }

  // Show orders error
  if (ordersError) {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-5 text-rose-700">
        {ordersError}
      </div>
    );
  }

  // No shop found
  if (!shop?.id) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-amber-700">
        No shop found for this account.
      </div>
    );
  }

  // ==============================
  // DASHBOARD STATISTICS
  // ==============================

  // Total number of orders
  const totalOrders = orders.length;

  // Total sales
  // Cancelled orders are excluded
  const totalSales = orders.reduce((total, order) => {
    if (order.status === "Cancelled") {
      return total;
    }

    // First try totalAmount
    let amount = Number(order.totalAmount) || 0;

    // If totalAmount is missing, calculate from items
    if (amount === 0 && Array.isArray(order.items)) {
      amount = order.items.reduce((itemTotal, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        return itemTotal + price * quantity;
      }, 0);
    }

    return total + amount;
  }, 0);

  // Pending / active orders
  const pendingOrders = orders.filter((order) =>
    [
      "New",
      "Accepted",
      "Preparing",
      "Ready",
    ].includes(order.status)
  ).length;

  // Completed orders
  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  // Latest 6 orders
  const latestOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">

      {/* ==============================
          STATS CARDS
      ============================== */}

      <StatsCards
        totalOrders={totalOrders}
        totalSales={totalSales}
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
      />

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

