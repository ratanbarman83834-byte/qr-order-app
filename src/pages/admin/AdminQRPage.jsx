import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { Copy, Download } from "lucide-react";
import { useOwnerShop } from "../../hooks/useOwnerShop";
import { ProductListSkeleton } from "../../components/LoadingSkeleton";

export default function AdminQRPage() {
  const { shop, loading, error } = useOwnerShop();
  const canvasWrapperRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (loading) return <ProductListSkeleton />;
  if (error) return <p className="text-ink-700">{error}</p>;

  const shopUrl = `${window.location.origin}/shop/${shop.id}`;

  function handleCopy() {
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("QR code ready nahi hai");
      return;
    }

    // shop.name missing ho tab bhi crash nahi hoga
    const safeShopName = shop?.name ? shop.name : "my-shop";
    const fileName = `${safeShopName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast.success("QR Code downloaded!");
  }
  return (
    <div className="max-w-md space-y-5">
      <h1 className="text-2xl font-extrabold">QR code</h1>
      <p className="text-ink-700">
        Print this and place it on tables, at the counter, or on packaging.
        Scanning it opens your menu directly — no app required.
      </p>

      <div
        ref={canvasWrapperRef}
        className="flex justify-center rounded-xl2 bg-paper p-8 shadow-soft"
      >
        <QRCodeCanvas value={shopUrl} size={220} includeMargin level="M" />
      </div>

      <div className="rounded-xl2 bg-paper p-4 shadow-soft">
        <p className="mb-1 text-xs font-medium text-ink-700">Menu link</p>
        <p className="break-all text-sm font-medium">{shopUrl}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl2 bg-paper py-3 font-semibold shadow-soft"
        >
          <Copy size={17} /> {copied ? "Copied" : "Copy link"}
        </button>
        <button
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl2 bg-marigold-500 py-3 font-semibold text-ink-950 shadow-soft"
        >
          <Download size={17} /> Download PNG
        </button>
      </div>

      <p className="text-xs text-ink-700">
        This QR always points to the same shop link — there's nothing to
        "regenerate" unless you want a new random shop ID. To support
        per-table QR codes later, add a <code>tableNumber</code> query param
        (e.g. <code>?table=5</code>) and prefill it on the checkout form; the
        database schema already has a <code>tableNumber</code> field ready
        for this.
      </p>
    </div>
  );
}