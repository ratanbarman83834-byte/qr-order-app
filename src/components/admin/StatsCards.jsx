import {
  ClipboardList,
  IndianRupee,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function StatsCards({ orders = [] }) {
  const getStatus = (status) => {
    if (!status) return "New";

    const value = String(status).toLowerCase();

    switch (value) {
      case "new":
      case "received":
        return "New";

      case "accepted":
        return "Accepted";

      case "preparing":
        return "Preparing";

      case "ready":
        return "Ready";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  const totalOrders = orders.length;

  const totalSales = orders.reduce((sum, order) => {
    const status = getStatus(order.status);

    if (status === "Cancelled") {
      return sum;
    }

    let amount = Number(order.total) || 0;

    if (amount === 0) {
      amount = Number(order.totalAmount) || 0;
    }

    if (amount === 0 && Array.isArray(order.items)) {
      amount = order.items.reduce((itemTotal, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        return itemTotal + price * quantity;
      }, 0);
    }

    return sum + amount;
  }, 0);

  const pendingCount = orders.filter((order) => {
    return ["New", "Accepted", "Preparing", "Ready"].includes(
      getStatus(order.status)
    );
  }).length;

  const completedCount = orders.filter((order) => {
    return getStatus(order.status) === "Completed";
  }).length;

  const cards = [
    {
      label: "Total orders",
      value: totalOrders,
      icon: ClipboardList,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      label: "Total sales",
      value: formatCurrency(totalSales),
      icon: IndianRupee,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock3,
      iconClass: "bg-orange-100 text-orange-700",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: CheckCircle2,
      iconClass: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="
              group
              rounded-2xl
              border border-stone-200/80
              bg-white
              p-4
              shadow-[0_8px_25px_rgba(28,25,23,0.06)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-[0_12px_30px_rgba(28,25,23,0.09)]
              sm:p-5
            "
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-500">
                  {card.label}
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-extrabold
                    tracking-tight
                    text-stone-900
                    sm:text-3xl
                  "
                >
                  {card.value}
                </p>
              </div>

              <div
                className={`
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl
                  ${card.iconClass}
                  transition-transform
                  duration-200
                  group-hover:scale-105
                `}
              >
                <Icon size={19} strokeWidth={2.2} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}