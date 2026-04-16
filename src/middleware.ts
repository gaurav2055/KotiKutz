import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, preferred_location_id")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "customer";

  // Invited staff must reach this page to set their password before their
  // role is fully confirmed in the profile — allow any authenticated user through.
  if (request.nextUrl.pathname === "/admin/set-password") {
    return response;
  }

  if (role === "customer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Pass role and location to pages via headers
  response.headers.set("x-user-role", role);
  response.headers.set("x-user-id", user.id);
  if (profile?.preferred_location_id) {
    response.headers.set("x-user-location", profile.preferred_location_id);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
