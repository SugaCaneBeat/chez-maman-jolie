"use client";

import { useCart } from "@/context/CartContext";
import type { ReactNode } from "react";

/**
 * Smart "Commander" button used across the site.
 * - Cart empty → scrolls to #menu so user can build the cart
 * - Cart has items → opens the cart drawer so user can finalise
 *
 * Consistent behaviour wherever used (Hero, Livraison, tab bar, etc).
 */
export default function CommanderButton({
  children,
  className = "",
  onBeforeAction,
}: {
  children: ReactNode;
  className?: string;
  onBeforeAction?: () => void;
}) {
  const { getCount, setDrawerOpen } = useCart();

  const handleClick = () => {
    onBeforeAction?.();
    if (getCount() > 0) {
      setDrawerOpen(true);
    } else {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
