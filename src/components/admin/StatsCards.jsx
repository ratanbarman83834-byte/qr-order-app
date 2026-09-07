
import { formatCurrency } from "../../utils/formatCurrency";

export default function StatsCards({ orders = [] }) {
  // Normalize status so both "preparing" and "Preparing" work
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

  // ==============================
  // TOTAL ORDERS
  // ==============================

  const totalOrders = orders.length;

  // ==============================
  // TOTAL SALES
  // ==============================
  // All non-cancelled orders count as sales.
  // This means New / Preparing / Ready / Completed
  // orders will be included.

  const totalSales = orders.reduce((sum, order) => {
    const status = getStatus(order.status);

    // Don't count cancelled orders
    if (status === "Cancelled") {
      return sum;
    }

    // Your Firestore currently stores "total"
    let amount = Number(order.total) || 0;

    // Support totalAmount too
    if (amount === 0) {
      amount = Number(order.totalAmount) || 0;
    }

    // Fallback: calculate from items
    if (amount === 0 && Array.isArray(order.items)) {
      amount = order.items.reduce((itemTotal, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        return itemTotal + price * quantity;
      }, 0);
    }

    return sum + amount;
  }, 0);

  // ==============================
  // PENDING ORDERS
  // ==============================

  const pendingCount = orders.filter((order) => {
    const status = getStatus(order.status);

    return [
      "New",
      "Accepted",
      "Preparing",
      "Ready",
    ].includes(status);
  }).length;

  // ==============================
  // COMPLETED ORDERS
  // ==============================

  const completedCount = orders.filter((order) => {
    return getStatus(order.status) === "Completed";
  }).length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

      {/* Total Orders */}
      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="text-xs font-medium text-ink-700">
          Total orders
        </p>

        <p className="mt-1 text-2xl font-extrabold">
          {totalOrders}
        </p>
      </div>

      {/* Total Sales */}
      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="text-xs font-medium text-ink-700">
          Total sales
        </p>

        <p className="mt-1 text-2xl font-extrabold">
          {formatCurrency(totalSales)}
        </p>
      </div>

      {/* Pending */}
      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="text-xs font-medium text-ink-700">
          Pending
        </p>

        <p className="mt-1 text-2xl font-extrabold">
          {pendingCount}
        </p>
      </div>

      {/* Completed */}
      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="text-xs font-medium text-ink-700">
          Completed
        </p>

        <p className="mt-1 text-2xl font-extrabold">
          {completedCount}
        </p>
      </div>

    </div>
  );
}

