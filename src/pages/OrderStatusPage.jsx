import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { subscribeToOrder } from "../services/orderService";
import { formatCurrency, formatTime } from "../utils/formatCurrency";
import OrderStatusTracker from "../components/OrderStatusTracker";
import { Spinner } from "../components/LoadingSkeleton";

export default function OrderStatusPage() {
  const { shopId, orderId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToOrder(
      orderId,
      (data) => {
        if (!data) {
          setError("not-found");
        } else {
          setOrder(data);
        }
        setLoading(false);
      },
      () => {
        setError("network");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-ink-700" />
      </div>
    );
  }

  if (error === "not-found") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-lg font-bold">Order not found</p>
        <p className="text-ink-700">
          This order link looks incorrect or has expired.
        </p>
      </div>
    );
  }

  if (error === "network" || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-bold">Couldn't load your order</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl2 bg-ink-950 px-5 py-2.5 font-semibold text-paper"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="bg-ink-950 px-5 pb-8 pt-10 text-center text-paper">
        {state?.justPlaced && (
          <p className="mb-1 text-2xl">🎉</p>
        )}
        <p className="text-sm font-medium text-paper/70">
          {state?.justPlaced ? "Order placed successfully" : "Order status"}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold">{order.orderCode}</h1>
      </header>

      <section className="mx-4 -mt-4 rounded-xl2 bg-paper p-5 shadow-soft">
        <OrderStatusTracker status={order.status} />
      </section>

      <section className="mx-4 mt-4 rounded-xl2 bg-paper p-5 shadow-soft">
        <h2 className="mb-2 font-semibold">Your order</h2>
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between py-1 text-sm text-ink-800"
          >
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-ink-950/10 pt-2 font-bold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <p className="mt-3 text-xs text-ink-700">
          Placed at {formatTime(order.createdAt)}
          {order.tableNumber && ` · Table ${order.tableNumber}`}
        </p>
      </section>

      <button
        onClick={() => navigate(`/shop/${shopId}`)}
        className="mx-4 mt-5 block w-full rounded-xl2 bg-ink-950 py-3.5 text-center font-semibold text-paper"
      >
        Back to menu
      </button>
    </div>
  );
}
