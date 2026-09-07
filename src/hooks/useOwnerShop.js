import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getShopForOwner } from "../services/shopService";

export function useOwnerShop() {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    getShopForOwner(user.uid)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError(
            "No shop is linked to this account yet. Create a shop document with ownerUid set to your account's UID."
          );
        }
        setShop(data);
      })
      .catch(() => !cancelled && setError("Couldn't load your shop."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { shop, loading, error };
}
