# C-28-09 — Contrato: `vencido`, tiempos por etapa y puntualidad en la llegada

> Formato de `context/tasks/_PLANTILLA.md`.

**Scope:** WEB
**Depende de:** ninguna
**Decisiones que toca:** D4 (sólo para excluir), D6 (sin cálculo nuevo)

## Objetivo

El cliente ve cuándo un viaje quedó colgado (pasó su hora sin avanzar), los tiempos
de carga, descarga y aproximación, y una puntualidad medida en la llegada al origen.

## Contexto necesario

Diff de `context/api-contracts/context.md` del 28-09: campo `vencido` en todos los
viajes, evento `viaje:vencido`, `duracion_carga` / `duracion_descarga` /
`duracion_aproximacion_origen`, `fecha_llegada_origen`. Cambios de significado:
`duracion_real` (desde la salida del origen) y `puntualidad_inicio` (en la llegada).
`viaje:iniciado` e `iniciar` ya no devuelven `puntualidad_inicio`.

## Archivos que toca

- `hooks/useViajeActivo.ts` — `viaje:iniciado` ya no pisa `puntualidad_inicio` con
  `undefined`; escucha `viaje:vencido`.
- `app/(cliente)/viajes/[id]/page.tsx` — badge, card "Tiempos por etapa", hints.
- `app/(cliente)/viajes/page.tsx` — badge en la lista.
- `lib/types-empresa.ts`, `lib/mocks-gerente.ts` — `iniciar` sin `puntualidad_inicio`.
- `app/globals.css` — `.badge-vencido`.

## Interfaces que expone

Ninguna nueva.

## Qué NO tocar

- **D4:** `409` de `cancelar-reserva`, `reservar`, `viajes-disponibles`, `viaje:aceptar`
  y `viaje:vencido` en el panel del gerente. Contrato leído, sin consumir.
- **D6:** no se suma "tiempo de peón" (carga + descarga): se muestran por separado.
- `lib/analytics-cliente.ts` ya ignora `null`; los viajes viejos quedan fuera de
  puntualidad y duración, sin cambios.

## Criterios de done

- [x] `tsc` y Vitest en verde
- [ ] Corre contra staging con `NEXT_PUBLIC_MOCK=false`
- [ ] Verificado que el backend devuelve `vencido` en `mis-viajes`
