import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import OrderCard from "../../components/admin/OrderCard";
import { Spinner } from "../../components/LoadingSkeleton";

export default function AdminDashboard({ shopId: propShopId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prop -> localStorage -> Firebase Auth fallback chain
  const effectiveShopId = 
    propShopId || 
    localStorage.getItem("shopId") || 
    auth.currentUser?.uid;

  useEffect(() => {
    if (!effectiveShopId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const ordersRef = collection(db, "shops", effectiveShopId, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orderList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(orderList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching live orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [effectiveShopId]);

  // Dynamic Stats Calculation
  const stats = useMemo(() => {
    let totalOrders = orders.length;
    let totalSales = 0;
    let pendingCount = 0;
    let completedCount = 0;

    orders.forEach((order) => {
      const orderStatus = order.status || "received";
      
      if (orderStatus === "received" || orderStatus === "preparing") {
        pendingCount += 1;
      } else if (orderStatus === "completed") {
        completedCount += 1;
      }

      if (orderStatus !== "cancelled") {
        const amount = order.totalAmount || order.subtotal || 0;
        totalSales += Number(amount);
      }
    });

    return { totalOrders, totalSales, pendingCount, completedCount };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!effectiveShopId) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm font-semibold text-ink-700">
          Shop ID missing. Please login again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-marigold-500 px-4 py-2 text-xs font-bold text-ink-950 shadow-soft"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Dynamic Top Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5">
          <p className="text-xs font-semibold text-ink-700">Total orders</p>
          <h3 className="text-2xl font-black text-ink-950 mt-1">{stats.totalOrders}</h3>
        </div>

        <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5">
          <p className="text-xs font-semibold text-ink-700">Total sales</p>
          <h3 className="text-2xl font-black text-ink-950 mt-1">₹{stats.totalSales}</h3>
        </div>

        <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5">
          <p className="text-xs font-semibold text-ink-700">Pending</p>
          <h3 className="text-2xl font-black text-marigold-600 mt-1">{stats.pendingCount}</h3>
        </div>

        <div className="rounded-2xl bg-paper p-5 shadow-soft border border-ink-950/5">
          <p className="text-xs font-semibold text-ink-700">Completed</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.completedCount}</h3>
        </div>
      </div>

      {/* Latest Orders List */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-ink-950">Latest orders</h2>
        
        {orders.length === 0 ? (
          <p className="text-sm text-ink-700">No orders placed yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} shopId={effectiveShopId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}