"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const navItems = [
  { label: "Accueil", href: "#accueil" },
  { label: "Carte", href: "#menu" },
  { label: "Livraison", href: "#livraison" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getCount, setDrawerOpen } = useCart();
  const count = getCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-dark/80 backdrop-blur-2xl shadow-2xl shadow-black/20 border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-18 sm:h-22">
          <a href="#accueil" className="group hover:opacity-80 transition-opacity">
            <Image
              src="/logo.svg"
              alt="Chez Maman Jolie"
              width={180}
              height={54}
              className="h-10 sm:h-12 w-auto"
              priority
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-white/60 hover:text-white transition-all text-sm font-medium tracking-wide px-4 py-2 rounded-[5px] hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative text-white/60 hover:text-white transition-all p-2 rounded-[5px] hover:bg-white/5"
              aria-label="Panier"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-dark text-[10px] font-bold rounded-[5px] flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (count > 0) {
                  setDrawerOpen(true);
                } else {
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="relative ml-4 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-dark font-bold px-6 py-2.5 rounded-[5px] text-sm transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 ? `Commander (${count})` : "Commander"}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white/80 p-2 hover:bg-white/5 rounded-[5px] transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="pb-6 pt-2 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-[5px] transition-all text-sm font-medium tracking-wide"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => { setDrawerOpen(true); setIsOpen(false); }}
              className="flex items-center gap-3 py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-[5px] transition-all text-sm font-medium tracking-wide w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Panier {count > 0 && `(${count})`}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                if (count > 0) {
                  setDrawerOpen(true);
                } else {
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="block mt-3 w-full bg-gradient-to-r from-primary to-primary-light text-dark font-bold px-6 py-3.5 rounded-[5px] text-sm text-center transition-all"
            >
              {count > 0 ? `Commander (${count} articles)` : "Commander"}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
