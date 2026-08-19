# OPEN.md — Decisiones de producto

> **Si una tarea toca algo marcado ABIERTA, no se implementa. Se para y se pregunta.**

Este es el primer archivo que se lee en cada sesión, antes que `CLAUDE.md`.
Fecha: **12-08-2026**.

Una decisión CERRADA se puede implementar. Una ABIERTA no: falta un dato que no
está en el repo y que sale de clientes o de facturas reales. Escribir código
contra una decisión ABIERTA es escribir código que hay que tirar.

---

## D1 — SEGMENTO · ABIERTA

PyME industrial de AMBA con fleteros propios habituales.

**Falta:** el filtro operable definitivo — viajes/semana, tipo de carga, condición
de pago.

---

## D2 — CONVENCIÓN DE PRECIO · ABIERTA

Se mantienen **CABA por hora** y **PROVINCIA por km**. Se suman unidades
industriales: **por viaje contratado, por palet, por tonelada**.

Precio **fijo al confirmar**, con banda de **±15 %**; el desvío lo absorbe la
plataforma.

**Falta:** los números reales. Salen de facturas de clientes.

---

## D3 — COBRO · ABIERTA

**Cuenta corriente con transferencia bancaria**, no tarjeta por viaje.
MercadoPago queda **en cuestión** como medio principal.
La **liquidación unificada mensual** entra al MVP.

**Falta:** confirmar con clientes.

---

## D4 — POOL PRIVADO · CERRADA

Tres niveles:

1. **Flota propia del cliente** — core del MVP.
2. **Pool homologado por Fleter** — después.
3. **Marketplace abierto** — descartado.

Asignación **directa**, no "primero en aceptar".
Fee **fijo por viaje administrado** en el nivel 1; **porcentaje solo en el nivel 2**.

---

## D5 — CIERRE DEL VIAJE · CERRADA

**Sale el QR.** Incompatibilidad de mercado: Argentina opera con remito en papel.

**Entra:** foto del remito conformado + geolocalización + timestamp + validación
de GPS en radio del destino, generando un **comprobante PDF**.
