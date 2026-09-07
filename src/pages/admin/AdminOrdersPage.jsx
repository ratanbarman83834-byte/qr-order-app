
import { useState } from "react";
import { useOwnerShop } from "../../hooks/useOwnerShop";
import { useOrders } from "../../hooks/useOrders";
import { OrderCard } from "../../components/admin/OrderCard";
import { ProductListSkeleton } from "../../components/LoadingSkeleton";

export default function AdminOrdersPage() {
  const { shop } = useOwnerShop();

  const {
    activeOrders,
    completedOrders,
    todayOrders,
    loading,
    error,
    updateOrderStatus,
  } = useOrders(shop?.id);

  const [tab, setTab] = useState("active");

  if (loading) {
    return <ProductListSkeleton />;
  }

  if (error) {
    return <p className="text-ink-700">{error}</p>;
  }

  // Select orders according to active tab
  const displayedOrders =
    tab === "active"
      ? activeOrders
      : tab === "completed"
      ? completedOrders
      : todayOrders;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold">
          Orders
        </h1>

        {/* Filter Tabs */}
        <div className="flex w-fit rounded-xl bg-sand p-1 text-xs font-bold">
          <button
            onClick={() => setTab("active")}
            className={`rounded-lg px-3.5 py-2 transition ${
              tab === "active"
                ? "bg-ink-950 text-paper shadow-soft"
                : "text-ink-700 hover:text-ink-950"
            }`}
          >
            Active ({activeOrders.length})
          </button>

          <button
            onClick={() => setTab("completed")}
            className={`rounded-lg px-3.5 py-2 transition ${
              tab === "completed"
                ? "bg-ink-950 text-paper shadow-soft"
                : "text-ink-700 hover:text-ink-950"
            }`}
          >
            Completed ({completedOrders.length})
          </button>

          <button
            onClick={() => setTab("all")}
            className={`rounded-lg px-3.5 py-2 transition ${
              tab === "all"
                ? "bg-ink-950 text-paper shadow-soft"
                : "text-ink-700 hover:text-ink-950"
            }`}
          >
            All Today ({todayOrders.length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="rounded-xl2 bg-paper p-8 text-center text-sm font-medium text-ink-700 shadow-soft">
          No {tab} orders for today.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={updateOrderStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
