
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  Clock,
  Utensils,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";
import { Spinner } from "../components/LoadingSkeleton";

export default function OrderStatusPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setOrder(null);
      return;
    }

    const cleanOrderId = orderId.replace("#", "").trim();

    // Orders are stored in the ROOT "orders" collection
    const orderRef = doc(db, "orders", cleanOrderId);

    setLoading(true);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setOrder({
            id: snapshot.id,
            ...snapshot.data(),
          });
        } else {
          setOrder(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("❌ Order status read error:", error);
        setOrder(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 bg-paper">
        <div className="rounded-full bg-clay-500/10 p-4 text-clay-600">
          <ShoppingBag size={32} />
        </div>

        <h2 className="text-xl font-bold text-ink-950">
          Order Not Found
        </h2>

        <p className="text-xs text-ink-700">
          This order could not be found.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl bg-marigold-500 px-5 py-2.5 text-xs font-bold text-ink-950 shadow-soft"
        >
          <ArrowLeft size={16} />
          Back to Menu
        </button>
      </div>
    );
  }

  const statusConfig = {
    new: {
      label: "Order Received",
      badgeClass: "bg-blue-500/10 text-blue-600",
      icon: <Clock size={20} />,
    },

    received: {
      label: "Order Received",
      badgeClass: "bg-blue-500/10 text-blue-600",
      icon: <Clock size={20} />,
    },

    accepted: {
      label: "Order Accepted",
      badgeClass: "bg-blue-500/10 text-blue-600",
      icon: <CheckCircle2 size={20} />,
    },

    preparing: {
      label: "Preparing Your Order",
      badgeClass: "bg-marigold-500/10 text-marigold-700",
      icon: <Utensils size={20} />,
    },

    ready: {
      label: "Order Ready",
      badgeClass: "bg-emerald-500/10 text-emerald-600",
      icon: <CheckCircle2 size={20} />,
    },

    completed: {
      label: "Order Completed",
      badgeClass: "bg-emerald-500/10 text-emerald-600",
      icon: <CheckCircle2 size={20} />,
    },

    cancelled: {
      label: "Order Cancelled",
      badgeClass: "bg-clay-500/10 text-clay-600",
      icon: <XCircle size={20} />,
    },
  };

  const normalizedStatus = String(order.status || "new").toLowerCase();

  const currentStatus =
    statusConfig[normalizedStatus] || statusConfig.new;

  const orderTotal =
    Number(order.total) ||
    Number(order.totalAmount) ||
    Number(order.subtotal) ||
    (order.items || []).reduce((sum, item) => {
      const price = Number(item?.price) || 0;
      const quantity = Number(item?.quantity) || 1;

      return sum + price * quantity;
    }, 0);

  return (
    <div className="min-h-screen bg-paper p-4 md:p-6 space-y-4 max-w-md mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-ink-700 mb-2"
      >
        <ArrowLeft size={16} />
        Back to Menu
      </button>

      <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-950/10 pb-3">
          <div>
            <h1 className="text-base font-extrabold text-ink-950">
              Order #{order?.orderCode || order?.id?.slice(-4)}
            </h1>

            {order?.tableNumber && (
              <span className="text-xs font-semibold text-ink-700">
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

        {/* Items */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-ink-700">
            Items Ordered:
          </p>

          {order?.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between text-xs font-medium text-ink-900"
            >
              <span>
                {item?.name} × {item?.quantity || 1}
              </span>

              <span>
                {formatCurrency(
                  (Number(item?.price) || 0) *
                    (Number(item?.quantity) || 1)
                )}
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between border-t border-ink-950/10 pt-2 text-sm font-black text-ink-950">
            <span>Total:</span>

            <span>{formatCurrency(orderTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

