# Videos del pitch — briefs para /brag

> Pitch de 10 min en formato ronda de inversores. Guion completo en el plan
> `~/.claude/plans/tengo-que-hacer-una-cozy-thacker.md`.
> Estos videos **se hacen por separado**: mientras no existan, en el deck hay una
> slide temporal rotulada **"VIDEO — placeholder"** en su lugar.

## Reglas comunes a los tres

- **Formato:** 16:9, 1920×1080, 30 fps, MP4. **Sin voz**: sólo música y texto en
  pantalla. El presentador no habla encima, salvo donde se indica.
- **Duración:** entre 20 y 30 s cada uno. No más.
- **Marca:** la paleta, la tipografía y el modo claro/oscuro salen de `app/tokens/*`
  (`colors.css`, `typography.css`, `dark.css`) y de `docs/design-system-v2.html`.
- **Honestidad.** El pitch no puede prometer lo que no existe:
  - La UI se muestra **estilizada y recreada**, nunca como screen recording de la app.
  - Sólo se ven funciones que **existen hoy**: pedir un viaje, asignar un chofer verificado,
    seguirlo en vivo con mapa, el dashboard de consumo y los comprobantes del mes
    con remito en PDF.
  - La **confirmación de entrega con foto del remito está en desarrollo**: si aparece,
    va rotulada "En desarrollo" (así está en el Video 2).
  - Se muestra el **modelo actual**: la PyME pide el viaje y Fleter lo asigna a un
    chofer verificado. **No** se muestra la carga de choferes propios ni la
    asignación directa a ellos: está en construcción. Se dice "Chofer asignado",
    nunca "Tu chofer de siempre".
  - Vocabulario: **choferes**, nunca "fleteros".
  - **No** se habla de marketplace ni de "conseguimos transportistas".
  - **No** se ridiculiza el registro a mano. El mensaje es *"es mucho trabajo y te
    cuesta tiempo"*, no *"está mal"*.
  - Ningún precio, cifra de mercado ni tracción inventados.
- **Lanzar:** correr `/brag` y pegar la sección completa del video.

---

## Video 1 — "El registro a mano" (~25 s)

**Dónde va:** Bloque 1. Abre la presentación, antes de que el presentador diga nada.
**Función:** hook. Hacer sentir el **tiempo** que se pierde administrando fletes a mano.
**Tono:** empatía. Muestra trabajo, no errores ni gente torpe.

| s | Visual | Texto en pantalla |
|---|---|---|
| 0–7 | Mensajes de chat que se apilan cada vez más rápido: "¿salió el camión?", "¿llegó?", "mandame foto del remito" | — |
| 7–13 | Una planilla que se completa a mano, una pila de remitos de papel y un reloj que avanza rápido | "Horas por semana, anotando fletes a mano." |
| 13–19 | Todos esos elementos se ordenan y se alinean en una sola pantalla limpia | "¿Y si eso se hiciera solo?" |
| 19–25 | Fondo limpio y el logo de Fleter | **Fleter** · "Tu logística, en un solo lugar." |

**Importante:** el frame final (el logo con la tagline) es **el mismo** que la slide
de cierre (Bloque 11B), así la presentación cierra el loop.

---

## Video 2 — "Un viaje, de punta a punta" (~30 s)

**Dónde va:** Bloque 5, después de la Solución y antes de las Funcionalidades.
**Función:** mostrar en 30 s cómo es un viaje en Fleter.
**Intro del presentador** (antes de darle play): *"Veamos cómo es un viaje en Fleter."*

Son cinco beats de unos 6 s, con UI estilizada:

| # | Beat | Visual | Texto en pantalla |
|---|---|---|---|
| 1 | Pedir | Un formulario donde el origen y el destino se completan solos, y se aprieta un botón | "Pedir viaje" |
| 2 | Asignar | Entra la card de un chofer verificado, con nombre, vehículo y avatar | "Chofer asignado" |
| 3 | Seguir | Un mapa donde se dibuja la ruta y un camión que avanza, con un banner de estado | "En camino" |
| 4 | Entregar | Un teléfono que saca la foto del remito firmado, seguido de un check verde | "Entrega confirmada" |
| 5 | Registrar | La card del viaje cae en la lista de comprobantes del mes y el total se actualiza | "Todo registrado" |

**Nota:** el beat 5 muestra un total del mes. En el producto ese total es
**informativo** (`OPEN.md` → D3), no una factura: no se lo llama "factura" ni
"liquidación".

---

## Video 3 — "Ya está construido" (~30 s)

**Dónde va:** después de las Funcionalidades, antes de la demo. Hace de **puente** al reveal
del producto real.
**Función:** pasar de la idea a "esto existe", y preparar el corte a la pantalla de
Facturación real.

| s | Visual | Texto en pantalla |
|---|---|---|
| 0–5 | Pantalla negra | "Esto no es sólo una idea." |
| 5–20 | Montaje rápido de mockups estilizados de las pantallas de la **PyME** (dashboard, viaje activo con mapa) y del **chofer** (sus viajes, el recorrido), flotando con algo de profundidad. En medio, el cambio de modo claro a oscuro | "Web · app del chofer · tiempo real · mapas" |
| 20–30 | Zoom hacia la pantalla de **Facturación** | "Ya lo estamos construyendo." Corta directo al reveal |

**No mostrar:** el panel del gerente ni el de la empresa fletera. Se sacaron de la
presentación porque no están lo bastante desarrollados. Tampoco el panel admin.
