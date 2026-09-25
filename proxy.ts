import { NextRequest, NextResponse } from "next/server";

// Rutas públicas del grupo (auth): accesibles sin sesión.
const PUBLIC_PATHS = new Set([
  "/", // landing
  "/contacto", // destino del CTA "Empezar" de la landing
  "/login",
  "/registro",
  "/registro/conductor",
  "/registro/gerente",
  "/recuperar",
]);

/**
 * Primera capa de control de acceso (defensa en profundidad): chequeo BARATO
 * de presencia de la cookie `token`. No llama al backend ni valida el rol —
 * eso lo hace `requireRole` (lib/auth-server.ts) en cada layout server.
 *
 * - Sin token en una ruta protegida → redirect a /login (antes de renderizar).
 * - Rutas públicas o con token → pasa; la validación real ocurre más adentro.
 */
export default function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (!token && !PUBLIC_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Los archivos estáticos (íconos, imagen social, /logo/*) no llevan sesión:
  // sin esto el navegador y los scrapers de redes reciben un 307 al login.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
