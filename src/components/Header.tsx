"use client";

import { useState, useEffect } from "react";

const navItems = [
  { label: "Accueil", href: "#accueil" },
  { label: "Carte", href: "#menu" },
  { label: "Livraison", href: "#livraison" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          <a href="#accueil" className="flex flex-col group">
            <span className="font-heading text-gradient text-xl sm:text-2xl font-bold tracking-wide group-hover:opacity-80 transition-opacity">
              Chez Maman Jolie
            </span>
            <span className="text-[9px] sm:text-[10px] text-white/40 tracking-[0.25em] uppercase font-light">
              Cuisine Africaine Authentique
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-white/60 hover:text-white transition-all text-sm font-medium tracking-wide px-4 py-2 rounded-full hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://wa.me/33712345678"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-dark font-bold px-6 py-2.5 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
            >
              Commander
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white/80 p-2 hover:bg-white/5 rounded-xl transition-colors"
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
                className="block py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium tracking-wide"
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://wa.me/33712345678"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block mt-3 bg-gradient-to-r from-primary to-primary-light text-dark font-bold px-6 py-3.5 rounded-2xl text-sm text-center transition-all"
            >
              Commander sur WhatsApp
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
