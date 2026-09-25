# Fleter Dashboard — Design System
> Destilado de Claude Design (app.jsx + styles.css + data.js) para uso en Claude Code.
> Este archivo es la única referencia de diseño que Claude Code necesita leer.

---

## Stack

- **Framework**: Next.js (React) — componentes funcionales, hooks estándar
- **Estilos**: CSS puro con custom properties (`var(--token)`). Sin Tailwind, sin CSS-in-JS.
- **Fuentes** (Google Fonts): `Archivo Black` (display/números grandes), `Manrope` (UI/body), `Josefin Sans` (accent/labels), `JetBrains Mono` (IDs, monospace)
- **Íconos**: componentes SVG propios (`FleterIcons.*`) — no usar librerías externas

---

## Design Tokens (CSS Custom Properties)

Definir en `globals.css` o en `:root` del layout principal.

```css
:root {
  /* Fondos */
  --bg: #FAF7F1;          /* warm off-white — fondo de app */
  --surface: #FFFFFF;     /* cards, panels */
  --surface-2: #F2EDE2;   /* sidebar, sunken areas */
  --surface-3: #ECE9E1;   /* hover states */

  /* Bordes */
  --line: #E8E4DA;        /* hairlines generales */
  --line-strong: #D9D3C5; /* bordes con más peso */

  /* Texto */
  --ink: #1B1A17;         /* texto primario */
  --ink-2: #4A463E;       /* texto secundario */
  --ink-3: #8C8676;       /* metadata, tertiary */
  --ink-4: #B8B2A2;       /* placeholder */

  /* Acento (naranja Fleter) */
  --accent: #E85D2A;
  --accent-ink: #B7431A;  /* hover del acento */
  --accent-soft: #FBE4D6; /* fondos suaves */
  --accent-softer: #FFF1E7;

  /* Status */
  --ok: #2F8F4E;          --ok-soft: #DCEFD8;
  --warn: #C98A12;        --warn-soft: #FBEFCE;
  --err: #B83232;         --err-soft: #F5D9D4;
  --info: #2E6FB7;        --info-soft: #D8E4F2;

  /* Radios */
  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 14px;

  /* Sombras */
  --shadow-card: 0 1px 0 rgba(27,26,23,.04), 0 1px 2px rgba(27,26,23,.04);
  --shadow-pop:  0 8px 28px rgba(27,26,23,.10), 0 2px 6px rgba(27,26,23,.06);

  /* Tipografía */
  --font-display: "Archivo Black", "Arial Black", sans-serif;
  --font-ui:      "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-accent:  "Josefin Sans", "Manrope", sans-serif;
  --font-mono:    ui-monospace, "JetBrains Mono", "Menlo", monospace;
}

/* Variantes de tema (warm es el default) */
.theme--warm { --bg: #FAF7F1; --surface: #FFFFFF; --surface-2: #F2EDE2; }
.theme--cool { --bg: #F7F8FA; --surface: #FFFFFF; --surface-2: #EEF1F4; --line: #E5E8EC; --line-strong: #D5DAE0; --ink-3: #7E8590; }
```

---

## Layout

```
┌─────────────────────────────────────────────────┐
│  sidebar (248px fijo)  │  main (flex: 1)        │
│                        │  ┌─ topbar (border-b)  │
│  brand                 │  └─ content (overflow) │
│  sidebar__new CTA      │                        │
│  nav items             │                        │
│  sidebar__history      │                        │
│  sidebar__user         │                        │
└─────────────────────────────────────────────────┘
```

```css
.app {
  display: grid;
  grid-template-columns: 248px 1fr;
  height: 100vh;
  overflow: hidden;
}
.main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.content {
  flex: 1;
  overflow: auto;
  padding: 24px 28px 48px;
}
```

---

## Componentes

### Sidebar

