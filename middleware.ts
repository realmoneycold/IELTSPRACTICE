// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  // Protect student dashboard and practice area
  if ((nextUrl.pathname.startsWith("/dashboard") || 
       nextUrl.pathname.startsWith("/practice")) && !session) {
    return NextResponse.redirect(new URL("/(auth)/login", nextUrl));
  }

  // Protect teacher area
  if (nextUrl.pathname.startsWith("/teacher") && session?.user?.role !== "TEACHER") {
    return NextResponse.redirect(new URL("/(auth)/login", nextUrl));
  }

  // Protect admin and CEO area
  if ((nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/ceo")) &&
      !["ADMIN", "CEO"].includes(session?.user?.role ?? "")) {
    return NextResponse.redirect(new URL("/(auth)/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/practice/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/ceo/:path*",
  ],
};
