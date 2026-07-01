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

  // Redirect al dashboard del cliente.
  await expect(page).toHaveURL("/");

  // Header del dashboard (h2, no el link del sidebar).
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();

  // Al menos una métrica cargada (KPI del período).
  await expect(page.getByText("Total gastado")).toBeVisible();
});

test("ruta protegida sin sesión redirige a /login", async ({ page }) => {
  // Contexto nuevo sin cookie de sesión: el layout del cliente
  // (app/(cliente)/layout.tsx) redirige a /login del lado del cliente.
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Iniciá sesión" })).toBeVisible();
});
