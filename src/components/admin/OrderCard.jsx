import { ORDER_STATUSES, updateOrderStatus } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";

function formatOrderDate(createdAt) {
  if (!createdAt) return "Just now";
  // Firestore timestamp to JS Date conversion
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  if (isNaN(date.getTime())) return "Just now";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function OrderCard({ order }) {
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateOrderStatus(order.id, newStatus);
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  return (
    <div className="rounded-xl2 bg-paper p-4 shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-ink-950">
            {order.customerName || "Customer"}{" "}
            {order.customerPhone && `· ${order.customerPhone}`}
          </h3>
          {order.tableNumber && (
            <p className="text-xs text-ink-700">Table: {order.tableNumber}</p>
          )}
        </div>
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink-800">
          {order.status}
        </span>
      </div>

      {/* Items list with fallback for missing properties */}
      <div className="border-t border-b border-sand py-2 space-y-1">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span>
              {item.name || "Item"} × {item.quantity}
            </span>
            <span>
              {item.price ? formatCurrency(item.price * item.quantity) : ""}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-lg font-extrabold">
            {formatCurrency(order.total || 0)}
          </p>
          <p className="text-xs text-ink-700">
            {formatOrderDate(order.createdAt)}
          </p>
        </div>

        <select
          value={order.status}
          onChange={handleStatusChange}
          className="rounded-xl bg-sand px-3 py-1.5 text-sm font-semibold outline-none"
        >
          {ORDER_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}