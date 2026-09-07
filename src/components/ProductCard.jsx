import { Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function ProductCard({ product }) {
  const { addItem, increment, decrement, quantityOf } = useCart();
  const quantity = quantityOf(product.id);
  const isAvailable = product.available !== false;

  return (
    <div
      className={`flex gap-3 rounded-xl2 bg-paper p-3 shadow-soft transition-opacity ${
        isAvailable ? "" : "opacity-60"
      }`}
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate font-semibold text-ink-950">{product.name}</h3>
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-ink-700">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-ink-900">
            {formatCurrency(product.price)}
          </span>

          {!isAvailable ? (
            <span className="rounded-full bg-ink-950/5 px-3 py-1 text-xs font-medium text-ink-700">
              Unavailable
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={() => addItem(product)}
              className="rounded-full bg-marigold-500 px-4 py-1.5 text-sm font-semibold text-ink-950 shadow-soft transition active:scale-95"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-full bg-marigold-500 px-1 py-1 shadow-soft">
              <button
                onClick={() => decrement(product.id)}
                aria-label={`Remove one ${product.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-paper text-ink-950 active:scale-90"
              >
                <Minus size={15} />
              </button>
              <span className="min-w-[1ch] text-sm font-bold text-ink-950">
                {quantity}
              </span>
              <button
                onClick={() => increment(product.id)}
                aria-label={`Add one more ${product.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-paper text-ink-950 active:scale-90"
              >
                <Plus size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
