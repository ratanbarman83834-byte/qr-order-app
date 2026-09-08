import React from "react";
import {
  UserRound,
  Utensils,
  Clock3,
  ChefHat,
  CheckCircle2,
  XCircle,
  Hash,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export function OrderCard({ order, onUpdateStatus }) {
  const items = Array.isArray(order.items) ? order.items : [];

  const calculatedTotal = items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;

    return acc + price * quantity;
  }, 0);

  const displayTotal =
    Number(order.total) > 0
      ? Number(order.total)
      : Number(order.totalAmount) > 0
        ? Number(order.totalAmount)
        : calculatedTotal;

  const status = String(order.status || "new").toLowerCase();

  const statusConfig = {
    new: {
      label: "New",
      className: "bg-blue-50 text-blue-700 border-blue-100",
      icon: Clock3,
    },
    received: {
      label: "Received",
      className: "bg-blue-50 text-blue-700 border-blue-100",
      icon: Clock3,
    },
    accepted: {
      label: "Accepted",
      className: "bg-violet-50 text-violet-700 border-violet-100",
      icon: CheckCircle2,
    },
    preparing: {
      label: "Preparing",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      icon: ChefHat,
    },
    ready: {
      label: "Ready",
      className: "bg-cyan-50 text-cyan-700 border-cyan-100",
      icon: CheckCircle2,
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-rose-50 text-rose-700 border-rose-100",
      icon: XCircle,
    },
  };

  const currentStatus = statusConfig[status] || {
    label: order.status || "Unknown",
    className: "bg-stone-100 text-stone-700 border-stone-200",
    icon: Clock3,
  };

  const StatusIcon = currentStatus.icon;

  return (
    <div
      className="
        flex h-full flex-col
        overflow-hidden
        rounded-2xl
        border border-stone-200/80
        bg-white
        shadow-[0_6px_22px_rgba(28,25,23,0.05)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_12px_30px_rgba(28,25,23,0.09)]
      "
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Hash size={15} className="text-stone-400" />

              <p className="truncate text-base font-bold tracking-wide text-stone-900">
                {order.id
                  ? order.id.slice(-4).toUpperCase()
                  : "----"}
              </p>
            </div>

            {order.customerName && (
              <div className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                <UserRound size={16} className="text-stone-400" />
                <span className="truncate">{order.customerName}</span>
              </div>
            )}

            {order.tableNumber && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-stone-400">
                <Utensils size={14} />
                <span>Table {order.tableNumber}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <span
            className={`
              inline-flex shrink-0 items-center gap-1.5
              rounded-full
              border
              px-2.5 py-1.5
              text-xs font-semibold
              ${currentStatus.className}
            `}
          >
            <StatusIcon size={13} strokeWidth={2.5} />
            {currentStatus.label}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="mx-5 border-y border-stone-100 py-4">
        <div className="mb-3 flex items-center gap-2">
          <Utensils size={14} className="text-stone-400" />

          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
            Items ordered
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-stone-500">
            No items found.
          </p>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const price = Number(item.price) || 0;
              const quantity = Number(item.quantity) || 1;
              const itemTotal = price * quantity;

              return (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-stone-700">
                    {item.name || item.title || "Item"}
                    <span className="ml-1 text-stone-400">
                      × {quantity}
                    </span>
                  </span>

                  <span className="shrink-0 font-medium text-stone-600">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Total */}
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-stone-200 pt-3">
          <span className="text-sm font-semibold text-stone-700">
            Total
          </span>

          <span className="text-lg font-extrabold text-stone-900">
            {formatCurrency(displayTotal)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto p-5 pt-4">
        <p className="mb-2.5 text-xs font-semibold text-stone-500">
          Update order status
        </p>

        <div className="grid grid-cols-3 gap-2">
          {/* Preparing */}
          <button
            onClick={() => onUpdateStatus(order.id, "preparing")}
            disabled={status === "preparing"}
            className="
              flex min-h-10 items-center justify-center gap-1
              rounded-xl
              border border-amber-200
              bg-amber-50
              px-2
              py-2
              text-xs
              font-semibold
              text-amber-700
              transition
              hover:bg-amber-100
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChefHat size={14} />
            <span className="hidden sm:inline">Preparing</span>
            <span className="sm:hidden">Prep</span>
          </button>

          {/* Completed */}
          <button
            onClick={() => onUpdateStatus(order.id, "completed")}
            disabled={status === "completed"}
            className="
              flex min-h-10 items-center justify-center gap-1
              rounded-xl
              border border-emerald-200
              bg-emerald-600
              px-2
              py-2
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-emerald-700
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <CheckCircle2 size={14} />
            <span className="hidden sm:inline">Completed</span>
            <span className="sm:hidden">Done</span>
          </button>

          {/* Cancel */}
          <button
            onClick={() => onUpdateStatus(order.id, "cancelled")}
            disabled={status === "cancelled"}
            className="
              flex min-h-10 items-center justify-center gap-1
              rounded-xl
              border border-rose-200
              bg-rose-50
              px-2
              py-2
              text-xs
              font-semibold
              text-rose-600
              transition
              hover:bg-rose-100
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <XCircle size={14} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}