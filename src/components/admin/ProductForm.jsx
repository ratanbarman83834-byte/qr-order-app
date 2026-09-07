
import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import {
  CATEGORIES,
  createProduct,
  updateProduct,
} from "../../services/productService";
import { Spinner } from "../LoadingSkeleton";

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c !== "All");

export default function ProductForm({
  shopId,
  product,
  onClose,
  onSaved,
}) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(
    product?.description || ""
  );
  const [price, setPrice] = useState(product?.price ?? "");
  const [category, setCategory] = useState(
    product?.category || CATEGORY_OPTIONS[0]
  );
  const [available, setAvailable] = useState(
    product?.available ?? true
  );

  // Image URL instead of Firebase Storage
  const [imageUrl, setImageUrl] = useState(product?.image || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      return setError("Product name is required.");
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return setError("Enter a valid price greater than 0.");
    }

    setSaving(true);

    try {
      const productData = {
        name,
        description,
        price: numericPrice,
        category,
        available,
        image: imageUrl,
      };

      if (isEditing) {
        await updateProduct(product.id, productData);
        toast.success("Product updated");
      } else {
        await createProduct(shopId, productData);
        toast.success("Product added");
      }

      onSaved();
    } catch (err) {
      console.error(err);
      setError(
        "Couldn't save the product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center">
      <div
        className="absolute inset-0 bg-ink-950/40"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="animate-rise-in safe-bottom relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl2 bg-sand p-6 md:rounded-xl2"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {isEditing ? "Edit product" : "Add product"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">

          {/* IMAGE PREVIEW */}
          <div className="space-y-3">
            <div className="h-40 w-full overflow-hidden rounded-xl bg-paper">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name || "Product"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🍽️
                </div>
              )}
            </div>

            <Field label="Image URL">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) =>
                  setImageUrl(e.target.value)
                }
                placeholder="https://example.com/burger.jpg"
                className={inputClass}
              />
            </Field>

            <p className="text-xs text-ink-600">
              Paste a direct image URL. Firebase Storage is not required.
            </p>
          </div>

          {/* NAME */}
          <Field label="Name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </Field>

          {/* DESCRIPTION */}
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {/* PRICE + CATEGORY */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)" required>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className={inputClass}
                required
              />
            </Field>

            <Field label="Category">
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* AVAILABLE */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) =>
                setAvailable(e.target.checked)
              }
              className="h-4 w-4 rounded"
            />

            <span className="text-sm font-medium text-ink-800">
              Available for ordering
            </span>
          </label>

          {/* ERROR */}
          {error && (
            <p className="rounded-xl bg-clay-500/10 px-4 py-2.5 text-sm font-medium text-clay-600">
              {error}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-marigold-500 py-3.5 font-bold text-ink-950 disabled:opacity-60"
          >
            {saving && <Spinner />}

            {saving
              ? "Saving…"
              : isEditing
              ? "Save changes"
              : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}

        {required && (
          <span className="text-clay-500"> *</span>
        )}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl bg-paper px-4 py-3 text-[0.95rem] shadow-soft outline-none";
