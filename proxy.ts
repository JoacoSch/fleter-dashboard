import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/recuperar";

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/viajes") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/conductor") ||
    pathname.startsWith("/gerente");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
