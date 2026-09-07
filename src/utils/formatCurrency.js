export function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function formatTime(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
