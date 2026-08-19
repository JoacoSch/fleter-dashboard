import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { esFinalizado } from "@/lib/estados";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const MESES_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const MOCK_RESUMEN_BASE = {
  total_gastado: 47100,
  costo_promedio: 6728,
  cantidad_fletes: 11,
  flete_mas_caro: { id_viaje: 108, monto: 13500 },
  flete_mas_barato: { id_viaje: 101, monto: 2900 },
  por_zona: { CABA: 5, PROVINCIA: 4, MIXTO: 2 },
  alertas_count: 3,
  top_destinos: [
    { direccion: "La Plata, Buenos Aires",       count: 2, zona: "PROVINCIA" },
    { direccion: "Mar del Plata, Buenos Aires",  count: 1, zona: "PROVINCIA" },
    { direccion: "Tigre, Buenos Aires",          count: 1, zona: "MIXTO"     },
    { direccion: "Morón, Buenos Aires",          count: 1, zona: "PROVINCIA" },
    { direccion: "Palermo Soho, CABA",           count: 1, zona: "CABA"      },
  ],
};

function mockChartSemanal(now: Date) {
  const weekSlot = Math.min(4, Math.ceil(now.getDate() / 7));
  return [1, 2, 3, 4].map((w) => ({
    semana: `S${w}`,
    viajes: w === weekSlot ? 3 : 0,
    gasto:  w === weekSlot ? 18700 : 0,
  }));
}

function mockChartMensual(now: Date) {
  return Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const isCurrent = i === 5;
    const viajes = isCurrent ? 11 : [8, 5, 12, 7, 9][i];
    const gasto   = isCurrent ? 47100 : [32000, 21000, 54000, 28000, 38000][i];
    return { semana: MESES_SHORT[m.getMonth()], viajes, gasto, isCurrent };
  });
}

interface Viaje {
  id_viaje: number;
  estado: string;
  precio_real: number | null;
  zona: "CABA" | "PROVINCIA" | "MIXTO";
  alertas_count?: number;
  fecha_programada: string;
  creado_en: string;
  paradas: { orden: number; direccion: string }[];
}

async function fetchViajesFromBackend(desde: string | null, hasta: string | null, token: string): Promise<Viaje[]> {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  const res = await fetch(`${API_URL}/api/viajes/mis-viajes?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Backend error ${res.status}`);
  return res.json();
}

function computeChartSemanal(viajes: Viaje[], desde: string | null): { semana: string; viajes: number; gasto: number }[] {
  const periodoStart = desde ? new Date(desde) : new Date();
  const weekSlot = Math.min(4, Math.ceil(periodoStart.getDate() / 7));
  const entregados = viajes.filter((v) => esFinalizado(v.estado) && v.precio_real != null);
  const gasto = entregados.reduce((a, v) => a + (v.precio_real ?? 0), 0);
  return [1, 2, 3, 4].map((w) => ({
    semana: `S${w}`,
    viajes: w === weekSlot ? viajes.length : 0,
    gasto:  w === weekSlot ? gasto : 0,
  }));
}

function computeChartMensual(chartViajes: Viaje[]): { semana: string; viajes: number; gasto: number; isCurrent: boolean }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const isCurrent = i === 5;
    const mesViajes = chartViajes.filter((v) => {
      const d = new Date(v.fecha_programada ?? v.creado_en);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    });
    const gasto = mesViajes
      .filter((v) => esFinalizado(v.estado) && v.precio_real != null)
      .reduce((a, v) => a + (v.precio_real ?? 0), 0);
    return { semana: MESES_SHORT[m.getMonth()], viajes: mesViajes.length, gasto, isCurrent };
  });
}

export async function GET(request: NextRequest) {
  const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";
  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde");
  const hasta  = searchParams.get("hasta");
  const view   = searchParams.get("view"); // "semanal" | "mensual" | null

  if (MOCK) {
    await new Promise((r) => setTimeout(r, 280));
    const now = new Date();
    const fletes_por_semana = view === "mensual"
      ? mockChartMensual(now)
      : mockChartSemanal(now);
    return Response.json({ ...MOCK_RESUMEN_BASE, fletes_por_semana });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return Response.json({ error: "No autenticado" }, { status: 401 });

  // KPI fetch: uses the original period
  let viajes: Viaje[];
  try {
    viajes = await fetchViajesFromBackend(desde, hasta, token);
  } catch {
    return Response.json({ error: "Error al obtener viajes" }, { status: 502 });
  }

  const entregados = viajes.filter((v) => esFinalizado(v.estado) && v.precio_real != null);
  const total_gastado   = entregados.reduce((acc, v) => acc + (v.precio_real ?? 0), 0);
  const cantidad_fletes = viajes.length;
  const costo_promedio  = entregados.length > 0 ? Math.round(total_gastado / entregados.length) : null;

  const por_precio      = [...entregados].sort((a, b) => (b.precio_real ?? 0) - (a.precio_real ?? 0));
  const flete_mas_caro  = por_precio[0]
    ? { id_viaje: por_precio[0].id_viaje, monto: por_precio[0].precio_real }
    : null;
  const flete_mas_barato = por_precio.at(-1)
    ? { id_viaje: por_precio.at(-1)!.id_viaje, monto: por_precio.at(-1)!.precio_real }
    : null;

  const por_zona = viajes.reduce(
    (acc, v) => { acc[v.zona] = (acc[v.zona] ?? 0) + 1; return acc; },
    { CABA: 0, PROVINCIA: 0, MIXTO: 0 } as Record<string, number>
  );

  const alertas_count = viajes.reduce((acc, v) => acc + (v.alertas_count ?? 0), 0);

  const destino_freq: Record<string, { count: number; zona: "CABA" | "PROVINCIA" | "MIXTO" }> = {};
  for (const v of viajes) {
    if (!v.paradas.length) continue;
    const ultimo = v.paradas.reduce((max, p) => (p.orden > max.orden ? p : max), v.paradas[0]);
    if (ultimo) {
      if (!destino_freq[ultimo.direccion]) destino_freq[ultimo.direccion] = { count: 0, zona: v.zona };
      destino_freq[ultimo.direccion].count++;
    }
  }
  const top_destinos = Object.entries(destino_freq)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([direccion, { count, zona }]) => ({ direccion, count, zona }));

  // Chart: may need a separate (wider) fetch for mensual view
  let fletes_por_semana;
  if (view === "mensual") {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);
    const hoy = new Date().toISOString().slice(0, 10);
    try {
      const chartViajes = await fetchViajesFromBackend(sixMonthsAgo, hoy, token);
      fletes_por_semana = computeChartMensual(chartViajes);
    } catch {
      fletes_por_semana = computeChartMensual(viajes);
    }
  } else {
    fletes_por_semana = computeChartSemanal(viajes, desde);
  }

  return Response.json({
    total_gastado,
    costo_promedio,
    cantidad_fletes,
    flete_mas_caro,
    flete_mas_barato,
    por_zona,
    alertas_count,
    top_destinos,
    fletes_por_semana,
  });
}
