import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { calcularResumen, type ViajeResumenInput, type Vista, type Zona } from "@/lib/analytics-cliente";

/**
 * BFF del Analytics de la PyME. Trae `mis-viajes` una sola vez y calcula el
 * período, el anterior y la serie del gráfico en `lib/analytics-cliente.ts`.
 * Cálculo de pantalla autorizado el 15-09 (`OPEN.md` → D6).
 *
 * Query: `desde`, `hasta` (ISO), `vista` (semanal|mensual|personalizado|todo),
 * `tz` (getTimezoneOffset del browser, en minutos).
 */

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const VISTAS: Vista[] = ["semanal", "mensual", "personalizado", "todo"];

/**
 * Historial MOCK generado relativo a hoy (semilla fija): ~6 meses de viajes con
 * estados, zonas y puntualidad variados. Antes eran KPIs fijos que no se movían
 * al cambiar de período, así que la pantalla no se podía probar.
 */
function mockViajes(): ViajeResumenInput[] {
  let seed = 20260915;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const destinos: { dir: string; zona: Zona }[] = [
    { dir: "Av. Crovara 4250, La Tablada", zona: "PROVINCIA" },
    { dir: "Mercado Central, Tapiales", zona: "PROVINCIA" },
    { dir: "Dock Sud, Avellaneda", zona: "PROVINCIA" },
    { dir: "Av. Warnes 1840, CABA", zona: "CABA" },
    { dir: "Parque Industrial Pilar", zona: "MIXTO" },
    { dir: "Av. Corrientes 1234, CABA", zona: "CABA" },
  ];
  const out: ViajeResumenInput[] = [];
  const ahora = Date.now();
  for (let i = 0; i < 70; i++) {
    const diasAtras = Math.floor(rnd() * 180) - 3; // unos pocos a futuro
    const fecha = new Date(ahora - diasAtras * 86_400_000);
    fecha.setHours(7 + Math.floor(rnd() * 11), 0, 0, 0);
    const d = destinos[Math.floor(rnd() * destinos.length)];
    const futuro = diasAtras < 0;
    const r = rnd();
    const estado = futuro ? "CONDUCTOR_ASIGNADO" : r < 0.12 ? "CANCELADO" : "FINALIZADO";
    const base = d.zona === "CABA" ? 18000 : d.zona === "MIXTO" ? 42000 : 65000;
    out.push({
      id_viaje: 300 + i,
      estado,
      precio_real: estado === "FINALIZADO" ? Math.round((base * (0.7 + rnd() * 0.8)) / 100) * 100 : null,
      zona: d.zona,
      duracion_real: estado === "FINALIZADO" ? 35 + Math.floor(rnd() * 150) : null,
      puntualidad_inicio: estado === "FINALIZADO" ? (rnd() < 0.78 ? "A_TIEMPO" : rnd() < 0.7 ? "TARDE" : "MUY_TARDE") : null,
      fecha_programada: fecha.toISOString(),
      creado_en: fecha.toISOString(),
      paradas: [
        { orden: 1, direccion: "Av. Rivadavia 5200, Caballito, CABA" },
        { orden: 2, direccion: d.dir },
      ],
    });
  }
  return out;
}

export async function GET(request: NextRequest) {
  const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";
  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const vistaParam = searchParams.get("vista") as Vista | null;
  const vista: Vista = vistaParam && VISTAS.includes(vistaParam) ? vistaParam : desde ? "personalizado" : "todo";
  const tz = Number(searchParams.get("tz") ?? 180);
  const opts = {
    desde: desde ? new Date(desde) : null,
    hasta: hasta ? new Date(hasta) : null,
    vista,
    tzOffsetMin: Number.isFinite(tz) ? tz : 180,
  };

  if (MOCK) {
    await new Promise((r) => setTimeout(r, 280));
    return Response.json(calcularResumen(mockViajes(), opts));
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return Response.json({ error: "No autenticado" }, { status: 401 });

  let viajes: ViajeResumenInput[];
  try {
    // Sin filtros: el período anterior y la serie necesitan más que el rango
    // pedido, y el contrato no documenta `desde`/`hasta` en este endpoint.
    const res = await fetch(`${API_URL}/api/viajes/mis-viajes`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Backend error ${res.status}`);
    viajes = await res.json();
  } catch {
    return Response.json({ error: "Error al obtener viajes" }, { status: 502 });
  }

  return Response.json(calcularResumen(viajes, opts));
}
