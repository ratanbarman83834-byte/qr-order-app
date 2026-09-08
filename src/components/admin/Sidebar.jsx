import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  QrCode,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: ClipboardList,
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    to: "/admin/qr",
    label: "QR code",
    icon: QrCode,
  },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside
      className="
        flex
        w-[68px]
        shrink-0
        flex-col
        items-center
        border-r
        border-stone-200/80
        bg-white
        py-5
        md:w-60
        md:items-stretch
        md:px-3
      "
    >
      {/* Logo / Title */}
      <div className="mb-6 hidden px-3 md:block">
        <p className="text-lg font-extrabold tracking-tight text-stone-900">
          Owner panel
        </p>

        <p className="mt-0.5 text-xs text-stone-400">
          Restaurant management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex w-full flex-col gap-1.5 px-1.5 md:px-0">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `
                group
                flex
                items-center
                justify-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-semibold
                transition-all
                duration-200
                md:justify-start
                ${
                  isActive
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }
              `
            }
          >
            <Icon
              size={20}
              strokeWidth={2}
              className="shrink-0"
            />

            <span className="hidden md:inline">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto w-full px-1.5 md:px-0">
        <button
          onClick={logout}
          title="Log out"
          className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-sm
            font-semibold
            text-rose-600
            transition
            hover:bg-rose-50
            md:justify-start
          "
        >
          <LogOut
            size={20}
            strokeWidth={2}
            className="shrink-0"
          />

          <span className="hidden md:inline">
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
}