```css
.sidebar { background: var(--surface-2); border-right: 1px solid var(--line); }

/* Brand */
.brand-mark { width:28px; height:28px; border-radius:7px; background:var(--accent); color:#fff; font-family:var(--font-display); font-size:13px; }
.brand-name  { font-family:var(--font-display); font-size:18px; }
.brand-name em { color:var(--accent); font-style:normal; }

/* CTA button */
.sidebar__new {
  border: 1px solid var(--line-strong); border-radius: var(--radius);
  background: var(--surface); font-weight: 600; font-size: 13px;
}
.sidebar__new:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

/* Nav items */
.nav-item { border-radius:8px; color:var(--ink-2); font-size:13.5px; font-weight:500; }
.nav-item:hover { background: var(--surface-3); color: var(--ink); }
.nav-item.is-active { background:var(--surface); color:var(--ink); box-shadow:0 0 0 1px var(--line); }
.nav-item.is-active .nav-item__icon { color: var(--accent); }
.nav-item__count { background:var(--surface-3); border-radius:999px; font-size:11px; }
.nav-item.is-active .nav-item__count { background:var(--accent-soft); color:var(--accent-ink); }

/* History items */
.history-item { border-radius:8px; font-size:12.5px; color:var(--ink-2); }
.history-item:hover { background: var(--surface-3); }
.history-item.is-active { background:var(--surface); box-shadow:0 0 0 1px var(--line); }
.history-item__meta { font-size:11px; color:var(--ink-3); }
```

### Topbar

```css
.topbar {
  padding: 14px 28px;
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}
/* Breadcrumbs */
.topbar__crumbs { font-size:12.5px; color:var(--ink-3); gap:8px; }
.topbar__crumbs strong { color:var(--ink); font-weight:600; }

/* Period pill */
.period-pill {
  background:var(--surface); border:1px solid var(--line-strong);
  border-radius:999px; padding:6px 12px; font-size:12.5px; font-weight:600;
}
.period-pill__dot { width:6px; height:6px; border-radius:50%; background:var(--accent); }
```

### Cards

```css
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow-card);
}
/* Variantes */
.card--ink { background:var(--ink); color:#fff; border-color:var(--ink); } /* dark card */
.card--hero { background: linear-gradient(180deg, var(--surface) 65%, var(--accent-softer) 100%); }
```

### Métricas (KPI cards)

```css
.metric__label {
  font-size:11.5px; letter-spacing:0.06em; text-transform:uppercase;
  color:var(--ink-3); font-weight:600;
}
.metric__value {
  font-family:var(--font-display); font-size:32px;
  letter-spacing:-0.02em; line-height:1.05;
}
.metric__value sup { font-family:var(--font-ui); font-size:13px; color:var(--ink-3); }
.metric__hint { font-size:12px; color:var(--ink-3); margin-top:6px; }

/* Delta badge */
.delta { font-weight:600; font-size:11.5px; padding:2px 6px; border-radius:4px; }
.delta--up   { color:var(--ok);  background:var(--ok-soft); }
.delta--down { color:var(--err); background:var(--err-soft); }
```

### Botones

```css
.btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:7px 12px; border-radius:8px; font-size:12.5px; font-weight:600;
  border:1px solid var(--line-strong); background:var(--surface); color:var(--ink);
}
.btn:hover        { background:var(--surface-3); }
.btn--primary     { background:var(--accent); color:#fff; border-color:var(--accent); }
.btn--primary:hover { background:var(--accent-ink); border-color:var(--accent-ink); }
.btn--ghost       { border-color:transparent; background:transparent; }
.btn--ghost:hover { background:var(--surface-3); }
.btn--icon        { padding:7px; }
```

### Status badges

```css
.status {
  font-size:11px; font-weight:700; padding:3px 8px; border-radius:4px;
  letter-spacing:0.04em; display:inline-flex; align-items:center; gap:5px;
}
.status::before { content:""; width:5px; height:5px; border-radius:50%; background:currentColor; }

.status.ENTREGADO       { background:var(--ok-soft);   color:var(--ok); }
.status.EN_CURSO        { background:var(--info-soft);  color:var(--info); }
.status.CANCELADO       { background:var(--err-soft);   color:var(--err); }
.status.BUSCANDO_FLETERO { background:var(--warn-soft); color:var(--warn); }
```

### Zone tags

