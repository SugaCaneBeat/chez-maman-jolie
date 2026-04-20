import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111008] text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-bold text-lg text-[#C9922A]">Chez Maman Jolie</h1>
          <p className="text-white/40 text-xs mt-1">Administration</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-[5px] text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </Link>
          <Link href="/admin/menu" className="flex items-center gap-3 px-4 py-2.5 rounded-[5px] text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Menu
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-[5px] text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Commandes
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2.5 rounded-[5px] text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Admins
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-white/40 hover:text-white text-xs transition-colors">
            ← Retour au site
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#111008] px-4 py-3 flex items-center justify-between">
        <span className="text-[#C9922A] font-bold text-sm">Admin</span>
        <div className="flex gap-4">
          <Link href="/admin" className="text-white/60 text-xs">Dashboard</Link>
          <Link href="/admin/menu" className="text-white/60 text-xs">Menu</Link>
          <Link href="/admin/orders" className="text-white/60 text-xs">Commandes</Link>
          <Link href="/admin/users" className="text-white/60 text-xs">Admins</Link>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:p-8 p-4 pt-16 md:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
