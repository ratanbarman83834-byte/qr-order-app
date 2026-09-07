import { useEffect, useState } from "react";
import { useOwnerShop } from "../../hooks/useOwnerShop";
import { useOrders } from "../../hooks/useOrders";
import { useAuth } from "../../context/AuthContext";
import StatsCards from "../../components/admin/StatsCards";
import OrderCard from "../../components/admin/OrderCard";
import { OrderListSkeleton } from "../../components/LoadingSkeleton";
import { registerOwnerForPush } from "../../firebase/messaging";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { shop, loading: shopLoading, error: shopError } = useOwnerShop();
  const { orders, loading, error } = useOrders(shop?.id);
  const [pushStatus, setPushStatus] = useState(null);

  useEffect(() => {
    if (!user) return;
    registerOwnerForPush(user.uid).then(setPushStatus);
  }, [user]);

  if (shopLoading) return <OrderListSkeleton />;
  if (shopError) {
    return <p className="rounded-xl2 bg-paper p-5 text-ink-700 shadow-soft">{shopError}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{shop.name}</h1>
      </div>

      {pushStatus === "denied" && (
        <PushBanner text="Push notifications are blocked in your browser. You'll still see new orders here in real time — enable notifications in your browser settings to also get mobile alerts." />
      )}
      {pushStatus === "unsupported" && (
        <PushBanner text="This browser doesn't support push notifications. New orders will still appear here instantly — keep this dashboard open, or open it from a supported mobile browser to enable push alerts." />
      )}

      {loading ? (
        <OrderListSkeleton />
      ) : error ? (
        <p className="text-ink-700">{error}</p>
      ) : (
        <>
          <StatsCards orders={orders} />
          <div>
            <h2 className="mb-3 text-lg font-bold">Latest orders</h2>
            <div className="space-y-3">
              {orders.slice(0, 6).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {orders.length === 0 && (
                <p className="text-ink-700">No orders yet today.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PushBanner({ text }) {
  return (
    <div className="rounded-xl2 bg-marigold-50 px-4 py-3 text-sm text-marigold-700">
      {text}
    </div>
  );
}