```css
.zone-tag { font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:4px; letter-spacing:0.05em; }
.zone-tag.CABA      { background:var(--info-soft); color:var(--info); }
.zone-tag.PROVINCIA { background:#EEEAE0;          color:var(--ink-2); }
.zone-tag.MIXTO     { background:var(--warn-soft); color:var(--warn); }
```

### Tabla de viajes (trip-row)

Grid de 8 columnas: `92px 1.6fr 1fr 110px 110px 110px 90px 28px`

```
ID monospace | Fecha | Ruta (origen→destino) | Zona tag | Status | Precio | Alertas | Chevron
```

```css
.trips-table { background:var(--surface); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; }
.trip-row { display:grid; grid-template-columns:92px 1.6fr 1fr 110px 110px 110px 90px 28px; gap:14px; padding:14px 16px; border-top:1px solid var(--line); cursor:pointer; }
.trip-row:hover { background:var(--surface-2); }
.trip-row__id { font-family:var(--font-mono); font-size:11.5px; color:var(--ink-3); }
```

### Timeline (detalle de viaje)

Grid de 3 columnas: `28px 1fr auto`

```css
.tl-marker__dot { width:12px; height:12px; background:var(--accent); border-radius:50%; border:3px solid var(--surface); box-shadow:0 0 0 1.5px var(--accent); }
.tl-marker__dot.done { background:var(--ok); box-shadow:0 0 0 1.5px var(--ok); }
.tl-marker__line { width:1.5px; background:var(--line-strong); }
```

### Section headers

```css
.section-header h2 { font-family:var(--font-display); font-size:28px; letter-spacing:-0.01em; }
.section-header p  { color:var(--ink-3); font-size:13px; }
```

---

## Grid system

12 columnas con gap 16px:

```css
.grid-12 { display:grid; grid-template-columns:repeat(12, 1fr); gap:16px; }
.span-3  { grid-column: span 3; }
.span-4  { grid-column: span 4; }
.span-5  { grid-column: span 5; }
.span-6  { grid-column: span 6; }
.span-7  { grid-column: span 7; }
.span-8  { grid-column: span 8; }
.span-12 { grid-column: span 12; }
```

Layout de analytics: `span-3` × 4 para KPIs, luego `span-8` + `span-4` para gráfico + breakdown.

---

## Tipografía — reglas de uso

| Rol | Token | Tamaño | Peso |
|-----|-------|--------|------|
| Números KPI grandes | `--font-display` | 32px | — |
| Títulos de sección | `--font-display` | 28px | — |
| Títulos de card | `--font-display` | 14px | — |
| Body / UI | `--font-ui` | 14px | 400 |
| Labels secundarios | `--font-ui` | 12–13px | 500–600 |
| IDs de viaje, patentes | `--font-mono` | 11–13px | — |
| Tags uppercase | `--font-ui` | 10–11px | 700, letter-spacing: 0.06em |

---

## Vistas del dashboard

| Vista | Componente Next.js | Descripción |
|-------|--------------------|-------------|
| `analytics` | `AnalyticsView` | KPIs + barras semanales + zonas + destinos frecuentes |
| `record` | `RecordView` | Tabla filtrable de todos los viajes |
| `detail` | `DetailView` | Timeline + conductor + alertas + transacciones |
| `active` | placeholder → F2 | Viaje en vivo con mapa |
| `facturacion` | placeholder → F6 | Comprobantes |

---

## Estructura de datos (shapes del API)

