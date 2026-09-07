import { Check } from "lucide-react";

const STEPS = ["New", "Accepted", "Preparing", "Ready", "Completed"];
const LABELS = {
  New: "Order received",
  Accepted: "Accepted",
  Preparing: "Preparing",
  Ready: "Ready",
  Completed: "Completed",
};

export default function OrderStatusTracker({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="rounded-xl2 bg-clay-500/10 px-4 py-3 text-center font-semibold text-clay-600">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="space-y-4">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                done
                  ? "bg-leaf-500 text-paper"
                  : "bg-ink-950/10 text-ink-700"
              }`}
            >
              {done ? <Check size={15} /> : index + 1}
            </div>
            <span
              className={`font-medium ${
                isCurrent
                  ? "text-ink-950"
                  : done
                  ? "text-ink-800"
                  : "text-ink-700/60"
              }`}
            >
              {LABELS[step]}
              {isCurrent && (
                <span className="ml-2 text-xs font-normal text-leaf-600">
                  · current
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
