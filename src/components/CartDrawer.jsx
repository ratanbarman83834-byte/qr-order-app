import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, increment, decrement, removeItem, subtotal } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end">
      <div
        className="absolute inset-0 bg-ink-950/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="animate-rise-in safe-bottom relative flex max-h-[85vh] w-full flex-col rounded-t-xl2 bg-sand">
        <div className="flex items-center justify-between border-b border-ink-950/5 px-5 py-4">
          <h2 className="text-lg font-bold">Your cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="p-1">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-10 text-center text-ink-700">
            Your cart is empty. Add something tasty from the menu.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between border-b border-ink-950/5 py-3 last:border-none"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink-950">
                      {item.name}
                    </p>
                    <p className="text-sm text-ink-700">
                      {formatCurrency(item.price)} × {item.quantity} ={" "}
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full bg-paper px-1 py-1 shadow-soft">
                      <button
                        onClick={() => decrement(item.productId)}
                        className="flex h-7 w-7 items-center justify-center rounded-full active:scale-90"
                        aria-label={`Remove one ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[1ch] text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increment(item.productId)}
                        className="flex h-7 w-7 items-center justify-center rounded-full active:scale-90"
                        aria-label={`Add one more ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="p-1.5 text-clay-500"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-ink-950/5 px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full rounded-xl2 bg-marigold-500 py-3.5 text-base font-bold text-ink-950 shadow-soft active:scale-[0.98]"
              >
                Proceed to checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