```typescript
// GET /api/viajes → ViajeResumen[]
interface ViajeResumen {
  id: string;            // "VJ-2419"
  fecha: string;         // ISO 8601
  origen: string;
  destino: string;
  tipo_zona: "CABA" | "PROVINCIA" | "MIXTO";
  estado: "ENTREGADO" | "EN_CURSO" | "CANCELADO" | "BUSCANDO_FLETERO";
  precio_estimado: number;
  precio_final: number;
  alertas_count: number;
  conductor: { nombre: string; calificacion: number; };
  vehiculo: { patente: string; tipo: string; };
}

// GET /api/viajes/:id → ViajeDetalle
interface ViajeDetalle extends ViajeResumen {
  duracion_estimada: number; // minutos
  duracion_real: number;
  km_reales: number;
  paradas: Parada[];
  alertas: Alerta[];
  transacciones: Transaccion[];
  carga: { descripcion: string; peso_kg: number; };
  vehiculo: { condiciones: string[]; credenciales: string[]; };
}

// GET /api/resumen?periodo=... → ResumenPeriodo
interface ResumenPeriodo {
  total_gastado: number;
  cantidad_viajes: number;
  costo_promedio: number;
  por_zona: { CABA: number; PROVINCIA: number; MIXTO: number; };
  alertas_recibidas: number;
  fletes_por_semana: { semana: string; viajes: number; gasto: number; }[];
  destinos_frecuentes: { direccion: string; cantidad: number; zona: string; }[];
  viaje_mas_caro: { id: string; monto: number; ruta: string; };
  viaje_mas_barato: { id: string; monto: number; ruta: string; };
}
```

---

## Formateo de datos

```typescript
// Pesos argentinos
const fmtARS = (n: number) =>
  "$" + Math.round(n).toLocaleString("es-AR");

// Fechas
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day:"2-digit", month:"short" });

// Iniciales de avatar
const initials = (name: string) =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
```

---

## Convenciones para Claude Code

- **CSS**: usar siempre `var(--token)` — nunca hardcodear colores
- **Componentes**: un archivo por vista (`AnalyticsView.tsx`, `RecordView.tsx`, `DetailView.tsx`)
- **Clases CSS**: BEM-ish con `__` para elementos (`trip-row__id`) y `--` para modificadores (`btn--primary`)
- **Estados activos**: clase `is-active` (no `active` ni `selected`)
- **Fuente de verdad de estado del viaje**: siempre del backend — el frontend solo muestra
- **No usar Tailwind** — el sistema ya tiene clases utilitarias propias

---

## Componentes y clases agregados el 15-09

> Sección "Feedback UX 15-09" al final de `app/globals.css`. Detalle de por qué en
> `docs/CAMBIOS-UX-15-09.md`. **Íconos:** el código real usa `lucide-react`, no
> `FleterIcons` (lo de arriba describe el prototipo).

| Componente / clase | Uso |
|---|---|
| `components/AuthShell.tsx` · `.auth-split` | Layout de auth de desktop: panel oscuro de marca + formulario. Prop `ancho` para formularios en secciones. |
| `components/Stepper.tsx` · `.stepper` | Barra de pasos (registro de conductor). |
| `.form-section`, `.form-grid`, `.form-grid--3`, `.form-actions` | Formularios largos agrupados por sección. |
| `.option-cards` / `.option-card.is-selected` | Elegir entre opciones con ícono y descripción (perfil, tipo de vehículo). |
| `components/PeriodoSelector.tsx` · `.periodo` | Único selector de período (Semana/Mes/Rango/Todo + flechas). |
| `.kpi`, `.progress`, `.delta--flat`, `.mini-stats` | KPIs con pie de variación. La variación de gasto va **sin color de juicio**. |
| `.bars--dual`, `.bar__tip`, `.leyenda` | Gráfico de barras doble (cantidad + monto) con tooltip. |
| `components/MapaRuta.tsx` · `.mapa-ruta` | Mapa de ruta para cualquier viaje. Si cae a línea recta, lo rotula. |
| `components/ContactoConductor.tsx` · `.contacto` | Teléfono visible + copiar + `tel:` + WhatsApp. No usar `tel:` solo. |
| `.route-stops` (`--grande`) | Origen/destino en dos líneas (calle / localidad) con `separarDireccion`. |
| `.vd`, `.vd__top`, `.vd__map`, `.stat-grid` | Detalle de viaje (cliente y conductor). |
| `components/conductor/TripCard.tsx` · `.trip-card` | Card de viaje del conductor: bloque de fecha/hora, ruta, km/duración, tarifa rotulada. |
| `.tabs` / `.tab.is-active` | Pestañas con contador. |
| `.fact-month`, `.fact-row` | Comprobantes por mes. |
| `components/conductor/VehiculoForm.tsx` · `.dropzone`, `.badge-proximo` | Alta de vehículo. `badge-proximo` marca funciones visibles que todavía no persisten. |
| `.empty-state`, `.note`, `.note--warn`, `.toast` | Estados vacíos que explican el porqué, notas y confirmaciones. |
| `.lp-*` (`styles/landing/`) | Capa propia de la landing pública (`app/(marketing)`): tema oscuro con scope `.lp`, independiente del conmutador. Rompe el sistema a propósito; sólo reutiliza la marca. |

