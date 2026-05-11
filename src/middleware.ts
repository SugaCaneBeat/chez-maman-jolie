import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { canAccess, DEFAULT_ROLE, isValidRole, type AdminRole } from "@/lib/roles";

export async function middleware(request: NextRequest) {
  // Only protect /admin routes (except /admin/login)
  if (!request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("YOUR_PROJECT")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  /* ── RBAC : vérifie que le rôle a accès au chemin ── */
  const roleStr = (user.app_metadata as { role?: string } | undefined)?.role;
  const role: AdminRole = roleStr && isValidRole(roleStr) ? roleStr : DEFAULT_ROLE;

  if (!canAccess(role, request.nextUrl.pathname)) {
    /* Pas autorisé → redirige vers le dashboard avec un flag de refus */
    const redirectUrl = new URL("/admin", request.url);
    redirectUrl.searchParams.set("denied", "1");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
