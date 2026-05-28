# Fleter Dashboard — Documentación del Proyecto

> Última actualización: mayo 2026

---

## 1. Qué es Fleter

**Fleter** es un marketplace de fletes que conecta tres tipos de usuario:

- **Cliente** — empresas o personas que necesitan transporte de carga
- **Conductor** — choferes que aceptan y realizan los viajes
- **Gerente** — operadores internos que administran la plataforma

El frontend vive en este repo. El backend es un servicio externo hosteado en Railway que expone una API REST + WebSockets. La comunicación en tiempo real (panel del conductor) usa Socket.io.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 |
| UI | React 19, CSS puro con variables |
| Auth | Firebase Authentication |
| Real-time | Socket.io Client |
| Tipografías | Archivo Black, Manrope, Josefin Sans, JetBrains Mono |
| Deploy | Vercel |
| Backend | Railway (externo, no en este repo) |

---

## 3. Arquitectura general

```
fleter-dashboard/
├── app/
│   ├── (auth)/          ← login, registro cliente/conductor, recuperar contraseña
│   ├── (cliente)/       ← dashboard del cliente (pedir viaje, historial, detalle)
│   ├── (conductor)/     ← panel del conductor (viajes disponibles, mis viajes)
│   ├── (gerente)/       ← panel del gerente (en desarrollo)
│   └── api/auth/cookie/ ← API route para setear la cookie HTTP-only
├── components/          ← componentes reutilizables (SelectorPeriodo)
├── hooks/               ← useAuth, usePeriodo, useSocket
├── lib/                 ← api.ts, firebase.ts, config.ts, utils.ts
└── context/             ← documentación del proyecto
```

### Route groups de Next.js

Los paréntesis en los nombres de carpeta (`(auth)`, `(cliente)`, etc.) son **route groups** de Next.js App Router. No afectan la URL — solo sirven para organizar layouts distintos por rol sin que el nombre del grupo aparezca en la ruta.

Por ejemplo:
- `app/(cliente)/pedir-viaje/page.tsx` → URL: `/pedir-viaje`
- `app/(conductor)/conductor/page.tsx` → URL: `/conductor`

Cada grupo tiene su propio `layout.tsx` con el sidebar correspondiente a ese rol.

---

## 4. Autenticación

### Flujo completo

1. El usuario ingresa email/password (o Google OAuth) en `/login`
2. Firebase Auth valida las credenciales y devuelve un **ID Token** (JWT firmado por Google)
3. El frontend llama a `/api/auth/cookie` (API route de Next.js) para guardar el token en una **cookie HTTP-only**
4. Luego llama a `GET /api/auth/me` en el backend con el token en el header `Authorization: Bearer <token>`
5. El backend verifica el token con Firebase Admin y devuelve el perfil del usuario (nombre, apellido, rol, etc.)
6. El frontend redirige según el rol:
   - `CONDUCTOR` → `/conductor`
   - `GERENTE` → `/gerente`
   - `CLIENTE` → `/` (dashboard)

### Decisión de diseño: `browserSessionPersistence`

Firebase está configurado con `browserSessionPersistence`. Esto significa que la sesión **se borra cuando se cierra la pestaña** (no persiste entre sesiones del browser).

**Por qué:** evita contaminación cross-tab. Si tenés un conductor en una pestaña y un cliente en otra, con persistencia normal Firebase compartiría el estado de auth entre pestañas. Con session persistence cada pestaña tiene su propia sesión independiente.

### `useAuth.tsx`

Context global que expone:
- `user` — el objeto Firebase User (o null)
- `profile` — los datos del usuario del backend (nombre, rol, empresa, etc.)
- `role` — string con el rol: `"CLIENTE"`, `"CONDUCTOR"`, `"GERENTE"`, `"ADMIN"`
- `loading` — boolean mientras se resuelve el estado inicial

Métodos:
- `login(email, password)` — auth con email/password, retorna el rol
- `loginWithGoogle()` — OAuth con Google, retorna el rol
- `logout()` — cierra sesión Firebase y borra la cookie
- `register(data)` — registro de cliente
- `registerConductor(data)` — registro de conductor
- `sendRecovery(email)` — envía email de recuperación

---

## 5. Sistema de mock para desarrollo

Para desarrollar sin backend real, existe un sistema de mock activable con variables de entorno:

```env
NEXT_PUBLIC_MOCK=true
NEXT_PUBLIC_MOCK_ROLE=CLIENTE   # o CONDUCTOR, GERENTE
```

