
import React from "react";
import { useOrders } from "../../hooks/useOrders";
import StatsCards from "../../components/admin/StatsCards";
import { OrderCard } from "../../components/admin/OrderCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";

export default function AdminDashboardPage() {
  const {
    orders,
    loading,
    updateOrderStatus,
  } = useOrders();

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  // Total orders
  const totalOrders = orders.length;

  // Calculate total sales
  // Cancelled orders are not included
  const totalSales = orders.reduce((sum, order) => {
    if (order.status === "Cancelled") {
      return sum;
    }

    let amount = Number(order.totalAmount) || 0;

    // Fallback: calculate total from items
    if (
      amount === 0 &&
      Array.isArray(order.items)
    ) {
      amount = order.items.reduce(
        (itemSum, item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 1;

          return itemSum + price * quantity;
        },
        0
      );
    }

    return sum + amount;
  }, 0);

  // Active / pending orders
  const pendingOrders = orders.filter(
    (order) =>
      order.status === "New" ||
      order.status === "Accepted" ||
      order.status === "Preparing" ||
      order.status === "Ready"
  ).length;

  // Completed orders
  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  // Show latest 6 orders
  const latestOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">

      {/* Statistics */}
      <StatsCards
        totalOrders={totalOrders}
        totalSales={totalSales}
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
      />

      {/* Latest Orders */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-stone-900">
          Latest orders
        </h2>

        {latestOrders.length === 0 ? (
          <p className="text-stone-500">
            No orders placed yet.
          </p>
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

