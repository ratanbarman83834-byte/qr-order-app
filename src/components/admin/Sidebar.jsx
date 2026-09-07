import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Package, QrCode, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/qr", label: "QR code", icon: QrCode },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="flex w-16 flex-col items-center gap-1 border-r border-ink-950/5 bg-paper py-6 md:w-56 md:items-stretch md:px-3">
      <div className="mb-4 hidden px-2 text-lg font-extrabold md:block">
        Owner panel
      </div>
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-marigold-500 text-ink-950"
                : "text-ink-800 hover:bg-sand"
            }`
          }
        >
          <Icon size={19} />
          <span className="hidden md:inline">{label}</span>
        </NavLink>
      ))}
      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-clay-600 hover:bg-clay-500/10"
      >
        <LogOut size={19} />
        <span className="hidden md:inline">Log out</span>
      </button>
    </aside>
  );
}
