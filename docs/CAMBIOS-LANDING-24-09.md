# Landing pública — sesión del 24-09-2026

> Branch `feat/landing` (worktree `../fleter-landing`), ya mergeada a `main` y
> desplegada. Registro de qué se hizo, con qué criterio y qué quedó pendiente o
> **inferido**. Fuente de contenido: `Fleter-Informe-landing-page_1.pdf` (raíz del
> repo, sin trackear).

## Decisiones de la sesión

| Tema | Decisión |
|---|---|
| Ruta | La landing reemplaza el placeholder de `/`. El login queda en `/login` (el informe decía `/ingresar`; no se movió). |
| Design system | Se rompe a propósito **sólo en la landing**: tema oscuro propio con scope `.lp`, independiente de `data-theme`. Se conserva la marca (naranja `#E85D2A`, tinta, crema, las cuatro tipografías, voseo es-AR). |
| Videos | Sin Higgsfield (no se puede usar). Todo el "cine" es código: escena WebGL + scroll. Los clips con HyperFrames quedan como fase 2 opcional. |
| Stack | "Lo más wow primero": `three` + `@react-three/fiber` + `@react-three/drei` + `gsap` (ScrollTrigger) + `lenis`. Escalera de fallback si falla: híbrido (un shader OGL + MP4) → video-first (HyperFrames + Motion). No hizo falta bajar. |
| Aislamiento | Git worktree aparte, para no pisar el working dir ni el dev de :3000. |
| Alcance del merge | Se mergeó `feat/landing` completa a `main`, **incluido `feat/design-system-v2`** (8 commits del rediseño de los cuatro paneles) que la branch arrastraba. Decisión del usuario. |
| Deploy | `vercel.json` desactiva el deploy automático de `main`: se subió a mano con `vercel --prod`. Fueron los **primeros deploys de producción** del proyecto (antes sólo había previews). |

## Qué se construyó

Diez secciones del informe, en orden, con su copy:

| # | Sección | Cómo |
|---|---|---|
| 1 | Hero | Escena r3f: camión low-poly por una autopista de noche → cámara cenital → mapa crema con ruta naranja y punto pulsante. Conducida por scroll (sticky de 320vh). Póster CSS si no hay WebGL o hay `prefers-reduced-motion`. |
| 2 | Problema | Chat, planilla y remito se ordenan solos con el scroll (`--p`). |
| 3 | Cómo funciona | Sticky de 4 pasos; `data-step` elige la escena del dispositivo. |
| 4 | Producto | Tres columnas: dashboard (SVG con grilla y ejes en $), facturación (reglas que rotan + comprobante), app del conductor. |
| 5 | Plataforma | Laptop + celular con parallax. |
| 6 | Funciones | 11 chips con panel (carrusel con scroll-snap). |
| 7 | Métricas | Cuatro cifras de **producto**, sin números inventados. |
| 8 | Empezar | Timeline de 4 pasos que se dibuja con el scroll. |
| 9 | FAQ | Acordeón nativo (`details`). |
| 10 | Cierre | Titular por palabras, ruta en perspectiva, `Empezar` + `Contacto`, footer. |

Un solo CTA primario, **Empezar** (navbar, hero, cierre), que abre `/contacto` en
otra pestaña; `Acceder` va a `/login`. `/contacto` es un **placeholder**: la página
con formulario sigue pendiente.

### Arquitectura

| Qué | Dónde |
|---|---|
| Route group, layout (nav, tema, smooth scroll) y páginas | `app/(marketing)/` |
| Secciones (server salvo las que usan scroll/estado) | `components/landing/sections/` |
| Scroll y motion: `Stage` (convierte scroll en `--p` y `data-step` sin re-render), `SmoothScroll` (Lenis + ScrollTrigger), `RevealObserver`, `CountUp` | `components/landing/fx/` |
| WebGL: `HeroScene` (r3f), `HeroCanvas` (lazy, pausa fuera de pantalla, error boundary, póster) | `components/landing/three/` |
| CTA, titulares | `components/landing/ui/` |
| Estilos (capa propia, prefijo `lp-`) | `styles/landing/*.css` |

Se borró `app/page.tsx` y el bloque `.landing` de `app/globals.css`.
`proxy.ts` ahora también deja pública `/contacto`.

## Skills usadas

Se investigaron e instalaron **sólo en el worktree** (sin hooks, `~/.claude` intacto):

