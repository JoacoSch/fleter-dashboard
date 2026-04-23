# CLAUDE.md — Fleter Dashboard (Web)

## Qué es Fleter
Marketplace de fletes para PyMEs argentinas. Modelo tipo Uber: cliente solicita viaje, matching automático con fletero, seguimiento GPS, confirmación por QR, precio ajustado con datos GPS reales. Zona: CABA + GBA.

## Mi rol
**Dashboard web (Next.js).** Panel web para dos tipos de usuarios con focos distintos:
- **Cliente (PyME):** analytics histórico de sus fletes + (futuro) seguimiento de viaje activo
- **Gerente de empresa fletera:** recibir peticiones de viajes y distribuirlas entre su flota

El backend lo hace Persona 1 (Node.js + Express + PostgreSQL). El contrato de la API es la fuente de verdad.

## Stack
- **Framework:** Next.js (App Router)
- **Estilos:** Tailwind CSS (librería de componentes UI: por decidir)
- **Auth:** Firebase Auth — JWT en cookie httpOnly
- **Tiempo real (fase gerente):** Socket.io client
- **Pagos:** MercadoPago SDK (solo flujo frontend)

## Regla crítica
El frontend **nunca calcula nada**. Solo pide datos al backend y los muestra.

## Orden de desarrollo
| Fase | Qué es | Estado |
|---|---|---|
| F1-cliente | Auth + Dashboard analítico PyME (histórico de viajes y métricas) | **Prioridad 1** |
| F2-cliente | Viaje activo en tiempo real (banner + mapa) | Después de F1 |
| F3-gerente | Dashboard gerente: recibir y distribuir viajes | Después de F2 |
| F4-gerente-stats | Estadísticas históricas del gerente | Al final |

## Archivos de contexto
- `/tasks/F{N}/context.md` → tareas detalladas de cada fase
- `/stack/context.md` → decisiones técnicas
- `/model/context.md` → modelo de datos
- `/api-contracts/context.md` → endpoints REST y eventos Socket.io

## Flujo de trabajo por sesión en Claude Code
1. Leer este `CLAUDE.md`
2. Leer `/tasks/F{N}/context.md` de la fase en curso
3. `/add` solo los archivos de código relevantes a la subtarea
4. En sesiones largas, `/compact` al terminar
