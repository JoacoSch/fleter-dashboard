"use client";

import { useEffect, useState } from "react";
import { usePeriodo } from "@/hooks/usePeriodo";
import SelectorPeriodo from "@/components/SelectorPeriodo";
import { formatARS } from "@/lib/utils";
import Link from "next/link";

interface Resumen {
  total_gastado: number;
  costo_promedio: number | null;
  cantidad_fletes: number;
  flete_mas_caro: { id_viaje: number; monto: number } | null;
  flete_mas_barato: { id_viaje: number; monto: number } | null;
  por_zona: { CABA: number; PROVINCIA: number; MIXTO: number };
  alertas_count: number;
  top_destinos: { direccion: string; count: number }[];
}

function SkeletonCard({ span = 3, h = 72 }: { span?: number; h?: number }) {
  return (
    <div className={`card span-${span}`} style={{ minHeight: h }}>
      <div style={{ height: 12, width: "40%", background: "var(--surface-3)", borderRadius: 4, marginBottom: 12 }} />
      <div style={{ height: 28, width: "60%", background: "var(--surface-3)", borderRadius: 4 }} />
    </div>
  );
}

export default function DashboardPage() {
  const { queryParams } = usePeriodo();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const qs =
      "desde" in queryParams
        ? `?desde=${queryParams.desde}&hasta=${queryParams.hasta}`
        : "";

    fetch(`/api/analytics/cliente/resumen${qs}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json() as Promise<Resumen>;
      })
      .then(setResumen)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [queryParams]);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <h2>Dashboard</h2>
          <p>Resumen de actividad en el período seleccionado.</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SelectorPeriodo />
      </div>

      {error && (
        <div className="card" style={{ color: "var(--err)", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="grid-12" style={{ rowGap: 12 }}>
        {loading ? (
          <>
            <SkeletonCard span={3} />
            <SkeletonCard span={3} />
            <SkeletonCard span={3} />
            <SkeletonCard span={3} />
            <SkeletonCard span={4} />
            <SkeletonCard span={4} />
            <SkeletonCard span={4} />
            <SkeletonCard span={12} h={120} />
          </>
        ) : resumen ? (
          <>
            {/* Total gastado */}
            <div className="card span-3">
              <p className="metric__label">Total gastado</p>
              {resumen.total_gastado > 0 ? (
                <p className="metric__value">{formatARS(resumen.total_gastado)}</p>
              ) : (
                <p className="metric__value" style={{ color: "var(--ink-4)", fontSize: 16 }}>Sin viajes completados</p>
              )}
            </div>

            {/* Cantidad de fletes */}
            <div className="card span-3">
              <p className="metric__label">Fletes solicitados</p>
              <p className="metric__value">{resumen.cantidad_fletes}</p>
            </div>

            {/* Costo promedio */}
            <div className="card span-3">
              <p className="metric__label">Costo promedio</p>
              <p className="metric__value">
                {resumen.costo_promedio != null ? formatARS(resumen.costo_promedio) : "—"}
              </p>
            </div>

            {/* Alertas */}
            <div className="card span-3">
              <p className="metric__label">Alertas recibidas</p>
              <p
                className="metric__value"
                style={resumen.alertas_count > 0 ? { color: "var(--warn)" } : undefined}
              >
                {resumen.alertas_count}
              </p>
            </div>

            {/* Flete más caro */}
            <div className="card span-4">
              <p className="metric__label">Flete más caro</p>
              {resumen.flete_mas_caro ? (
                <div style={{ marginTop: 6 }}>
                  <p className="metric__value" style={{ fontSize: 20 }}>{formatARS(resumen.flete_mas_caro.monto)}</p>
                  <Link
                    href={`/viajes/${resumen.flete_mas_caro.id_viaje}`}
                    style={{ fontSize: 11.5, color: "var(--accent)", fontFamily: "var(--font-mono)", textDecoration: "none" }}
                  >
                    VJ-{resumen.flete_mas_caro.id_viaje} →
                  </Link>
                </div>
              ) : (
                <p className="metric__value" style={{ color: "var(--ink-4)" }}>—</p>
              )}
            </div>

            {/* Flete más barato */}
            <div className="card span-4">
              <p className="metric__label">Flete más barato</p>
              {resumen.flete_mas_barato ? (
                <div style={{ marginTop: 6 }}>
                  <p className="metric__value" style={{ fontSize: 20 }}>{formatARS(resumen.flete_mas_barato.monto)}</p>
                  <Link
                    href={`/viajes/${resumen.flete_mas_barato.id_viaje}`}
                    style={{ fontSize: 11.5, color: "var(--accent)", fontFamily: "var(--font-mono)", textDecoration: "none" }}
                  >
                    VJ-{resumen.flete_mas_barato.id_viaje} →
                  </Link>
                </div>
              ) : (
                <p className="metric__value" style={{ color: "var(--ink-4)" }}>—</p>
              )}
            </div>

            {/* Por zona */}
            <div className="card span-4">
              <p className="metric__label" style={{ marginBottom: 10 }}>Viajes por zona</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="zone-tag CABA">CABA · {resumen.por_zona.CABA}</span>
                <span className="zone-tag PROVINCIA">PROV · {resumen.por_zona.PROVINCIA}</span>
                <span className="zone-tag MIXTO">MIXTO · {resumen.por_zona.MIXTO}</span>
              </div>
            </div>

            {/* Top destinos */}
            {resumen.top_destinos.length > 0 && (
              <div className="card span-12">
                <p className="metric__label" style={{ marginBottom: 12 }}>Top destinos</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {resumen.top_destinos.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                      <span style={{ color: "var(--ink)" }}>{d.direccion}</span>
                      <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
                        {d.count} {d.count === 1 ? "viaje" : "viajes"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
