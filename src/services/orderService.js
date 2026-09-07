import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Places an order by calling our free Vercel Serverless API (/api/createOrder).
 */
export async function placeOrder({
  shopId,
  customerName,
  customerPhone,
  tableNumber,
  notes,
  items,
}) {
  const response = await fetch("/api/createOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shopId,
      customerName,
      customerPhone: customerPhone || "",
      tableNumber: tableNumber || "",
      notes: notes || "",
      items: items.map((i) => ({ 
        productId: i.productId || i.id, // Checks both productId and id
        quantity: i.quantity 
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Order place nahi ho paya. Phir se try karein.");
  }

  return await response.json(); // Returns { orderId, total, status }
}

/** Live status for the customer-facing order tracking page. */
export function subscribeToOrder(orderId, onChange, onError) {
  return onSnapshot(doc(db, "orders", orderId), (snap) => {
    if (!snap.exists()) return onChange(null);
    onChange({ id: snap.id, ...snap.data() });
  }, onError);
}

/** Live order list for the admin dashboard, newest first. */
export function subscribeToShopOrders(shopId, onChange, onError) {
  const q = query(
    collection(db, "orders"),
    where("shopId", "==", shopId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export const ORDER_STATUSES = [
  "New",
  "Accepted",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

export async function updateOrderStatus(orderId, status) {
  return updateDoc(doc(db, "orders", orderId), {
    status,
    statusUpdatedAt: new Date().toISOString(),
  });
}