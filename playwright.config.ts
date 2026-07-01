import { defineConfig, devices } from "@playwright/test";

// E2E sobre la app en modo MOCK (NEXT_PUBLIC_MOCK=true): no necesita backend
// ni Firebase real. Ver lib/api.ts, hooks/useAuth.tsx y la API route
// app/api/analytics/cliente/resumen (todas tienen rama MOCK).
export default defineConfig({
  testDir: "./__tests__/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_MOCK: "true",
      NEXT_PUBLIC_MOCK_ROLE: "CLIENTE",
    },
  },
});
