# F1-cliente — Dashboard Analítico PyME

## Objetivo
El cliente (PyME) ve un resumen claro de sus gastos en fletes para el período seleccionado, y puede explorar el listado completo de viajes con detalle de cada uno.

## Subtareas

### F1-0: Scaffold y auth (prerequisito)
- [ ] `npx create-next-app@latest fleter-dashboard --typescript --tailwind --app`
- [ ] Estructura de carpetas según `/stack/context.md`
- [ ] Firebase Auth en `/lib/firebase.ts` + hook `useAuth`
- [ ] Middleware de rutas protegidas en `/middleware.ts` (redirige a `/login` sin sesión)
- [ ] Pantalla de login: email/password + Google OAuth
- [ ] Pantalla de registro de cliente
- [ ] Pantalla de recupero de contraseña
- [ ] Layout con sidebar (items: Dashboard, Mis viajes, Perfil)
- [ ] JWT en cookie httpOnly al hacer login

**Endpoints:** `POST /api/auth/login`, `POST /api/auth/registro-cliente`, `POST /api/auth/recuperar-password`

---

### F1-1: Selector de período (componente compartido)
- [ ] Componente `<SelectorPeriodo>` reutilizable en todo el dashboard
- [ ] Tres modos: Mensual | Semanal | Personalizado (date picker de rango)
- [ ] Guarda el período seleccionado en un hook `usePeriodo` (estado global o context)
- [ ] Al cambiar el período, todos los componentes que dependen de él se actualizan
- [ ] Default: mes actual

---

### F1-2: Cards de métricas (vista principal del dashboard)
Página `/app/(cliente)/page.tsx` — la primera pantalla que ve el cliente al entrar.

**Cards a mostrar:**
- [ ] **Total gastado** en el período (suma de `precio_final` de viajes ENTREGADO)
- [ ] **Cantidad de fletes** solicitados en el período
- [ ] **Costo promedio** por flete
- [ ] **Flete más caro** del período (monto + link al detalle)
- [ ] **Flete más barato** del período (monto + link al detalle)
- [ ] **Desglose por zona:** gasto en CABA / PROVINCIA / MIXTO
- [ ] **Alertas recibidas:** cantidad de desvíos y paradas sospechosas detectadas
- [ ] **Top 5 destinos frecuentes:** listado con dirección y cantidad de viajes

Todas las cards muestran un skeleton loader mientras cargan.

**Endpoint:** `GET /api/analytics/cliente/resumen?desde=&hasta=`

---

### F1-3: Tabla de viajes
Página `/app/(cliente)/viajes/page.tsx`

**Columnas de la tabla:**
- [ ] Fecha
- [ ] Origen → Destino
- [ ] Zona (CABA / PROVINCIA / MIXTO)
- [ ] Duración real (en minutos, formateado como "1h 20min")
- [ ] Costo estimado
- [ ] Costo final
- [ ] Ajuste (diferencia entre estimado y final, con color: verde si bajó, rojo si subió)
- [ ] Estado (badge de color)
- [ ] Alertas (ícono si el viaje tuvo alguna)
- [ ] Acción: "Ver detalle"

**Funcionalidades:**
- [ ] Filtro de período (el mismo `<SelectorPeriodo>`)
- [ ] Paginación (no scroll infinito — botones de página)
- [ ] Ordenamiento por columna: fecha, costo final, duración (click en header)
- [ ] Filas clickeables que llevan al detalle del viaje

**Endpoint:** `GET /api/viajes?desde=&hasta=&page=&limit=&orderBy=&order=`

---

### F1-4: Detalle de un viaje
Página `/app/(cliente)/viajes/[id]/page.tsx`

**Información a mostrar:**
- [ ] Fecha y hora del viaje
- [ ] Tipo de zona
- [ ] Lista de paradas en orden (con estado PENDIENTE / ENTREGADO y hora de entrega)
- [ ] Conductor asignado (nombre y calificación)
- [ ] Costo estimado vs costo final con desglose (precio base + fee de Fleter + ajuste)
- [ ] Duración real y km reales
- [ ] Historial de alertas del viaje (si las hubo): tipo, descripción, hora
- [ ] Botón "Descargar remito PDF" (si el viaje está ENTREGADO)

**Endpoint:** `GET /api/viajes/:id`

---

### F1-5: Perfil del cliente
Página `/app/(cliente)/perfil/page.tsx`

- [ ] Mostrar datos actuales: nombre, apellido, email, empresa, CUIT, dirección
- [ ] Formulario de edición inline (click en editar → campos habilitados)
- [ ] Guardar cambios

**Endpoints:** `GET /api/perfil`, `PUT /api/perfil`

---

## Criterio de completitud de F1
- El cliente puede loguearse y ver el dashboard con sus métricas
- Puede cambiar el período y todos los números se actualizan
- Puede ver la tabla de viajes, ordenarla y paginarla
- Puede entrar al detalle de cualquier viaje
- Las cards muestran skeleton mientras cargan (no pantalla en blanco)

## Archivos relevantes para esta fase
- `/stack/context.md`
- `/api-contracts/context.md` → secciones Auth, Perfil, Analytics Cliente
- `/model/context.md` → entidades Viaje, Parada, Transacción
