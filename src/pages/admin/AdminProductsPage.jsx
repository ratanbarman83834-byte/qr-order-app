import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useOwnerShop } from "../../hooks/useOwnerShop";
import { useProducts } from "../../hooks/useProducts";
import {
  deleteProduct,
  deleteProductImage,
  toggleAvailability,
} from "../../services/productService";
import ProductForm from "../../components/admin/ProductForm";
import { ProductListSkeleton } from "../../components/LoadingSkeleton";
import { formatCurrency } from "../../utils/formatCurrency";

export default function AdminProductsPage() {
  const { shop, loading: shopLoading, error: shopError } = useOwnerShop();
  const { products, loading, error } = useProducts(shop?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  function openAddForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) {
      return;
    }
    try {
      await deleteProduct(product.id);
      if (product.image) await deleteProductImage(product.image);
      toast.success("Product deleted");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't delete the product.");
    }
  }

  async function handleToggle(product) {
    try {
      await toggleAvailability(product.id, !(product.available !== false));
    } catch (err) {
      console.error(err);
      toast.error("Couldn't update availability.");
    }
  }

  if (shopLoading) return <ProductListSkeleton />;
  if (shopError) return <p className="text-ink-700">{shopError}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Products</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 rounded-xl2 bg-marigold-500 px-4 py-2.5 font-semibold text-ink-950 shadow-soft"
        >
          <Plus size={18} /> Add product
        </button>
      </div>

      {loading ? (
        <ProductListSkeleton />
      ) : error ? (
        <p className="text-ink-700">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-ink-700">
          No products yet. Add your first product to get started.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {products.map((product) => {
            const isAvailable = product.available !== false;
            return (
              <div
                key={product.id}
                className="flex gap-3 rounded-xl2 bg-paper p-3 shadow-soft"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      🍽️
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{product.name}</p>
                    <span className="shrink-0 font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="text-xs text-ink-700">{product.category}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-ink-800">
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={() => handleToggle(product)}
                        className="h-3.5 w-3.5"
                      />
                      Available
                    </label>
                    <button
                      onClick={() => openEditForm(product)}
                      className="flex items-center gap-1 text-xs font-medium text-ink-800"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex items-center gap-1 text-xs font-medium text-clay-600"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <ProductForm
          shopId={shop.id}
          product={editingProduct}
          onClose={() => setFormOpen(false)}
          onSaved={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
