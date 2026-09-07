import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import CustomerLayout from "./layouts/CustomerLayout";
import ShopCartLayout from "./layouts/ShopCartLayout";
import AdminLayout from "./layouts/AdminLayout";

import ShopPage from "./pages/ShopPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import NotFoundPage from "./pages/NotFoundPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminQRPage from "./pages/admin/AdminQRPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          {/* Customer-facing: reached by scanning the shop's QR code */}
          <Route element={<CustomerLayout />}>
            <Route element={<ShopCartLayout />}>
              <Route path="/shop/:shopId" element={<ShopPage />} />
              <Route path="/shop/:shopId/checkout" element={<CheckoutPage />} />
              <Route
                path="/shop/:shopId/order/:orderId"
                element={<OrderStatusPage />}
              />
            </Route>
          </Route>

          {/* Owner-facing */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="qr" element={<AdminQRPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
