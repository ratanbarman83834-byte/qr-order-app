import { formatCurrency } from "../../utils/formatCurrency";

export default function StatsCards({ orders }) {
  const today = new Date().toDateString();
  const todaysOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  );

  const totalOrders = todaysOrders.length;
  const totalSales = todaysOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pending = todaysOrders.filter((o) =>
    ["New", "Accepted", "Preparing", "Ready"].includes(o.status)
  ).length;
  const completed = todaysOrders.filter((o) => o.status === "Completed").length;

  const stats = [
    { label: "Total orders", value: totalOrders },
    { label: "Total sales", value: formatCurrency(totalSales) },
    { label: "Pending", value: pending },
    { label: "Completed", value: completed },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl2 bg-paper p-4 shadow-soft">
          <p className="text-sm text-ink-700">{s.label}</p>
          <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
