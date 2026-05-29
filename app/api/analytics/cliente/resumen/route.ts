import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const MOCK_RESUMEN = {
  total_gastado: 47100,
  costo_promedio: 6728,
  cantidad_fletes: 11,
  flete_mas_caro: { id_viaje: 108, monto: 13500 },
  flete_mas_barato: { id_viaje: 101, monto: 2900 },
  por_zona: { CABA: 5, PROVINCIA: 4, MIXTO: 2 },
  alertas_count: 3,
  top_destinos: [
    { direccion: "La Plata, Buenos Aires", count: 2 },
    { direccion: "Mar del Plata, Buenos Aires", count: 1 },
    { direccion: "Tigre, Buenos Aires", count: 1 },
    { direccion: "Morón, Buenos Aires", count: 1 },
    { direccion: "Palermo Soho, CABA", count: 1 },
  ],
};

interface Viaje {
  id_viaje: number;
  estado: string;
  precio_real: number | null;
  zona: "CABA" | "PROVINCIA" | "MIXTO";
  alertas_count?: number;
  paradas: { orden: number; direccion: string }[];
}

export async function GET(request: NextRequest) {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 280));
    return Response.json(MOCK_RESUMEN);
  }

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);

  const res = await fetch(`${API_URL}/api/viajes/mis-viajes?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return Response.json({ error: "Error al obtener viajes" }, { status: res.status });
  }

  const viajes: Viaje[] = await res.json();

  const entregados = viajes.filter((v) => v.estado === "ENTREGADO" && v.precio_real != null);
  const total_gastado = entregados.reduce((acc, v) => acc + (v.precio_real ?? 0), 0);
  const cantidad_fletes = viajes.length;
  const costo_promedio = entregados.length > 0 ? Math.round(total_gastado / entregados.length) : null;

  const por_precio = [...entregados].sort((a, b) => (b.precio_real ?? 0) - (a.precio_real ?? 0));
  const flete_mas_caro = por_precio[0]
    ? { id_viaje: por_precio[0].id_viaje, monto: por_precio[0].precio_real }
    : null;
  const flete_mas_barato = por_precio[por_precio.length - 1]
    ? { id_viaje: por_precio[por_precio.length - 1].id_viaje, monto: por_precio[por_precio.length - 1].precio_real }
    : null;

  const por_zona = viajes.reduce(
    (acc, v) => { acc[v.zona] = (acc[v.zona] ?? 0) + 1; return acc; },
    { CABA: 0, PROVINCIA: 0, MIXTO: 0 } as Record<string, number>
  );

  const alertas_count = viajes.reduce((acc, v) => acc + (v.alertas_count ?? 0), 0);

  const destino_freq: Record<string, number> = {};
  for (const v of viajes) {
    const ultimo = v.paradas.reduce((max, p) => (p.orden > max.orden ? p : max), v.paradas[0]);
    if (ultimo) destino_freq[ultimo.direccion] = (destino_freq[ultimo.direccion] ?? 0) + 1;
  }
  const top_destinos = Object.entries(destino_freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([direccion, count]) => ({ direccion, count }));

  return Response.json({
    total_gastado,
    costo_promedio,
    cantidad_fletes,
    flete_mas_caro,
    flete_mas_barato,
    por_zona,
    alertas_count,
    top_destinos,
  });
}
