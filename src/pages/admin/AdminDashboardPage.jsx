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

  // Loading
  if (shopLoading || ordersLoading) {
    return <LoadingSkeleton count={4} />;
  }

  // Shop error
  if (shopError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {shopError}
      </div>
    );
  }

  // Orders error
  if (ordersError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {ordersError}
      </div>
    );
  }

  // No shop
  if (!shop?.id) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-700">
        No shop found for this account.
      </div>
    );
  }

  // Latest 6 orders
  const latestOrders = orders.slice(0, 6);

  return (
    <div className="space-y-7">
      {/* Dashboard heading */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-stone-500">
          Keep track of your orders and sales.
        </p>
      </div>

      {/* Stats */}
      <StatsCards orders={orders} />

      {/* Latest Orders */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
              Latest orders
            </h2>

            <p className="mt-1 text-xs text-stone-400">
              Your most recent customer orders
            </p>
          </div>

          {orders.length > 0 && (
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">
              {orders.length} total
            </span>
          )}
        </div>

        {latestOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-stone-700">
              No orders placed yet
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Orders will appear here when customers place them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latestOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}