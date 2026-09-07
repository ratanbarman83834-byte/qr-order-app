import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { ArrowLeft, ShoppingBag, Phone, User } from "lucide-react";
import { db } from "../firebase/config";
import { formatCurrency } from "../utils/formatCurrency";
import OrderStatusTracker from "../components/OrderStatusTracker";
import { Spinner } from "../components/LoadingSkeleton";

export default function OrderStatusPage() {
  const { shopId, orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shopId || !orderId) {
      setError("Invalid URL. Missing Shop ID or Order ID.");
      setLoading(false);
      return;
    }

    const orderRef = doc(db, "shops", shopId, "orders", orderId);
    
    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError("Order not found.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching order status:", err);
        setError("Failed to load order status. Please refresh.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [shopId, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-4">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8 text-marigold-500" />
          <p className="text-sm font-medium text-ink-700">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper p-4 text-center">
        <div className="rounded-full bg-clay-500/10 p-4 text-clay-600 mb-3">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-xl font-bold text-ink-950 mb-1">Order Not Found</h1>
        <p className="text-sm text-ink-700 mb-6">{error || "We couldn't find your order."}</p>
        <Link
          to={shopId ? `/s/${shopId}` : "/"}
          className="inline-flex items-center gap-2 rounded-xl bg-marigold-500 px-5 py-2.5 text-sm font-bold text-ink-950 shadow-soft"
        >
          <ArrowLeft size={16} /> Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-12">
      <header className="sticky top-0 z-10 border-b border-ink-950/10 bg-paper/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            to={`/s/${shopId}`}
            className="flex items-center gap-2 text-xs font-bold text-ink-700 hover:text-ink-950"
          >
            <ArrowLeft size={16} /> Menu
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-600">
            Live Order Status
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-6 space-y-6">
        <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5 text-center space-y-2">
          <span className="inline-block rounded-full bg-marigold-500/10 px-3 py-1 text-xs font-bold text-marigold-700">
            Order #{order.orderCode || order.id?.slice(-4)}
          </span>
          <h1 className="text-xl font-extrabold text-ink-950">
            {order.status === "completed"
              ? "Order Completed! 🎉"
              : order.status === "preparing"
              ? "Preparing Your Food 🍳"
              : order.status === "cancelled"
              ? "Order Cancelled ❌"
              : "Order Received ⏳"}
          </h1>
          <p className="text-xs text-ink-700">
            {order.tableNumber ? `Table Number: ${order.tableNumber}` : "Dine-in / Takeaway"}
          </p>
        </div>

        <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5">
          <OrderStatusTracker status={order.status} />
        </div>

        <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-700 border-b border-ink-950/10 pb-2">
            Order Details
          </h2>
          
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-ink-900">
                <span>
                  {item.name} <strong className="text-ink-950">× {item.quantity}</strong>
                </span>
                <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-ink-950/10 pt-3 flex justify-between text-base font-extrabold text-ink-950">
            <span>Total Amount</span>
            <span>{formatCurrency(order.totalAmount || order.subtotal || 0)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5 space-y-2 text-xs text-ink-800">
          <div className="flex items-center gap-2">
            <User size={14} className="text-ink-600" />
            <span>Name: <strong>{order.customerName || "Guest"}</strong></span>
          </div>
          {order.customerPhone && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-ink-600" />
              <span>Phone: <strong>{order.customerPhone}</strong></span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}