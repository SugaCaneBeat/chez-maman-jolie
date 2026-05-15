"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  item: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  className?: string;
  /**
   * - "subtle"     : fond translucide blanc, pour zones où le bouton est secondaire
   * - "prominent"  : fond or solide, icône foncée, pour les cartes de la Carte
   *                   (toujours visible, contraste élevé sur photos)
   */
  variant?: "subtle" | "prominent";
}

export default function AddToCartButton({
  item,
  className = "",
  variant = "subtle",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [clicked, setClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item);
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
  };

  const baseStyle =
    "w-11 h-11 rounded-[5px] flex items-center justify-center transition-all duration-300";

  const stateStyle = clicked
    ? "bg-primary text-dark scale-110"
    : variant === "prominent"
      ? "bg-primary text-dark hover:bg-primary-light hover:scale-110 shadow-lg shadow-primary/40 ring-2 ring-white/30"
      : "bg-white/10 text-white hover:bg-primary/80 backdrop-blur-sm";

  return (
    <button
      onClick={handleClick}
      className={`${baseStyle} ${stateStyle} ${className}`}
      aria-label={`Ajouter ${item.name} au panier`}
      title={`Ajouter ${item.name} au panier`}
    >
      {clicked ? (
        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  );
}
