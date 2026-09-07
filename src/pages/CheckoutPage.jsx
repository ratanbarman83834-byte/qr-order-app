import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";
import { Spinner } from "../components/LoadingSkeleton";

export default function CheckoutPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty. Go back and add something first.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOrder({
        shopId,
        customerName: name,
        customerPhone: phone,
        tableNumber,
        notes,
        items,
      });
      clearCart();
      navigate(`/shop/${shopId}/order/${result.orderId}`, {
        state: { justPlaced: true, orderCode: result.orderCode },
        replace: true,
      });
    } catch (err) {
      console.error(err);
      setError(
        err?.message?.replace("Firebase: ", "").replace(/\(.*\)\.?$/, "").trim() ||
          "Something went wrong placing your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-bold">Your cart is empty</p>
        <button
          onClick={() => navigate(`/shop/${shopId}`)}
          className="rounded-xl2 bg-ink-950 px-5 py-2.5 font-semibold text-paper"
        >
          Browse menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="flex items-center gap-3 px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="rounded-full bg-paper p-2 shadow-soft"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </header>

      <section className="mx-4 mt-5 rounded-xl2 bg-paper p-4 shadow-soft">
        <h2 className="mb-2 font-semibold text-ink-950">Order summary</h2>
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between py-1 text-sm text-ink-800"
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-ink-950/10 pt-2 font-bold">
          <span>Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </section>

      <form onSubmit={handlePlaceOrder} className="mx-4 mt-5 space-y-4">
        <Field label="Your name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Mobile number (optional)">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 98765 43210"
            type="tel"
            className={inputClass}
          />
        </Field>
        <Field label="Table / order number (optional)">
          <input
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="e.g. 5"
            className={inputClass}
          />
        </Field>
        <Field label="Special instructions (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Less spicy, no onions"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Field>

        {error && (
          <p className="rounded-xl2 bg-clay-500/10 px-4 py-3 text-sm font-medium text-clay-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-marigold-500 py-4 text-base font-bold text-ink-950 shadow-soft transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitting && <Spinner />}
          {submitting ? "Placing order…" : `Place order · ${formatCurrency(subtotal)}`}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl2 bg-paper px-4 py-3.5 text-[0.95rem] shadow-soft outline-none placeholder:text-ink-700/50";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
        {required && <span className="text-clay-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
