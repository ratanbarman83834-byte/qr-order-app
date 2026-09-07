import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { 
  Clock, 
  Utensils, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  User, 
  MessageSquare,
  Sparkles 
} from "lucide-react";
import { db } from "../../firebase/config";
import { formatCurrency } from "../../utils/formatCurrency";
import { Spinner } from "../LoadingSkeleton";

export default function OrderCard({ order = {}, shopId }) {
  const [updating, setUpdating] = useState(false);

  const currentShopId = shopId || order?.shopId;

  async function handleStatusChange(newStatus) {
    if (!currentShopId) {
      alert("Shop ID missing. Cannot update status.");
      return;
    }
    if (!order?.id) {
      alert("Order ID missing.");
      return;
    }

    setUpdating(true);
    try {
      const orderRef = doc(db, "shops", currentShopId, "orders", order.id);
      
      // updateDoc ki jagah setDoc with merge: true use kiya hai
      await setDoc(
        orderRef, 
        {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        }, 
        { merge: true }
      );

      console.log(`Order status updated to: ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  const statusConfig = {
    received: {
      label: "New / Received",
      badgeClass: "bg-blue-500/10 text-blue-600",
      icon: <Clock size={16} />,
    },
    preparing: {
      label: "Preparing",
      badgeClass: "bg-marigold-500/10 text-marigold-700",
      icon: <Utensils size={16} />,
    },
    completed: {
      label: "Completed",
      badgeClass: "bg-emerald-500/10 text-emerald-600",
      icon: <CheckCircle2 size={16} />,
    },
    cancelled: {
      label: "Cancelled",
      badgeClass: "bg-clay-500/10 text-clay-600",
      icon: <XCircle size={16} />,
    },
  };

  const currentStatus = statusConfig[order?.status] || statusConfig.received;

  return (
    <div className="rounded-xl2 bg-paper p-5 shadow-soft border border-ink-950/5 space-y-4">
      <div className="flex items-center justify-between border-b border-ink-950/10 pb-3">
        <div>
          <span className="text-xs font-semibold uppercase text-ink-700">
            Order #{order?.orderCode || order?.id?.slice(-4) || "N/A"}
          </span>
          {order?.tableNumber && (
            <span className="ml-2 inline-block rounded-md bg-ink-950/5 px-2 py-0.5 text-xs font-bold text-ink-900">
              Table {order.tableNumber}
            </span>
          )}
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${currentStatus.badgeClass}`}
        >
          {currentStatus.icon}
          <span>{currentStatus.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5 text-sm text-ink-800">
        <div className="flex items-center gap-2 font-medium text-ink-950">
          <User size={15} className="text-ink-700" />
          <span>{order?.customerName || "Guest"}</span>
        </div>

        {order?.customerPhone && (
          <div className="flex items-center gap-2 text-xs text-ink-700">
            <Phone size={14} />
            <a
              href={`tel:${order.customerPhone}`}
              className="underline hover:text-ink-950"
            >
              {order.customerPhone}
            </a>
          </div>
        )}

        {order?.notes && (
          <div className="mt-1 flex items-start gap-2 rounded-lg bg-marigold-50 p-2 text-xs text-marigold-800">
            <MessageSquare size={14} className="mt-0.5 shrink-0" />
            <span>Note: {order.notes}</span>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-ink-950/5 p-3 space-y-1.5">
        <p className="text-xs font-bold uppercase text-ink-700 mb-1">
          Items Ordered:
        </p>
        {order?.items?.map((item, idx) => (
          <div
            key={item?.id || idx}
            className="flex justify-between text-xs font-medium text-ink-900"
          >
            <span>
              {item?.name} <strong className="text-ink-950">× {item?.quantity || 1}</strong>
            </span>
            <span>{formatCurrency((item?.price || 0) * (item?.quantity || 1))}</span>
          </div>
        ))}

        <div className="mt-2 flex justify-between border-t border-ink-950/10 pt-2 text-sm font-extrabold text-ink-950">
          <span>Total:</span>
          <span>{formatCurrency(order?.totalAmount || order?.subtotal || 0)}</span>
        </div>
      </div>

      <div className="pt-2">
        <p className="mb-2 text-xs font-semibold text-ink-700">Update Order Status:</p>
        
        <div className="flex flex-wrap gap-2">
          {order?.status !== "preparing" && order?.status !== "completed" && (
            <button
              onClick={() => handleStatusChange("preparing")}
              disabled={updating}
              className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 rounded-xl bg-marigold-500 py-2.5 px-3 text-xs font-bold text-ink-950 shadow-soft transition active:scale-[0.98] disabled:opacity-50"
            >
              {updating ? <Spinner /> : <Utensils size={14} />}
              Mark Preparing
            </button>
          )}

          {order?.status !== "completed" && (
            <button
              onClick={() => handleStatusChange("completed")}
              disabled={updating}
              className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-bold text-paper shadow-soft transition active:scale-[0.98] disabled:opacity-50"
            >
              {updating ? <Spinner /> : <Sparkles size={14} />}
              Mark Completed
            </button>
          )}

          {order?.status !== "cancelled" && order?.status !== "completed" && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to cancel this order?")) {
                  handleStatusChange("cancelled");
                }
              }}
              disabled={updating}
              className="rounded-xl bg-clay-500/10 py-2.5 px-3 text-xs font-bold text-clay-600 hover:bg-clay-500/20 transition active:scale-[0.98] disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}