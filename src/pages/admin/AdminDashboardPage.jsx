
import React from 'react';
import { useOrders } from '../../hooks/useOrders';
import StatsCards from '../../components/admin/StatsCards';
import { OrderCard } from '../../components/admin/OrderCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

export default function AdminDashboardPage() {
  const { orders, loading, updateOrderStatus } = useOrders();

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  // Calculate stats dynamically from all orders
  const totalOrders = orders.length;

  const totalSales = orders.reduce((sum, order) => {
    if (order.status === 'cancelled') return sum;

    // Use order.totalAmount if available
    let amount = Number(order.totalAmount) || 0;

    // If totalAmount is not available, calculate from items
    if (amount === 0 && order.items && Array.isArray(order.items)) {
      amount = order.items.reduce((itemSum, item) => {
        return (
          itemSum +
          (Number(item.price) || 0) *
            (Number(item.quantity) || 1)
        );
      }, 0);
    }

    return sum + amount;
  }, 0);

  const pendingOrders = orders.filter(
    (order) =>
      order.status === 'new' ||
      order.status === 'received' ||
      order.status === 'preparing'
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === 'completed'
  ).length;

  // Show latest 6 orders
  const latestOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      <StatsCards
        totalOrders={totalOrders}
        totalSales={totalSales}
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
      />

      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          Latest orders
        </h2>

        {latestOrders.length === 0 ? (
          <p className="text-stone-500">
            No orders placed yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

