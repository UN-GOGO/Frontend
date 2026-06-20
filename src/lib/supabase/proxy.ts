import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const protectedPrefixes = [
    "/chat",
    "/cv",
    "/gap",
    "/jobs",
    "/mypage",
    "/notifications",
    "/profile",
    "/settings",
  ];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  let isOnboarded = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", user.id)
      .maybeSingle();
    isOnboarded = Boolean(profile?.onboarded);
  }

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  if (!user) {
    if (isProtected || isOnboardingRoute) {
      return redirectTo("/login");
    }
    return supabaseResponse;
  }

  if (!isOnboarded) {
    if (isOnboardingRoute) {
      return supabaseResponse;
    }
    if (isProtected || isAuthRoute) {
      return redirectTo("/onboarding");
    }
    return supabaseResponse;
  }

  if (isAuthRoute || isOnboardingRoute) {
    return redirectTo("/mypage");
  }

  return supabaseResponse;
}