Con mock activado:
- `lib/api.ts` intercepta todas las llamadas a la API y retorna fixtures hardcodeados
- No se usa Firebase real — se setea `token=mock` en la cookie
- Los datos de viajes, conductores, etc. vienen de arrays en el código
- Simula delays de ~300ms para imitar latencia real

Esto permite desarrollar y testear features completas sin que el backend esté corriendo.

---

## 6. Features por rol

### Cliente

| Feature | Estado | Archivo |
|---|---|---|
| Login | ✅ Completo | `app/(auth)/login/page.tsx` |
| Registro | ✅ Completo | `app/(auth)/registro/page.tsx` |
| Registro conductor | ✅ Completo | `app/(auth)/registro/conductor/page.tsx` |
| Recuperar contraseña | ✅ Completo | `app/(auth)/recuperar/page.tsx` |
| Pedir viaje | ✅ Completo | `app/(cliente)/pedir-viaje/page.tsx` |
| Historial de viajes | ✅ Completo | `app/(cliente)/viajes/page.tsx` |
| Detalle de viaje | ✅ Completo | `app/(cliente)/viajes/[id]/page.tsx` |
| Dashboard métricas | ⏳ Pendiente | `app/(cliente)/page.tsx` (stub "próximamente F1-2") |
| Perfil | ⏳ Pendiente | `app/(cliente)/perfil/page.tsx` (stub) |

### Conductor

| Feature | Estado | Archivo |
|---|---|---|
| Panel viajes disponibles (real-time) | ✅ Completo | `app/(conductor)/conductor/page.tsx` |
| Aceptar viaje con WebSocket | ✅ Completo | ídem |
| Mis viajes | ✅ Completo | `app/(conductor)/conductor/mis-viajes/page.tsx` |

### Gerente

| Feature | Estado | Archivo |
|---|---|---|
| Panel gerente | ⏳ En desarrollo | `app/(gerente)/gerente/page.tsx` (stub) |

---

## 7. Flujos técnicos clave

### Pedir viaje (cliente)

1. El cliente completa el formulario en `/pedir-viaje`:
   - **Zona**: CABA, PROVINCIA, o MIXTO
   - **Fecha y hora**: mínimo 1 hora desde ahora (validado en el front)
   - **Ruta**: origen obligatorio, destino obligatorio, paradas intermedias opcionales (se pueden agregar/quitar dinámicamente). Cada punto se muestra con un punto de color (naranja = origen, negro = destino, gris = intermedio)
   - **Condiciones especiales**: checkboxes — Frágil, Refrigerado, Carga Pesada, Peligroso, Voluminoso
2. Al enviar: `POST /api/viajes` con todos los datos
3. El backend responde con el ID del viaje, status `BUSCANDO_CONDUCTOR`, y precio estimado
4. El frontend muestra un panel de confirmación con esa info

### Panel del conductor (real-time)

Este es el flujo más complejo del sistema porque involucra WebSockets y manejo de race conditions.

**Conexión:**
- Al montar el componente, `useSocket` crea una conexión Socket.io al backend con el Firebase token en los headers
- El socket queda en un ref de React para que persista entre renders sin re-crear la conexión

**Escucha de viajes:**
- El servidor emite `viaje:disponible` cuando un cliente pide un viaje
- El panel agrega el viaje a la lista en tiempo real
- Los viajes se muestran con: ID, zona, condiciones especiales, precio, ruta, cliente, fecha

**Aceptar un viaje:**
1. El conductor hace click en "Aceptar"
2. El frontend emite `viaje:aceptar` con el ID del viaje
3. Se setea un **timeout de 10 segundos** — si no responde el servidor, se muestra error
4. El servidor puede responder con:
   - `viaje:conductor_asignado` → éxito, el conductor está asignado a ese viaje
   - `viaje:ya_asignado` → otro conductor llegó primero, race condition resuelta
   - `viaje:no_disponible` → el viaje fue cancelado o no existe

**Race condition:**
Múltiples conductores pueden ver el mismo viaje disponible simultáneamente. El backend resuelve quién llega primero (first-write-wins). El frontend maneja los tres casos con feedback claro al usuario.

**Cleanup (importante):**
El `useEffect` que registra los listeners del socket tiene un cleanup que desconecta el socket y cancela todos los timeouts al desmontar el componente. Esto previene:
- Memory leaks (listeners acumulándose en re-renders)
- Actualizaciones de estado en componentes desmontados
- Timeouts que disparan después de que el usuario navegó a otra página

