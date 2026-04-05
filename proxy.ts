import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const start = Date.now();

  function addLoggingAndTiming(response: NextResponse) {
    const duration = Date.now() - start;
    // Log request details (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[${request.method}] ${request.nextUrl.pathname} ${response.status} ${duration}ms`
      );
    }
    // Add server timing header for potential monitoring
    response.headers.set("Server-Timing", `total;dur=${duration}`);
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // Redirect authenticated users away from /login
  if (claims && request.nextUrl.pathname === "/login") {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    addLoggingAndTiming(redirectResponse);
    return redirectResponse;
  }

  if (!claims && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectResponse = NextResponse.redirect(new URL("/auth/login", request.url));
    addLoggingAndTiming(redirectResponse);
    return redirectResponse;
  }

  const sessionResponse = await updateSession(request);
  addLoggingAndTiming(sessionResponse);
  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};