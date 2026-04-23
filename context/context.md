# stack/context.md — Decisiones técnicas del Dashboard

## Framework: Next.js con App Router
- SSR para mejor carga inicial
- Rutas protegidas con middleware de Next.js (redirige a `/login` si no hay sesión)
- Deploy en Vercel

## Autenticación
- Firebase Auth: login, registro, Google OAuth
- JWT en **cookie httpOnly** (nunca localStorage)
- Middleware de Next.js verifica la cookie en cada ruta protegida
- Dos roles posibles en el JWT: `CLIENTE` | `GERENTE`
- El sidebar y las rutas disponibles cambian según el rol

## Comunicación con el backend
| Canal | Cuándo |
|---|---|
| API REST (fetch/axios) | Todo el dashboard analítico, auth, datos históricos |
| Socket.io client | Solo en F2 (viaje activo) y F3 (gerente recibe viajes en tiempo real) |

- Base URL backend: variable de entorno `NEXT_PUBLIC_API_URL`
- URL WebSocket: variable de entorno `NEXT_PUBLIC_WS_URL`

## Filtros de período (aplican a toda la capa analítica)
El usuario puede elegir entre tres modos:
- **Mensual:** selector de mes/año (ej: "Abril 2026")
- **Semanal:** selector de semana
- **Personalizado:** date picker de rango (fecha desde / fecha hasta)

El período seleccionado se manda al backend como query params: `?desde=ISO&hasta=ISO`

## Estilos
- Tailwind CSS — librería de componentes UI por decidir (candidatos: shadcn/ui, MUI)
- Sin CSS modules ni styled-components
- Gráficos: **no en MVP** — solo números y tablas

## Variables de entorno
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_MP_PUBLIC_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=       ← solo cuando se implemente el mapa (F2+)
```

## Estructura de carpetas
```
/app
  /layout.tsx
  /(auth)
    /login/page.tsx
    /registro/page.tsx
    /recuperar/page.tsx
  /(cliente)
    /layout.tsx                   → sidebar cliente, requiere rol CLIENTE
    /page.tsx                     → Dashboard analítico (F1)
    /viajes/page.tsx              → Listado de viajes con filtros
    /viajes/[id]/page.tsx         → Detalle de un viaje
    /viaje-activo/page.tsx        → Seguimiento en tiempo real (F2)
  /(gerente)
    /layout.tsx                   → sidebar gerente, requiere rol GERENTE
    /page.tsx                     → Viajes disponibles para distribuir (F3)
    /viajes/[id]/page.tsx         → Detalle + asignación de conductor/vehículo
    /estadisticas/page.tsx        → Stats históricas del gerente (F4)
/components
  /ui/                            → Botones, inputs, modales, tablas genéricas
  /analytics/                     → Cards de métricas, tabla de viajes
  /viajes/                        → Componentes de viaje (listado, detalle, estado)
  /gerente/                       → Componentes específicos del gerente
/lib
  /api.ts                         → Cliente HTTP con interceptores de auth
  /socket.ts                      → Singleton Socket.io (solo para F2 y F3)
  /firebase.ts                    → Init Firebase
/hooks
  /useAuth.ts
  /usePeriodo.ts                  → Hook del filtro de período compartido
  /useSocket.ts                   → Solo para fases con tiempo real
/middleware.ts                    → Protección de rutas + redirección por rol
```
