import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, X } from "lucide-react";
import { getShop } from "../services/shopService";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";
import SearchBar from "../components/SearchBar";
import CartBar from "../components/CartBar";
import CartDrawer from "../components/CartDrawer";
import { ProductListSkeleton } from "../components/LoadingSkeleton";

export default function ShopPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState(null);

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // Active Orders list & Modal state
  const [activeOrderIds, setActiveOrderIds] = useState([]);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  const { products, loading, error } = useProducts(shopId);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`activeOrderIds_${shopId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setActiveOrderIds(parsed);
        } else {
          setActiveOrderIds([saved]);
        }
      } else {
        const legacySingle = localStorage.getItem(`activeOrderId_${shopId}`);
        if (legacySingle) {
          setActiveOrderIds([legacySingle]);
        }
      }
    } catch (e) {
      console.error("Error loading active orders:", e);
    }
  }, [shopId]);

  useEffect(() => {
    let cancelled = false;
    setShopLoading(true);
    getShop(shopId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setShopError("not-found");
        } else {
          setShop(data);
        }
      })
      .catch(() => !cancelled && setShopError("network"))
      .finally(() => !cancelled && setShopLoading(false));
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  if (shopLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-700">
        Loading shop…
      </div>
    );
  }

  if (shopError === "not-found") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-lg font-bold">Shop not found</p>
        <p className="text-ink-700">
          This QR code doesn't point to a valid shop. Please ask the staff for
          a fresh code.
        </p>
      </div>
    );
  }

  if (shopError === "network") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-bold">Couldn't connect</p>
        <p className="text-ink-700">Check your internet connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl2 bg-ink-950 px-5 py-2.5 font-semibold text-paper"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-36">
      <header className="bg-ink-950 px-5 pb-6 pt-8 text-paper">
        {shop.logo && (
          <img
            src={shop.logo}
            alt=""
            className="mb-3 h-12 w-12 rounded-full object-cover"
          />
        )}
        <h1 className="text-2xl font-extrabold">{shop.name}</h1>
        {shop.address && (
          <p className="mt-1 text-sm text-paper/70">{shop.address}</p>
        )}
      </header>

      <div className="sticky top-0 z-20 space-y-3 bg-sand py-3">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      <main className="mt-2">
        {loading ? (
          <ProductListSkeleton />
        ) : error ? (
          <p className="px-5 py-8 text-center text-ink-700">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-ink-700">
            No products match your search.
          </p>
        ) : (
          <div className="space-y-3 px-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Active Orders Banner */}
      {activeOrderIds.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-30 flex items-center justify-between rounded-xl2 bg-ink-950 p-4 text-paper shadow-soft">
          <div className="flex items-center gap-3">
            <div className="animate-pulse rounded-lg bg-marigold-500 p-2 text-ink-950">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-paper/70">
                {activeOrderIds.length === 1
                  ? "Active Order"
                  : `${activeOrderIds.length} Active Orders`}
              </p>
              <p className="text-sm font-bold">
                {activeOrderIds.length === 1
                  ? "Track your order"
                  : "Track all your active orders"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (activeOrderIds.length === 1) {
                navigate(`/shop/${shopId}/order/${activeOrderIds[0]}`);
              } else {
                setOrdersModalOpen(true);
              }
            }}
            className="rounded-xl bg-marigold-500 px-4 py-2 text-xs font-bold text-ink-950 transition hover:bg-marigold-400"
          >
            {activeOrderIds.length === 1 ? "View Status ➔" : "View All ➔"}
          </button>
        </div>
      )}

      {/* Multiple Orders Selector Modal */}
      {ordersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl2 bg-paper p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-ink-950/10 pb-3">
              <h3 className="text-lg font-bold text-ink-950">Select Order to Track</h3>
              <button
                onClick={() => setOrdersModalOpen(false)}
                className="rounded-full p-1 text-ink-700 hover:bg-sand"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeOrderIds.map((id, index) => (
                <div
                  key={id}
                  onClick={() => {
                    setOrdersModalOpen(false);
                    navigate(`/shop/${shopId}/order/${id}`);
                  }}
                  className="flex items-center justify-between rounded-xl bg-sand p-3.5 cursor-pointer hover:bg-marigold-500/20 transition"
                >
                  <div>
                    <p className="text-sm font-bold text-ink-950">
                      Order #{index + 1}
                    </p>
                    <p className="text-xs text-ink-700">
                      ID: ...{id.slice(-6)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-ink-950 bg-marigold-500 px-3 py-1.5 rounded-lg">
                    Track Status ➔
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CartBar onOpen={() => setCartOpen(true)} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          navigate(`/shop/${shopId}/checkout`);
        }}
      />
    </div>
  );
}