# Pendientes de datos para el dashboard

> Revisado el **19-08-2026**. Antes de tomar algo de acá, leer `OPEN.md`: varios de
> estos huecos dependen de decisiones ABIERTAS (D2 precio, D3 cobro) y no se
> implementan hasta que cierren.

Estas secciones muestran placeholders porque la API/backend aún no provee los datos
necesarios. **Este archivo es la lista para pasarle al backend**: cada ítem dice qué
falta, dónde se nota en el front y qué habría que agregar.

---

## Analytics

### Métricas con delta (% vs período anterior)
- **Qué falta:** El endpoint de resumen no devuelve datos del período anterior para calcular variación.
- **Dónde:** Cards de "Total gastado", "Fletes solicitados", "Costo promedio" — el `.metric__hint` con badge verde/rojo.
- **Solución futura:** Agregar `periodo_anterior: { total_gastado, cantidad_fletes, costo_promedio }` al response del resumen.

### Ruta en "Flete más caro / más barato"
- **Qué falta:** El endpoint solo devuelve `{ id_viaje, monto }`, sin la ruta formateada (origen → destino).
- **Dónde:** Cards `.extreme` debajo del precio — campo `.extreme__route`.
- **Solución futura:** Agregar `ruta: string` al objeto `flete_mas_caro` y `flete_mas_barato` en el response.

### Desglose de alertas (X desvíos · Y paradas sospechosas)
- **Qué falta:** El endpoint solo devuelve el count total de alertas, sin desglose por tipo.
- **Dónde:** Card "Alertas recibidas" — texto descriptivo debajo del número.
- **Solución futura:** Agregar `alertas_por_tipo: { DESVIO: number, PARADA_SOSPECHOSA: number }` al resumen.

### Botón "Revisar último alertado"
- **Qué falta:** No tenemos el ID del último viaje con alerta en el response del resumen.
- **Dónde:** Card "Alertas recibidas" — botón de acción.
- **Solución futura:** Agregar `ultimo_viaje_alertado: number | null` al resumen.

---

## Creación de viaje

### ~~`zona` hardcodeada a `"CABA"`~~ — RESUELTO
- El backend deriva la `zona` de las coordenadas de las paradas (polígono oficial de CABA,
  `booleanPointInPolygon`). El campo `zona` del body **se acepta pero se descarta**.
- El front ya no lo manda y muestra la zona que devuelve el backend al crear el viaje.

### `duracion_real` y `alertas_count` no vienen en `GET /api/viajes/mis-viajes`
- **Qué falta:** el contrato no incluye esos campos, pero el historial ordena por
  `duracion_real` y tiene un filtro "Con alertas" que usa `alertas_count`. El resumen de
  analytics también suma `alertas_count`.
- **Dónde:** `app/(cliente)/viajes/page.tsx` (columna "Duración" y filtro) y
  `app/api/analytics/cliente/resumen/route.ts`.
- **Estado:** no rompe — están tipados como opcionales con fallback (`?? null` / `?? 0`), así
  que la columna queda vacía y el filtro no devuelve nada.
- **Solución futura:** agregar ambos campos al response de `mis-viajes`.

---

## Gerente (estructura jerárquica)

> **NO VERIFICADO.** Los tres gaps que había acá (no existía `viajes-disponibles`,
> `/api/empresas/:id/viajes` no traía `condiciones_req`, y el gerente no podía leer
> `GET /api/viajes/:id`) figuran como resueltos por el fix del backend de agosto 2026,
> y el front está escrito para consumirlos.
>
> Lo verificable acá es solo eso: que el código existe y compila. **Todo el panel de
> gerente corre contra `lib/mocks-gerente.ts`**, así que ninguna de las tres cosas se
> probó contra el backend real. Que el mock responda no prueba que el endpoint exista.
>
> Para pasar esto a VERIFICADO hay que correr el panel con `NEXT_PUBLIC_MOCK=false`
> contra staging.

### `costo-acumulado` y `remito` siguen cerrados al gerente
- **Qué falta:** el fix abrió `GET /api/viajes/:id` al `GERENTE` de la empresa dueña, pero no
  hizo lo mismo con sus dos endpoints hermanos: `GET /api/viajes/:id/costo-acumulado` y
  `GET /api/viajes/:id/remito` siguen siendo `CLIENTE` o `CONDUCTOR`. Parece un olvido más que
  una decisión.
