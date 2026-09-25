import { test, expect } from "@playwright/test";

// Estos flujos corren en modo MOCK: el login no valida credenciales reales
// (ver hooks/useAuth.tsx) y el dashboard carga métricas desde la rama MOCK
// de /api/analytics/cliente/resumen.

test("login → dashboard: ingresar lleva al dashboard con métricas", async ({ page }) => {
  await page.goto("/login");

  // En MOCK cualquier valor sirve; el formulario igual exige email/password.
  await page.locator("#email").fill("joaco@fleter.com");
  await page.locator("#password").fill("cualquier-cosa");
  await page.getByRole("button", { name: "Ingresar" }).click();

  // Redirect al dashboard del cliente (movido de `/` a `/panel` el 15-09).
  await expect(page).toHaveURL("/panel");

  // Header del dashboard (h2, no el link del sidebar).
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();

  // Al menos una métrica cargada (KPI del período).
  await expect(page.getByText("Total gastado")).toBeVisible();
});

test("ruta protegida sin sesión redirige a /login", async ({ page }) => {
  // Contexto nuevo sin cookie de sesión: `proxy.ts` redirige a /login
  // server-side, antes de renderizar el layout.
  await page.goto("/panel");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Iniciá sesión" })).toBeVisible();
});

test("la landing es pública, tiene tres Empezar y lleva al login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("conductores");

  // Un solo CTA primario, en tres lugares, que abre /contacto en otra pestaña.
  const empezar = page.getByRole("link", { name: "Empezar" });
  await expect(empezar).toHaveCount(3);
  for (const link of await empezar.all()) {
    await expect(link).toHaveAttribute("href", "/contacto");
    await expect(link).toHaveAttribute("target", "_blank");
  }

  await page.getByRole("link", { name: "Acceder" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
});
