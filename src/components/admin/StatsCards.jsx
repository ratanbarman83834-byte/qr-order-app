import { formatCurrency } from "../../utils/formatCurrency";

export default function StatsCards({ orders = [] }) {
  const totalOrders = orders.length;

  // Completed orders ki total earning sum karein
  const totalSales = orders
    .filter((o) => o.status === "Completed")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Pending orders (New, Accepted, Preparing, Ready)
  const pendingCount = orders.filter((o) =>
    ["New", "Accepted", "Preparing", "Ready"].includes(o.status)
  ).length;

  // Completed orders count
  const completedCount = orders.filter(
    (o) => o.status === "Completed"
  ).length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="text-xs font-medium text-ink-700">Total orders</p>
        <p className="mt-1 text-2xl font-extrabold">{totalOrders}</p>
      </div>

      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="text-xs font-medium text-ink-700">Total sales</p>
        <p className="mt-1 text-2xl font-extrabold">
          {formatCurrency(totalSales)}
        </p>
      </div>

      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="text-xs font-medium text-ink-700">Pending</p>
        <p className="mt-1 text-2xl font-extrabold">{pendingCount}</p>
      </div>

      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="text-xs font-medium text-ink-700">Completed</p>
        <p className="mt-1 text-2xl font-extrabold">{completedCount}</p>
      </div>
    </div>
  );
}