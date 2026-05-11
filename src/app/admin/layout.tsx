import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/supabase/user";
import { canAccess, ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";

interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    ),
  },
  {
    href: "/admin/menu",
    label: "Menu",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Commandes",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
    ),
  },
  {
    href: "/admin/media",
    label: "Médiathèque",
    shortLabel: "Médias",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Admins",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
    ),
  },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  /* Si user existe, filtre la nav par rôle. Sinon (login page) on garde tout. */
  const visibleNav = user
    ? NAV_ITEMS.filter((item) => canAccess(user.role, item.href))
    : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111008] text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-bold text-lg text-[#C9922A]">Chez Maman Jolie</h1>
          <p className="text-white/40 text-xs mt-1">Administration</p>
          {user && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/60 text-xs truncate" title={user.email}>{user.email}</p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-[5px] ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-[5px] text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-white/40 hover:text-white text-xs transition-colors">
            ← Retour au site
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#111008] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#C9922A] font-bold text-sm">Admin</span>
          {user && (
            <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-[5px] ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
              {ROLE_LABELS[user.role]}
            </span>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {visibleNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-white/60 text-xs whitespace-nowrap">
              {item.shortLabel ?? item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:p-8 p-4 pt-16 md:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
