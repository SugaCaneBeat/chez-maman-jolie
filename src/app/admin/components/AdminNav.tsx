"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";
import { ROLE_LABELS, ROLE_COLORS, type AdminRole } from "@/lib/roles";

export interface NavLink {
  href: string;
  label: string;
  shortLabel?: string;
  icon: ReactNode;
}

interface User {
  email: string;
  role: AdminRole;
}

interface Props {
  user: User | null;
  navItems: NavLink[];
}

function initials(email: string): string {
  const local = email.split("@")[0];
  return local.slice(0, 2).toUpperCase();
}

function isActive(currentPath: string, href: string): boolean {
  if (href === "/admin") return currentPath === "/admin";
  return currentPath === href || currentPath.startsWith(href + "/");
}

export default function AdminNav({ user, navItems }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleLogout = () => {
    if (!confirm("Se déconnecter ?")) return;
    startTransition(() => { signOut(); });
  };

  return (
    <>
      {/* ════════════════════════════════════
          SIDEBAR DESKTOP
          ════════════════════════════════════ */}
      <aside className="w-64 bg-[#111008] text-white flex-shrink-0 hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30">
        <div className="p-5 border-b border-white/10">
          <h1 className="font-heading font-bold text-lg text-[#C9922A]">Chez Maman Jolie</h1>
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Administration</p>
        </div>

        {/* User card */}
        {user && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                {initials(user.email)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate" title={user.email}>{user.email}</p>
                <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[5px] ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-sm transition-all ${
                  active
                    ? "bg-[#C9922A] text-[#111008] font-bold shadow-md shadow-[#C9922A]/20"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={`flex-shrink-0 ${active ? "" : "opacity-70"}`}>{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#111008]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Voir le site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[5px] text-xs text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════
          HEADER MOBILE
          ════════════════════════════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#111008] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-white/70 hover:text-white p-1 -ml-1"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <span className="text-[#C9922A] font-bold text-sm whitespace-nowrap">Maman Jolie</span>
            {user && (
              <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[5px] flex-shrink-0 ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                {ROLE_LABELS[user.role]}
              </span>
            )}
          </div>
          {user && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
              {initials(user.email)}
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-[60] w-72 max-w-[85vw] bg-[#111008] text-white flex flex-col animate-slide-in-left">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h1 className="font-heading font-bold text-lg text-[#C9922A]">Chez Maman Jolie</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Administration</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {user && (
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                    {initials(user.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate" title={user.email}>{user.email}</p>
                    <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[5px] ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-[5px] text-sm transition-all ${
                      active
                        ? "bg-[#C9922A] text-[#111008] font-bold"
                        : "text-white/65 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-white/10 space-y-1">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-xs text-white/50 hover:text-white hover:bg-white/5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Voir le site
              </Link>
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-[5px] text-xs text-white/50 hover:text-red-300 hover:bg-red-500/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
