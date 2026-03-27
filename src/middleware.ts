import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createIntlMiddleware(routing);

// Check if the path (without locale prefix) starts with /admin
const ADMIN_PATH_RE = /^\/(?:zh|en)\/admin/;

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase session (sets cookies on response)
  await updateSession(request);

  // 2. Protect /admin routes — require authenticated user with admin/editor role
  if (ADMIN_PATH_RE.test(request.nextUrl.pathname)) {
    const res = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Extract locale from path for redirect
      const locale = request.nextUrl.pathname.startsWith("/en") ? "en" : "zh";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !(["admin", "editor"] as string[]).includes(profile.role)) {
      const locale = request.nextUrl.pathname.startsWith("/en") ? "en" : "zh";
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  // 3. Run next-intl middleware for locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