**Reglas nuevas:**
- Un monto que no es lo que la persona cobra o paga de verdad **lleva rótulo**
  ("Tarifa del viaje · antes de la comisión de Fleter", "Informativo · no es una
  liquidación").
- Un dato que el backend no manda se muestra como "—" **con la aclaración**, nunca
  como un valor por defecto que parezca real (p. ej. "Sin alertas").
- `.page-title` / `.page-subtitle` nunca existieron en el CSS: los encabezados de
  página usan `.section-header`.

---

## Limpieza de estilos (15-09)

Se pasaron a clases los estilos inline que se repetían y se borró el CSS sin uso.
No toca las pantallas del gerente, `pedir-viaje`, `perfil` ni admin: siguen con
inline hasta que se rediseñen. **Regla:** inline sólo para valores calculados
(ancho de una barra, `height` de un gráfico, `minHeight` que llega por prop).

**Utilidades** (al final de `globals.css`):

| Clase | Reemplaza |
|---|---|
| `.page-narrow` / `.page-medium` / `.page-wide` | `maxWidth` 560 / 820–860 → **840** / 980–1000 → **1000** |
| `.stack`, `.stack--tight` | columna flex con `gap` 12 / 6 |
| `.cluster`, `.cluster--end` | fila flex con wrap y `gap` 8 (botones, chips) |
| `.muted` | `color: var(--ink-4)` para "—" y partes secundarias de un valor |
| `.error-text` | texto de error suelto (12,5 px, `--err`) |
| `.patente` | mono con `letter-spacing` (en `input` dentro de `.field` además va en mayúsculas) |
| `.skeleton` (+ `--row`, y alturas para `.trip-card`, `.vd__top`, `.fact-month`), `.skeleton-line` (`--valor`) | placeholders de carga armados a mano |

**Modificadores de componente:** `.btn--lg`, `.btn--danger`, `.back-link` (ghost
corrido −10 px; 16 px de margen dentro del auth), `.card--form`, `.card-head`,
`.section-header--wrap`, `.empty-state--solid`, `.empty-state__icon--ok`,
`.note--row`, `.leyenda__swatch--viajes/--gasto`, `.vd__price-block`,
`.vd__actions`, `.kv__texto`, `.trip-row__dur` (`--null`), `.fact-row__fecha`,
`.fact-row__error`, `.field__label-row`, `.auth-split__intro`, `.extreme__text`,
`.veh-card__body`, `.sidebar__nav--grow`, `.sidebar__new-plus`,
`.sidebar__user-anchor`, `.sidebar__user-info`, `.viaje-track__conductor-info`,
`.viaje-track__map-empty-icon`. `.btn` y `.auth-brand` ya no subrayan cuando son
`<a>`.

**Borrado por no tener uso** (estaba en el prototipo o quedó de versiones
anteriores; algunas secciones de arriba todavía lo describen): `.card--hero`,
`.btn--icon`, `.delta--up/--down` (la variación va sin color de juicio:
`.delta--flat`), `.detail*`, `.time-compare`/`.time-cell*`, `.alerts-strip*`,
`.bar__col`/`.bar__count` (quedan `.bar__col--viajes/--gasto`), `.cred`,
`.selector-periodo*`, `.date-range*`, `.section-controls`, `.card--col-between`,
`.chart-axis-label`, `.auth-layout`, `.auth-card`, `.auth-footer--mt*`,
`.field--error`, `.field__error`, `.trip-row__ajuste*`, `.trip-row__meta`,
`.trip-row__time`, `.trip-row__route-id/-sep`, `.trip-row__alert-icon`,
`.pagination__ellipsis`, `.sidebar__user-role`, `.sidebar__conductor-footer`,
`.viaje-track__call-btn`, `.viaje-track__cost-km`, `.viaje-track__stop-time`,
`.viaje-track__map-canvas--loading`.

**17-09:** se pasaron a clases los inline estáticos que quedaban en auth, PyME y
conductor (márgenes `.mt-*`/`.mb-*`, `.btn--block`, `.va-empty*`, `.mapa-fill`,
`.skeleton-card--alto`, entre otras; ver el final de `globals.css`). En esas
pantallas sólo queda inline lo calculado del panel (barras, zonas, progreso).
Gerente, `pedir-viaje`, `perfil` y admin entraron después, con la adopción del v2
(ver la sección siguiente).

**Colores:** el ámbar `#F59E0B` de la estrella en viaje activo pasó a `--warn`, y
el fondo del mapa de viaje activo usa `var(--line)` (mismo valor). Quedan escritos
a mano en el CSS los tonos de hover/borde de los colores soft (`#F8D8C2`,
`#C9E7C6`, `#BFDDBF`, `#8A5E0B`, `#EEEAE0`…), que no tienen token.

---

## Adopción del design system v2 (17-09)

Fuente: **`docs/design-system-v2.html`**. Los tokens viven en `app/tokens/*.css` y
se importan desde `app/globals.css`; el CSS de componentes del v2 está extraído en
`app/components-v2.css` pero **todavía no se importa**: se adopta por partes.

**Regla de espaciado y tipografía:** el espaciado usa la escala base 4
(`--sp-1..12`); 1, 2 y 3 px siguen permitidos para bordes y micro-ajustes. Ningún
texto baja de 11 px. Los tokens `--text-*` están disponibles para lo nuevo; los
tamaños viejos que no están en la escala se dejaron como estaban.

**Clases agregadas al pasar gerente, admin, pedir-viaje y perfil a clases:**

| Clase | Uso |
|---|---|
| `.input` (`--sm`, `--mono`, `select.input`, `:disabled`) | Campo fuera de `.field`. El gerente usaba `.input` desde siempre y **no existía**. La versión del v2 (alto fijo de 36 px) llega con los componentes. |
| `.stack--lg` (16) · `.stack--xs` (4) | Se suman a `.stack` (12) y `.stack--tight` (8). El espacio entre bloques sale del padre, no de un margen por hijo. |
| `.card-row` · `.card-foot` · `.bloque` · `.datos-grid` | Fila de card, pie con borde, separación entre secciones, ficha de datos. |
| `.error-banner--warn` | Mismo bloque de aviso en clave naranja. `.error-banner strong` mantiene el dato principal en tinta y 14 px. |
| `.reserva-timer` (`--urgente`) | Cuenta regresiva de la reserva del gerente. |
| `.texto-meta` · `.titulo-mono` · `.dato-valor` (`--mono`) | Texto secundario, título que es un identificador, valor de ficha. |
| `.status--ok` / `--err` | Estado que no es de viaje (empresa activa/inactiva). |
| `.card--destacada` · `.codigo-afiliacion` | Card del dato que la pantalla vino a mostrar. |
| `.recorrido*` | Recorrido **editable** de pedir viaje. La línea vertical es un `::before`, no un `<div>`. |
| `.autocomplete*` | Sugerencias de dirección. El hover lo hacía JavaScript. |
| `.topbar__empresa*` | Selector de empresa del gerente. |

**Cambios de comportamiento:** `.cluster` ahora centra verticalmente; `.admin-page`
apila con `gap` y por eso desaparecieron sus `marginTop: 16`. Se borró
`.admin-skeleton` con su animación: los placeholders usan `.skeleton`.

**Estilos inline:** de 298 a **23**, y los 23 son alturas de placeholder,
porcentajes calculados de barras y el color de cada serie del gráfico.

### Responsive y ancho de la sidebar

**Cortes.** Cuatro, todos en `globals.css` al final del archivo; **ninguna
pantalla agrega media queries propias**:

| Corte | Qué pasa |
|---|---|
| ≤ 1079 | Relleno de tablet. El detalle del viaje pasa a una columna. En la grilla de 12, `span-3` y `span-4` van a 6, y `span-5/7/8` a 12. La tabla del Record se desplaza dentro de su caja. El aside de auth se angosta. |
| ≤ 999 | `stat-grid` a dos columnas y la trip card reacomoda su lateral. |
| ≤ 899 | **Riel de íconos**: la sidebar pasa a `--sidebar-rail-w` (64) y se esconden textos, badges, recientes y datos de usuario. La manija desaparece. |
| ≤ 719 | Todo a una columna, relleno mínimo y el aside de auth se oculta. Sólo se garantiza que nada desborde: **no hay navegación mobile todavía**. |

**Por qué 900 y no el 1080 del documento.** La tabla del Record son nueve
columnas que suman 772 px con los gaps; con el relleno del contenido necesita
828, más la sidebar de 248 da 1076 px de ventana. Ese es el número del doc. Se
eligió 900 igual para que una laptop de 1024 conserve la sidebar con textos;
entre 900 y 1079 la tabla se desplaza dentro de su caja, que es la decisión de
producto (el Record sigue siendo tabla, no cards).

**Ancho ajustable.** `components/shells/AppShell.tsx` envuelve a los cuatro
paneles y es el único dueño de `--sidebar-w`. Todo el layout se deriva de esa
variable, así que el contenido acompaña solo. La manija del borde
(`.sidebar-handle`) arrastra entre **200 y 400 px**, doble click vuelve a 248,
las flechas mueven de a 16 y `Home` restablece; el valor se guarda en
`localStorage` con el mismo patrón que `hooks/useEmpresa.tsx`. Debajo de 900 el
ancho manual se ignora: manda el riel.

Dos cosas que no son obvias y conviene no "simplificar": el ancho **no** es
estado de React (arrastrar re-renderizaría el panel entero en cada movimiento) y
el indicador de "estoy arrastrando" vive en un ref, porque si sale del estado se
pierden los `pointermove` que llegan antes del re-render.

**Admin quedó fuera del responsive**: es herramienta interna y se mira en
desktop.

## Marca: isotipo y dónde va (24-09)

El logo es el isotipo «Carga» (seis cajas en una F; la oscura, en la punta del brazo
largo, es la carga que se sigue) más el nombre «Fleter.» en Archivo Black con el punto
naranja. Se usa el componente **`components/Isotipo.tsx`** (SVG inline), nunca un
cuadrado con una "F" de texto.

| Dónde | Cómo |
|---|---|
| Sidebar de los cuatro paneles (`components/shells/*Shell.tsx`) | `<Isotipo />` + `.brand-name` |
| Auth: aside y versión mobile (`components/AuthShell.tsx`) | Igual. El aside es oscuro en tema claro y crema en tema oscuro: la caja sigue su fondo |
| Landing: navbar, footer e isotipo animado del cierre (`components/landing/**`) | Las seis cajas se estiban al entrar en pantalla |
| Pestaña del navegador y iOS | `app/icon.svg` (ícono de app), `app/favicon.ico`, `app/apple-icon.png` (cuadrado, sin esquinas transparentes) |
| Imagen al compartir | `app/(marketing)/opengraph-image.png` y `twitter-image.png` (1200×630) |
| Otros usos (mails, documentos) | `public/logo/*.svg` (isotipo, `-dark`, `-mono`, `app-icon`, `app-icon-dark`) |

**Reglas:** el naranja no cambia nunca; la caja oscura pasa a `#F4F0E7` sobre fondos
oscuros (`.isotipo__k`); mínimo 16 px; sin rotar, sin sombra, sin degradado. El
eslogan («Tu logística, de punta a punta.») va en auth y landing, no en el sidebar ni
dentro del producto.

**Fuente:** `~/Developer/fleter-mobile/assets/logo/`. Los SVG originales traen un bloque
`<metadata>` con credenciales C2PA (~8 KB); se lo sacó al copiarlos. No existen todavía
`logo-horizontal.svg` ni `app-icon-orange.svg` (los que lista `docs/design-system-v2.html`):
el lockup horizontal se arma con `<Isotipo />` + `.brand-name`.
