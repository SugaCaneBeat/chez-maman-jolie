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
}

export default function AddToCartButton({ item, className = "" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [clicked, setClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item);
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-9 h-9 rounded-[5px] flex items-center justify-center transition-all duration-300 ${
        clicked
          ? "bg-primary scale-110"
          : "bg-white/10 hover:bg-primary/80 backdrop-blur-sm"
      } ${className}`}
      aria-label={`Ajouter ${item.name} au panier`}
    >
      {clicked ? (
        <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  );
}
