# model/context.md — Modelo de datos (perspectiva dashboard)

## Entidades que el dashboard consume

### Usuario
```
id, nombre, apellido, email, tipo: CLIENTE | GERENTE
```

### Cliente (extiende Usuario)
```
cuit?, nombre_empresa?, direccion
```

### Empresa (administrada por Gerente)
```
id, nombre, gerente_id, conductores[], vehiculos[]
```

### Viaje — entidad central
```
id
cliente_id
conductor_id?          → null hasta asignación
empresa_id?            → null si lo toma un independiente
vehiculo_id?
tipo_zona              → CABA | PROVINCIA | MIXTO
fecha_programada       → ISO8601
estado                 → ver tabla de estados
precio_estimado
precio_final?          → null hasta cierre
duracion_real_minutos? → calculado al cierre
km_reales?             → calculado al cierre (Provincia/Mixto)
paradas[]
alertas[]              → desvíos y paradas sospechosas detectadas
```

### Estados del viaje
| Estado | Descripción |
|---|---|
| BUSCANDO_FLETERO | Publicado, sin asignar |
| FLETERO_ASIGNADO | Conductor asignado, aún no inició |
| EN_CURSO | Cualquier estado activo (llegando, cargando, en camino, etc.) |
| ENTREGADO | Todas las paradas confirmadas por QR |
| CANCELADO | Cancelado por cliente o fletero |

### Parada
```
id, viaje_id, orden, direccion, lat, lng, estado: PENDIENTE | ENTREGADO, fecha_entrega?
```

### Transacción
```
id, viaje_id
tipo          → COBRO_INICIAL | AJUSTE | PENALIDAD
monto_total
fee_fleter
monto_neto_conductor
created_at
```

### Vehículo (relevante para gerente)
```
id, patente, tipo, empresa_id, conductor_id?
condiciones[] → FRAGIL | REFRIGERADO | CARGA_PESADA | PELIGROSO | VOLUMINOSO
```

### Conductor (relevante para gerente)
```
id, nombre, apellido, calificacion_promedio, vehiculos[]
```

---

## Datos que el backend agrega para analytics

El backend expone endpoints de resumen que el dashboard consume directamente — no calcula nada en el frontend.

### Resumen del cliente para el período
```json
{
  "total_gastado": number,
  "cantidad_viajes": number,
  "costo_promedio": number,
  "viaje_mas_caro": { id, monto },
  "viaje_mas_barato": { id, monto },
  "por_zona": { "CABA": number, "PROVINCIA": number, "MIXTO": number },
  "alertas_recibidas": number,
  "destinos_frecuentes": [{ direccion, cantidad }]
}
```

### Resumen del gerente para el período (F4)
```json
{
  "total_facturado": number,
  "cantidad_viajes": number,
  "ingreso_promedio": number,
  "viajes_cancelados": number,
  "penalidades": number,
  "ranking_conductores": [{ conductor_id, nombre, viajes, ingresos }],
  "vehiculo_mas_usado": { id, patente, viajes }
}
```
