import { test, expect, type Page } from "@playwright/test";

// Recorre las pantallas de la PyME en modo MOCK y falla si alguna tira errores
// de consola o excepciones sin atrapar. Google Maps no tiene key en MOCK: sus
// avisos se ignoran porque vienen del script de Google, no de la app.
const RUIDO_EXTERNO = /maps\.googleapis|Google Maps|InvalidKeyMapError|ApiProjectMapError|NoApiKeys|favicon/i;

function juntarErrores(page: Page): string[] {
  const errores: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !RUIDO_EXTERNO.test(msg.text())) errores.push(msg.text());
  });
  page.on("pageerror", (err) => errores.push(`pageerror: ${err.message}`));
  return errores;
}

async function login(page: Page) {
  await page.goto("/login");
  await page.locator("#email").fill("joaco@fleter.com");
  await page.locator("#password").fill("cualquier-cosa");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL("/panel");
}

const PANTALLAS = [
  { ruta: "/panel", titulo: "Analytics" },
  { ruta: "/viajes", titulo: "Record" },
  { ruta: "/facturacion", titulo: "Facturación" },
  { ruta: "/viaje-activo", titulo: "Viajes en curso" },
  { ruta: "/pedir-viaje", titulo: "Pedir un viaje" },
  { ruta: "/perfil", titulo: "Perfil" },
];

for (const { ruta, titulo } of PANTALLAS) {
  test(`${ruta} carga sin errores de consola`, async ({ page }) => {
    const errores = juntarErrores(page);
    await login(page);
    await page.goto(ruta);
    await expect(page.getByRole("heading", { name: titulo, exact: true })).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errores).toEqual([]);
  });
}

test("Record → detalle de un viaje", async ({ page }) => {
  const errores = juntarErrores(page);
  await login(page);
  await page.goto("/viajes");

  const link = page.locator('a[href^="/viajes/"]').first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  await link.click();

  await expect(page).toHaveURL(href!);
  await expect(page.getByText("Conductor", { exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(errores).toEqual([]);
});
