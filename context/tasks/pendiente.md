# Pendientes de datos para el dashboard

Estas secciones muestran placeholders porque la API/backend aún no provee los datos necesarios.

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
