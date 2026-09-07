import { useState } from "react";
import toast from "react-hot-toast";
import { ORDER_STATUSES, updateOrderStatus } from "../../services/orderService";
import { formatCurrency, formatTime } from "../../utils/formatCurrency";

const STATUS_STYLES = {
  New: "bg-marigold-100 text-marigold-700",
  Accepted: "bg-leaf-100 text-leaf-600",
  Preparing: "bg-leaf-100 text-leaf-600",
  Ready: "bg-leaf-500 text-paper",
  Completed: "bg-ink-950/10 text-ink-800",
  Cancelled: "bg-clay-500/10 text-clay-600",
};

export default function OrderCard({ order, highlighted }) {
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't update status. Try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div
      id={`order-${order.id}`}
      className={`rounded-xl2 bg-paper p-4 shadow-soft ${
        highlighted ? "ring-2 ring-marigold-500" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold">{order.orderCode}</p>
          <p className="text-sm text-ink-700">
            {order.customerName}
            {order.tableNumber && ` · Table ${order.tableNumber}`}
            {order.customerPhone && ` · ${order.customerPhone}`}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-3 space-y-0.5 border-t border-ink-950/5 pt-3">
        {order.items.map((item, idx) => (
          <p key={idx} className="text-sm text-ink-800">
            {item.productName} × {item.quantity} — {formatCurrency(item.subtotal)}
          </p>
        ))}
      </div>

      {order.notes && (
        <p className="mt-2 rounded-lg bg-sand px-3 py-2 text-sm italic text-ink-700">
          "{order.notes}"
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-ink-950/5 pt-3">
        <div>
          <p className="font-bold">{formatCurrency(order.total)}</p>
          <p className="text-xs text-ink-700">{formatTime(order.createdAt)}</p>
        </div>
        <select
          value={order.status}
          onChange={handleStatusChange}
          disabled={updating}
          className="rounded-xl bg-sand px-3 py-2 text-sm font-medium outline-none disabled:opacity-60"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
