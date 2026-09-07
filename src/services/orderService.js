import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/config";

/**
 * Places an order by calling the "createOrder" Cloud Function.
 *
 * IMPORTANT: we only send productId + quantity, never price. The function
 * looks up each product's current price in Firestore itself and computes the
 * total server-side — a customer editing the page's JS cannot change what
 * they're charged. See functions/index.js.
 */
export async function placeOrder({
  shopId,
  customerName,
  customerPhone,
  tableNumber,
  notes,
  items,
}) {
  const createOrder = httpsCallable(functions, "createOrder");
  const result = await createOrder({
    shopId,
    customerName,
    customerPhone: customerPhone || "",
    tableNumber: tableNumber || "",
    notes: notes || "",
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  });
  return result.data; // { orderId, orderCode, total, items, status }
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
