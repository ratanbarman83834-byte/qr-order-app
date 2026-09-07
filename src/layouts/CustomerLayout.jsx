import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-xl bg-sand">
      <Outlet />
    </div>
  );
}
