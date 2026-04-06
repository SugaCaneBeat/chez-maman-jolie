"use client";

import { useCart } from "@/context/CartContext";

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
      <div className="glass-dark rounded-2xl px-6 py-3 flex items-center gap-3 shadow-2xl">
        <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className="text-white text-sm font-medium">{toast}</span>
      </div>
    </div>
  );
}
