import { ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function CartBar({ onOpen }) {
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4">
      <button
        onClick={onOpen}
        className="animate-rise-in flex w-full items-center justify-between rounded-xl2 bg-ink-950 px-5 py-4 text-paper shadow-soft"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag size={19} />
          Cart · {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        <span className="font-bold text-marigold-300">
          {formatCurrency(subtotal)}
        </span>
      </button>
    </div>
  );
}