| Skill | Veredicto | Uso |
|---|---|---|
| Emil Kowalski (`animate`, `review-animations`, …) | Aplica | Criterio de motion: ease-out exponencial, hover sólo con `(hover: hover)`, reduced-motion. |
| Impeccable | Aplica | "Craft floor": sacó los eyebrows numerados, las entradas idénticas por sección y limitó el display a 6rem. Su detector offline quedó en **0 hallazgos** (había 1: `max-height` animado). |
| Taste (`design-taste-frontend`) | Parcial | Sólo como referencia; sus supuestos de stack se ignoraron. |

`PRODUCT.md`, `.claude/` y `skills-lock.json` quedaron **sin commitear** en el worktree.

## Lo que se infirió (revisar)

- **Respuestas del FAQ:** el informe trae las 5 preguntas, no las respuestas. Las redactó la sesión.
- **"En desarrollo"** en el paso 4 (foto del remito), por la regla del pitch (`docs/pitch/VIDEOS-BRAG.md`). Se saca cuando el flujo funcione.
- "Liquidación" → **"facturación"** en una métrica (D3 sigue abierta) y "Record" → **"Registro"** en los chips (sin jerga en inglés).
- **Datos del mockup:** `VJ-2419`, Burzaco → Tortuguitas, "Martín R.", "AB 123 CD", $1.284.500 y 37 viajes son de ejemplo (los del informe), no de clientes.
- `PRODUCT.md` se escribió desde el informe, **sin** la entrevista que pide Impeccable.

## Verificación (honesta)

| Qué | Resultado |
|---|---|
| `tsc`, `eslint` (app, components, lib, hooks, proxy, tests), `vitest` (18) | OK, también sobre el merge combinado |
| `next build` (MOCK) | OK; `/` sale estática |
| Recorrido en Chrome a 1568 px y en 390 px (iframe) | Las diez secciones se ven; sin scroll horizontal en móvil |
| Consola | Sólo avisos: `NoApiKeys` de Google Maps (el worktree no tenía `.env`) y `THREE.Clock` deprecado (interno de r3f) |
| Producción (`fleter-mu.vercel.app`) | `/`, `/contacto`, `/login` → 200; `/panel` → 307 sin sesión. **No se abrió en un navegador.** |
| e2e Playwright | Actualizado (`auth.spec.ts`: tres `Empezar` con `target=_blank` y `Acceder` → `/login`) pero **no corrió**: faltan los navegadores en la máquina |
| FPS / celular real | **No medido.** Si va justo, el plan de bajada es el nivel híbrido |

Las capturas del recorrido salían a mitad de transición (el tab se throttlea); la
estructura se confirmó con una segunda captura.

## Incidente

Al desplegar por primera vez, `/contacto` devolvía **307 → /login** porque no
estaba en `PUBLIC_PATHS` de `proxy.ts`: los tres botones "Empezar" caían en el
login. En MOCK no se notó. Corregido en `130b08b` y redeployado. Lección: probar
las rutas públicas contra el build de producción, no sólo en MOCK.

## Marca y proxy (mismo día, más tarde)

- **Logo real** (isotipo «Carga» + «Fleter.») en el sidebar de los cuatro paneles, el auth, la landing (navbar, footer, cierre animado y `/contacto`), favicon, ícono de iOS e imagen para compartir. Componente `components/Isotipo.tsx`; reglas y archivos en `context/design-system.md` → «Marca: isotipo».
- **Bug de tema oscuro:** el aside del auth se vuelve crema y la caja de la punta quedaba invisible; ahora sigue el fondo real.
- **Incidente 2:** tras el deploy, `/icon.svg`, `/apple-icon.png`, la imagen Open Graph y `/logo/*.svg` devolvían 307 al login (el matcher de `proxy.ts` sólo exceptuaba `favicon.ico`). Se extendió el matcher a extensiones de imagen; las rutas de la app siguen detrás del proxy. Lección: al agregar archivos públicos, probarlos con `curl` sin cookie.

## Pendiente

- Página `/contacto` con formulario (hoy placeholder) y flujo de la entrevista.
- Verificar en un navegador contra producción y medir rendimiento en un celular real.
- Correr el e2e (`npx playwright install`).
- Clips MP4 con HyperFrames (fase 2 opcional) y capturas reales del dashboard para "Plataforma".
- Open Graph / imagen social y Lighthouse mobile (el informe pide >90).
- `GoogleMapsProvider` del layout raíz también se monta en la landing (no la usa): evaluar sacarlo de ahí.
- Migrar `Clock` → `Timer` cuando r3f lo haga.
- Reglas de `eslint` del compilador de React: `HeroScene.tsx` desactiva `react-hooks/immutability` a propósito (r3f muta dentro de `useFrame`).