- **Consecuencia:** el gerente no puede ver el costo en vivo ni descargar el remito de un viaje
  hecho por su propia flota.
- **Solución futura:** aplicar en ambos la misma regla de acceso que ya tiene `/api/viajes/:id`.

### El gerente no puede ver el detalle de un viaje del mercado abierto
- **Qué falta:** `id_empresa` se setea recién al **reservar**, así que un viaje en
  `BUSCANDO_CONDUCTOR` tiene `id_empresa: null` y el gerente cae en el `403` de
  `GET /api/viajes/:id`. Decide la reserva sin poder ver la `ruta_planeada`.
- **Estado:** no bloquea. `GET /api/empresas/:id/viajes-disponibles` trae paradas con
  coordenadas, cliente, descripción y condiciones, que alcanza para decidir.
- **Dónde:** `app/(gerente)/gerente/viajes/[id]/page.tsx` — la llamada a `/api/viajes/:id` es
  best-effort (`.catch(() => null)`) justamente por esto.

### `GET /api/empresas/:id/viajes` sigue sin schema documentado
- **Qué falta:** es una línea de prosa en la sección de resumen del contrato, sin JSON de
  ejemplo, pese a ser el endpoint más usado del panel de gerente.
- **Consecuencia:** los campos que el front consume de ahí —`fecha_reserva` (countdown de la
  reserva), `id_vehiculo` (default del selector) y `precio_real`— están **inferidos**, no
  documentados. Si cambian de nombre o desaparecen, se rompe en silencio.
- **Solución futura:** documentarlo con el mismo formato que el resto de los endpoints.

---

## Inconsistencias del contrato (no bloquean, pero conviene confirmar)

### `viaje:finalizado` y `desglose_estimado` no muestran las magnitudes facturadas
- La sección "Cómo se factura cada zona" dice que `tiempo_capital` / `distancia_provincia`
  aparecen también en el evento `viaje:finalizado` y se persisten al cerrar el viaje, pero ni el
  payload de ese evento ni el `desglose_estimado` de `POST /api/viajes` los incluyen en sus
  ejemplos.
- **Estado:** tipados como opcionales en `hooks/useViajeActivo.ts`. Si vienen, se muestran.

---

## Detail (viaje individual)

### Duración estimada
- **Qué falta:** El endpoint `/api/viajes/:id` no devuelve `duracion_estimada`, solo `duracion_real`.
- **Dónde:** Card "Tiempo del viaje" — celda "Estimado" del time-compare.
- **Solución futura:** Exponer `duracion_estimada` en el detalle del viaje.

### Vehículo
- **Qué falta:** El endpoint de detalle no devuelve datos del vehículo asignado.
- **Dónde:** Card "Vehículo" en la columna derecha del detalle.
- **Solución futura:** Agregar `vehiculo: { patente, tipo, condiciones[], credenciales[] }` al detalle del viaje.

### Ayudante
- **Qué falta:** No hay datos de ayudante en el response.
- **Dónde:** Card "Chofer y equipo" — sección del ayudante.
- **Solución futura:** Agregar `ayudante: { nombre, rol } | null` al detalle.

### Transacciones
- **Qué falta:** No existe endpoint de historial de cobros por viaje.
- **Dónde:** Card "Resumen de cobro" actualmente muestra estimado vs final manual. Eventualmente debería ser una lista de transacciones reales.
- **Solución futura:** Endpoint o campo `transacciones: [{ tipo, monto, fecha, motivo }]` en el detalle del viaje.

### Carga (descripción y peso)
- **Qué falta:** El detalle no incluye datos de la carga (`descripcion`, `peso_kg`).
- **Dónde:** KV grid en card "Tiempo del viaje".
- **Solución futura:** Agregar `carga: { descripcion: string, peso_kg: number }` al detalle.

---

## General

### Zona en `por_zona` como montos ARS
- **Estado actual:** `por_zona: { CABA, PROVINCIA, MIXTO }` devuelve **cantidad de viajes**, no gasto en pesos.
- **Dónde:** Card "Desglose por zona" en Analytics — actualmente muestra cantidad.
- **Solución futura:** El backend debería agregar `gasto_por_zona` con totales en ARS para mostrar el breakdown correcto.