### Historial de viajes (cliente)

- Llama a `GET /api/viajes/mis-viajes`
- Muestra tabla con: fecha, ruta, ID, zona, estado (badge de color), precio, alertas
- Filtrado por período usando `SelectorPeriodo` (mensual, semanal, todo, personalizado)
- Ordenamiento por fecha o precio con `useMemo` (no re-fetcha, filtra en cliente)
- Loading states con skeleton screens
- Click en fila → navega a `/viajes/[id]`

### Detalle de viaje

- Llama a `GET /api/viajes/:id`
- Muestra todos los datos del viaje: ruta completa con paradas, conductor asignado (si hay), duración (si completó), precio estimado vs final con ajuste, alertas

---

## 8. Componentes y hooks reutilizables

### `SelectorPeriodo`

Componente de selector de rango de fechas. Modos:
- **Mensual** — el mes actual
- **Semanal** — la semana actual
- **Todo** — sin filtro de fecha
- **Personalizado** — date picker con fecha inicio y fin

Usa el contexto `PeriodoProvider` (`hooks/usePeriodo.tsx`) para compartir el período seleccionado entre el selector y los componentes que consumen los datos.

### `useSocket`

Hook que gestiona el ciclo de vida de la conexión Socket.io:
- Crea la conexión con el token Firebase en los headers
- Expone el socket y el estado de conexión (`connected: boolean`)
- El cleanup del hook desconecta el socket al desmontar

### `lib/api.ts`

Wrapper de `fetch` que:
- Inyecta automáticamente el token Firebase en el header `Authorization`
- Si `NEXT_PUBLIC_MOCK=true`, intercepta las llamadas y retorna fixtures
- Métodos: `api.get(path)`, `api.post(path, body)`, `api.put(path, body)`
- Manejo de errores con mensajes descriptivos

---

## 9. Historia del proyecto (commits clave)

| Commit | Qué se hizo |
|---|---|
| `be90ae2` | Launch Next.js — scaffold inicial del proyecto |
| `0a47dc9` | Pre-desarrollo terminado — estructura de carpetas, layouts, diseño base |
| `72f4b8c` | Sistema mock completo: login, Google OAuth, logout, registro, recuperar contraseña — todo funciona sin backend |
| `e86f6a9` | Fix: lazy Firebase init para evitar error de prerender en el build de Next.js |
| `49ec22f` | Login real con Firebase terminado |
| `2e8c109` | Roles CONDUCTOR y GERENTE agregados al login y registro |
| `df1b1d5` | Pedir viaje (cliente) + aceptar viaje (conductor) con WebSocket |
| `b4b0dd9` | Mis viajes — historial de viajes del cliente |
| `cdca406` | Detalle de viaje (`/viajes/[id]`) implementado |
| `0d2a27c` | Redirect a login cuando no hay sesión + página mis viajes para conductor |
| `6f6851c` | Hardening UX en panel conductor: manejo de race condition y estados intermedios |
| `4d4a605` | Fix: corregir leaks de timeouts y socket en el panel del conductor |

---

## 10. Variables de entorno

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Backend
NEXT_PUBLIC_API_URL=http://localhost:3001   # Railway URL en prod

# Mock mode (desarrollo sin backend)
NEXT_PUBLIC_MOCK=true
NEXT_PUBLIC_MOCK_ROLE=CLIENTE   # CLIENTE | CONDUCTOR | GERENTE

# Otros (usados por backend, presentes en .env)
DATABASE_URL=          # Neon PostgreSQL
REDIS_URL=             # Redis
GOOGLE_MAPS_API_KEY=
MERCADOPAGO_TOKEN=
```

---

## 11. Cómo correr el proyecto

**Modo mock (sin backend):**
```bash
# .env.local
NEXT_PUBLIC_MOCK=true
NEXT_PUBLIC_MOCK_ROLE=CLIENTE

npm run dev
```

**Con backend real:**
```bash
# .env.local
NEXT_PUBLIC_MOCK=false
NEXT_PUBLIC_API_URL=https://<nombre>.up.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=...
# (resto de variables Firebase)

npm run dev
```

---

## 12. Lo que falta / próximos pasos

- **F1-2**: Dashboard de métricas del cliente (cards con KPIs)
- **F1-5**: Página de perfil del cliente
- **Panel gerente**: funcionalidad completa para el rol GERENTE
- **Facturación**: sección de billing del cliente (actualmente stub en el sidebar)
