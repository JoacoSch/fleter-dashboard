# api-contracts/context.md — Contratos de API (Dashboard)

> Fuente de verdad: el backend (Persona 1). Si hay discrepancias, el backend manda.
> Todos los endpoints protegidos requieren header `Authorization: Bearer {accessToken}`.
> Filtros de período: query params `?desde=ISO8601&hasta=ISO8601`

---

## Auth

### POST /api/auth/login
```json
// Request
{ "email": "string", "password": "string" }
// Response 200
{ "accessToken": "string", "usuario": { "id", "nombre", "tipo": "CLIENTE|GERENTE" } }
```

### POST /api/auth/registro-cliente
```json
// Request
{ "nombre", "apellido", "dni", "email", "password", "celular", "direccion", "cuit?", "nombre_empresa?" }
// Response 201
{ "accessToken": "string", "usuario": { "id", "nombre", "tipo": "CLIENTE" } }
```

### POST /api/auth/recuperar-password
```json
{ "email": "string" }
// Response 200 — Firebase envía el email
```

---

## Perfil

### GET /api/perfil
```json
// CLIENTE response
{ "id", "nombre", "apellido", "email", "cuit?", "nombre_empresa?", "direccion" }
// GERENTE response
{ "id", "nombre", "apellido", "email", "empresas": [{ "id", "nombre" }] }
```

### PUT /api/perfil
```json
{ "nombre?", "apellido?", "direccion?" }
```

---

## Analytics — Cliente (F1)

### GET /api/analytics/cliente/resumen?desde=&hasta=
```json
// Response 200
{
  "total_gastado": number,
  "cantidad_viajes": number,
  "costo_promedio": number,
  "viaje_mas_caro": { "id": "string", "monto": number },
  "viaje_mas_barato": { "id": "string", "monto": number },
  "por_zona": { "CABA": number, "PROVINCIA": number, "MIXTO": number },
  "alertas_recibidas": number,
  "destinos_frecuentes": [{ "direccion": "string", "cantidad": number }]
}
```

### GET /api/viajes?desde=&hasta=&page=&limit=
```json
// Response 200 — listado paginado de viajes del cliente autenticado
{
  "viajes": [
    {
      "id", "fecha_programada", "estado",
      "origen": { "direccion" },
      "destino": { "direccion" },
      "tipo_zona",
      "precio_estimado", "precio_final?",
      "duracion_real_minutos?", "km_reales?",
      "alertas_count": number
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

### GET /api/viajes/:id
```json
// Response 200 — detalle completo de un viaje
{
  "id", "fecha_programada", "estado", "tipo_zona",
  "precio_estimado", "precio_final?", "duracion_real_minutos?", "km_reales?",
  "conductor": { "nombre", "calificacion_promedio" },
  "paradas": [{ "orden", "direccion", "estado", "fecha_entrega?" }],
  "transacciones": [{ "tipo", "monto_total", "fee_fleter", "created_at" }],
  "alertas": [{ "tipo", "descripcion", "timestamp" }]
}
```

---

## Viajes — Gerente (F3)

### GET /api/viajes/disponibles
```json
// Response 200 — viajes que la empresa puede tomar
{
  "viajes": [
    {
      "id", "fecha_programada", "tipo_zona",
      "precio_estimado",
      "origen": { "direccion" },
      "destino": { "direccion" },
      "requisitos": ["FRAGIL", "REFRIGERADO", ...]
    }
  ]
}
```

### POST /api/viajes/:id/asignar
```json
// Request
{ "conductor_id": "string", "vehiculo_id": "string" }
// Response 200
{ "viaje": { "id", "estado": "FLETERO_ASIGNADO", "conductor": { "nombre" }, "vehiculo": { "patente" } } }
```

### GET /api/empresas/:id/conductores
```json
// Response 200
{ "conductores": [{ "id", "nombre", "apellido", "calificacion_promedio", "vehiculos": [{ "id", "patente", "condiciones" }] }] }
```

---

## Analytics — Gerente (F4)

### GET /api/analytics/gerente/resumen?empresa_id=&desde=&hasta=
```json
{
  "total_facturado": number,
  "cantidad_viajes": number,
  "ingreso_promedio": number,
  "viajes_cancelados": number,
  "penalidades": number,
  "ranking_conductores": [{ "conductor_id", "nombre", "viajes_completados", "ingresos_generados" }],
  "vehiculo_mas_usado": { "id", "patente", "viajes_completados" }
}
```

### GET /api/analytics/gerente/viajes?empresa_id=&desde=&hasta=&page=&limit=
```json
{
  "viajes": [
    {
      "id", "fecha_programada",
      "conductor": { "nombre" },
      "vehiculo": { "patente" },
      "origen": { "direccion" },
      "destino": { "direccion" },
      "duracion_real_minutos?",
      "monto_cobrado": number
    }
  ],
  "total": number
}
```

---

## Eventos Socket.io — solo F2 y F3

### F2 — Cliente con viaje activo (escucha)
| Evento | Datos |
|---|---|
| `mapa:actualizar` | `{ lat, lng, timestamp }` |
| `viaje:estado_actualizado` | `{ estado }` |
| `alerta:desvio` | `{ descripcion }` |
| `viaje:finalizado` | `{ precio_final, ajuste }` |

### F3 — Gerente (escucha)
| Evento | Datos |
|---|---|
| `viaje:disponible` | `{ viaje }` — nuevo viaje que puede tomar la empresa |

### F3 — Gerente (emite)
| Evento | Cuándo |
|---|---|
| `join:empresa` | Al hacer login como gerente |
