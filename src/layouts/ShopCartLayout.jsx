import { Outlet, useParams } from "react-router-dom";
import { CartProvider } from "../context/CartContext";

export default function ShopCartLayout() {
  const { shopId } = useParams();
  return (
    <CartProvider shopId={shopId}>
      <Outlet />
    </CartProvider>
  );
}
