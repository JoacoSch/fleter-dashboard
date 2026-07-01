# Fleter Dashboard

Panel web de **Fleter**, un marketplace de fletes que conecta clientes (empresas o
personas que necesitan transporte de carga), conductores y gerentes. Este repo es el
**frontend** (Next.js 16 + React 19 + TypeScript); el backend es un servicio externo
que expone una API REST + WebSockets (Socket.io para el tiempo real).

## Correr en local

```bash
npm install
npm run dev
```

La app queda en http://localhost:3000.

Para desarrollar **sin backend ni Firebase** (datos de ejemplo), usar el modo MOCK:

```bash
NEXT_PUBLIC_MOCK=true NEXT_PUBLIC_MOCK_ROLE=CLIENTE npm run dev
```

En modo MOCK el login no valida credenciales y las pantallas se alimentan de fixtures
(ver `lib/api.ts`, `hooks/useAuth.tsx` y las ramas MOCK de las API routes).
`NEXT_PUBLIC_MOCK_ROLE` puede ser `CLIENTE`, `CONDUCTOR` o `GERENTE`.

## Tests

```bash
npm test          # unit tests (Vitest)
npm run test:e2e  # tests end-to-end (Playwright, levanta la app en modo MOCK)
```

La primera vez, instalar el navegador de Playwright: `npx playwright install chromium`.

Detalle de la estrategia de calidad, casos cubiertos y pipeline: ver [`CALIDAD.md`](./CALIDAD.md).

## Flujo de trabajo (branches)

- Ramas de trabajo: `feature/nombre-feature` o `fix/nombre-bug`.
- Los Pull Requests van contra `development`.
- `development` se mergea a `main` para publicar a producción.
- El pipeline de CI corre en cada push/PR a `main` y `development`; el **deploy a
  producción solo ocurre en push a `main`** y únicamente si build, lint, unit tests
  y E2E pasaron (ver `.github/workflows/ci.yml`).

## Producción

Deploy en Vercel (proyecto `fleter`): https://fleter.vercel.app _(confirmar la URL
final en el dashboard de Vercel)_.
