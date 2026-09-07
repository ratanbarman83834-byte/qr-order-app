import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOwnerShop } from "../../hooks/useOwnerShop";
import { useOrders } from "../../hooks/useOrders";
import { ORDER_STATUSES } from "../../services/orderService";
import OrderCard from "../../components/admin/OrderCard";
import { OrderListSkeleton } from "../../components/LoadingSkeleton";

export default function AdminOrdersPage() {
  const { shop, loading: shopLoading, error: shopError } = useOwnerShop();
  const { orders, loading, error } = useOrders(shop?.id);
  const [filter, setFilter] = useState("All");
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get("highlight");

  const filtered = useMemo(
    () =>
      filter === "All" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter]
  );

  if (shopLoading) return <OrderListSkeleton />;
  if (shopError) return <p className="text-ink-700">{shopError}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Orders</h1>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {["All", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              filter === s ? "bg-ink-950 text-paper" : "bg-paper shadow-soft"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <OrderListSkeleton />
      ) : error ? (
        <p className="text-ink-700">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-ink-700">No orders in this category.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              highlighted={order.id === highlight}
            />
          ))}
        </div>
      )}
    </div>
  );
}
