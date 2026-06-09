"use client";

import { useEffect, useState } from "react";
import { usePeriodo, type PeriodoMode } from "@/hooks/usePeriodo";
import { formatARS, fmtDate } from "@/lib/utils";
import Link from "next/link";

interface ChartItem {
  semana: string;
  viajes: number;
  gasto: number;
  isCurrent?: boolean;
}

interface Resumen {
  total_gastado: number;
  costo_promedio: number | null;
  cantidad_fletes: number;
  flete_mas_caro: { id_viaje: number; monto: number } | null;
  flete_mas_barato: { id_viaje: number; monto: number } | null;
  por_zona: { CABA: number; PROVINCIA: number; MIXTO: number };
  alertas_count: number;
  top_destinos: { direccion: string; count: number; zona?: string }[];
  fletes_por_semana: ChartItem[];
}

function toInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function periodoLabel(mode: PeriodoMode, desde: Date, hasta: Date): string {
  if (mode === "mensual") {
    return desde.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  }
  if (mode === "semanal") {
    return `Semana del ${fmtDate(desde.toISOString())}`;
  }
  if (mode === "personalizado") {
    return `${fmtDate(desde.toISOString())} — ${fmtDate(hasta.toISOString())}`;
  }
  return "Todo el período";
}

function SkeletonCard({ span = 4, h = 90 }: { span?: number; h?: number }) {
  return (
    <div className={`card span-${span}`} style={{ minHeight: h }}>
      <div style={{ height: 10, width: "40%", background: "var(--surface-3)", borderRadius: 4, marginBottom: 14 }} />
      <div style={{ height: 32, width: "55%", background: "var(--surface-3)", borderRadius: 4 }} />
    </div>
  );
}

const PERIOD_TABS: { key: PeriodoMode; label: string }[] = [
  { key: "semanal", label: "Semanal" },
  { key: "mensual", label: "Mensual" },
  { key: "personalizado", label: "Personalizado" },
];

export default function DashboardPage() {
  const { periodo, queryParams, setMensual, setSemanal, setPersonalizado } = usePeriodo();
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if ("desde" in queryParams) {
      params.set("desde", queryParams.desde);
      params.set("hasta", queryParams.hasta);
    }
    // Tell the API which chart layout to use
    if (periodo.mode === "semanal" || periodo.mode === "mensual") {
      params.set("view", periodo.mode);
    }
    const qs = params.toString() ? `?${params}` : "";
    fetch(`/api/analytics/cliente/resumen${qs}`)
      .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<Resumen>; })
      .then(setResumen)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [queryParams, periodo.mode]);

  function handlePeriodoTab(key: PeriodoMode) {
    if (key === "mensual") setMensual();
    else if (key === "semanal") setSemanal();
    else setPersonalizado(periodo.desde, periodo.hasta);
  }

  function handleDesde(e: React.ChangeEvent<HTMLInputElement>) {
    setPersonalizado(new Date(e.target.value + "T00:00:00"), periodo.hasta);
  }
  function handleHasta(e: React.ChangeEvent<HTMLInputElement>) {
    setPersonalizado(periodo.desde, new Date(e.target.value + "T23:59:59"));
  }

  const isMensualChart = periodo.mode === "mensual";
  const maxBar = resumen?.fletes_por_semana?.length
    ? Math.max(...resumen.fletes_por_semana.map((s) => s.viajes), 1)
    : 1;
  const totalZona = resumen
    ? resumen.por_zona.CABA + resumen.por_zona.PROVINCIA + resumen.por_zona.MIXTO || 1
    : 1;

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Analytics</h2>
          <p>Resumen del período · {periodoLabel(periodo.mode, periodo.desde, periodo.hasta)}</p>
        </div>
        <div className="section-controls">
          <div className="period-tabs">
            {PERIOD_TABS.map(({ key, label }) => (
              <button
                key={key}
                className={`period-tab${periodo.mode === key ? " is-active" : ""}`}
                onClick={() => handlePeriodoTab(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          {periodo.mode === "personalizado" && (
            <div className="date-range">
              <input
                type="date"
                aria-label="Fecha desde"
                value={toInputValue(periodo.desde)}
                max={toInputValue(periodo.hasta)}
                onChange={handleDesde}
              />
              <span className="date-range__sep">→</span>
              <input
                type="date"
                aria-label="Fecha hasta"
                value={toInputValue(periodo.hasta)}
                min={toInputValue(periodo.desde)}
                max={toInputValue(new Date())}
                onChange={handleHasta}
              />
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Fila 1: métricas top */}
      <div className="grid-12 grid-row">
        {loading ? (
          <><SkeletonCard span={4} /><SkeletonCard span={4} /><SkeletonCard span={4} /></>
        ) : resumen ? (
          <>
            <div className="card span-4 card--ink">
              <p className="metric__label">Total gastado</p>
              <p className="metric__value">
                <sup>$</sup>{resumen.total_gastado > 0 ? resumen.total_gastado.toLocaleString("es-AR") : "0"}
              </p>
            </div>
            <div className="card span-4">
              <p className="metric__label">Fletes solicitados</p>
              <p className="metric__value">{resumen.cantidad_fletes}</p>
            </div>
            <div className="card span-4">
              <p className="metric__label">Costo promedio</p>
              <p className="metric__value">
                {resumen.costo_promedio != null
                  ? <><sup>$</sup>{resumen.costo_promedio.toLocaleString("es-AR")}</>
                  : <span style={{ fontSize: 18, color: "var(--ink-4)" }}>—</span>}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Fila 2: bar chart + zona */}
      <div className="grid-12 grid-row">
        {loading ? (
          <><SkeletonCard span={7} h={220} /><SkeletonCard span={5} h={220} /></>
        ) : resumen ? (
          <>
            {/* Bar chart */}
            <div className="card span-7">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <div>
                  <p className="card-title">
                    {isMensualChart ? "Fletes por mes" : "Fletes por semana"}
                  </p>
                  <p className="card-sub">
                    {isMensualChart
                      ? "Cantidad de viajes — últimos 6 meses"
                      : `Semanas del mes · ${periodo.desde.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`}
                  </p>
                </div>
                <p className="chart-axis-label">↑ Cant. viajes</p>
              </div>
              <div
                className="bars"
                style={{ gridTemplateColumns: `repeat(${resumen.fletes_por_semana.length}, 1fr)` }}
              >
                {resumen.fletes_por_semana.map((s) => {
                  const isEmpty = s.viajes === 0;
                  const isCurrentMonth = isMensualChart && s.isCurrent;
                  const isPastMonth = isMensualChart && !s.isCurrent;
                  const barColor = isPastMonth
                    ? "var(--ink-2)"
                    : "var(--accent)";
                  return (
                    <div className="bar" key={s.semana}>
                      {!isEmpty ? (
                        <div
                          className="bar__col"
                          style={{
                            height: `${(s.viajes / maxBar) * 100}%`,
                            background: barColor,
                            borderRadius: isCurrentMonth ? "6px 6px 0 0" : "4px 4px 0 0",
                          }}
                          data-amount={s.gasto > 0 ? formatARS(s.gasto) : undefined}
                        >
                          <span className="bar__count" style={{ color: isPastMonth ? "rgba(255,255,255,.85)" : "#fff" }}>
                            {s.viajes}
                          </span>
                        </div>
                      ) : (
                        <div style={{ width: "100%", height: 3, background: "var(--line)", borderRadius: 2, alignSelf: "flex-end" }} />
                      )}
                      <span className="bar__label" style={{ color: isCurrentMonth ? "var(--accent)" : "var(--ink-3)", fontWeight: isCurrentMonth ? 700 : 600 }}>
                        {s.semana}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zone breakdown */}
            <div className="card span-5">
              <p className="card-title">Desglose por zona</p>
              <p className="card-sub">Cantidad de viajes según tipo</p>
              {[
                { zone: "CABA",      val: resumen.por_zona.CABA,      cls: "" },
                { zone: "PROVINCIA", val: resumen.por_zona.PROVINCIA,  cls: "zone-fill--prov" },
                { zone: "MIXTO",     val: resumen.por_zona.MIXTO,      cls: "zone-fill--mixto" },
              ].map((z) => (
                <div className="zone-row" key={z.zone}>
                  <span className="zone-name">{z.zone}</span>
                  <div className="zone-track">
                    <div className={`zone-fill ${z.cls}`} style={{ width: `${(z.val / totalZona) * 100}%` }} />
                  </div>
                  <span className="zone-amount">{z.val} viajes</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Fila 3: extremos + alertas */}
      <div className="grid-12 grid-row">
        {loading ? (
          <><SkeletonCard span={4} /><SkeletonCard span={4} /><SkeletonCard span={4} /></>
        ) : resumen ? (
          <>
            {/* Flete más caro */}
            <div className="card span-4">
              <p className="metric__label">Flete más caro</p>
              {resumen.flete_mas_caro ? (
                <>
                  <p className="metric__value" style={{ color: "var(--accent)" }}>
                    <sup>$</sup>{resumen.flete_mas_caro.monto.toLocaleString("es-AR")}
                  </p>
                  <div className="extreme">
                    <div>
                      <div className="extreme__id">VJ-{resumen.flete_mas_caro.id_viaje}</div>
                    </div>
                    <Link href={`/viajes/${resumen.flete_mas_caro.id_viaje}`} className="extreme__btn">
                      Ver detalle →
                    </Link>
                  </div>
                </>
              ) : (
                <p className="metric__value" style={{ color: "var(--ink-4)", fontSize: 18 }}>—</p>
              )}
            </div>

            {/* Flete más barato */}
            <div className="card span-4">
              <p className="metric__label">Flete más barato</p>
              {resumen.flete_mas_barato ? (
                <>
                  <p className="metric__value">
                    <sup>$</sup>{resumen.flete_mas_barato.monto.toLocaleString("es-AR")}
                  </p>
                  <div className="extreme">
                    <div>
                      <div className="extreme__id">VJ-{resumen.flete_mas_barato.id_viaje}</div>
                    </div>
                    <Link href={`/viajes/${resumen.flete_mas_barato.id_viaje}`} className="extreme__btn">
                      Ver detalle →
                    </Link>
                  </div>
                </>
              ) : (
                <p className="metric__value" style={{ color: "var(--ink-4)", fontSize: 18 }}>—</p>
              )}
            </div>

            {/* Alertas */}
            <div className="card span-4 card--col-between">
              <p className="metric__label">Alertas recibidas</p>
              <div className="alerts-strip">
                <span className={`alerts-strip__num${resumen.alertas_count === 0 ? " zero" : ""}`}>
                  {resumen.alertas_count}
                </span>
                <div className="alerts-strip__text">
                  <strong>{resumen.alertas_count === 0 ? "Sin alertas" : "alertas detectadas"}</strong>
                  {resumen.alertas_count > 0
                    ? "detectadas automáticamente sobre los viajes del período"
                    : "viajes sin desvíos ni paradas sospechosas"}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Fila 4: top destinos */}
      {!loading && resumen && resumen.top_destinos.length > 0 && (
        <div className="grid-12">
          <div className="card span-12">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <p className="card-title">Top 5 destinos frecuentes</p>
                <p className="card-sub">Direcciones a las que más viajes solicitaste en el período</p>
              </div>
            </div>
            <div>
              {resumen.top_destinos.map((d, i) => (
                <div className="dest-row" key={i}>
                  <div className="dest-rank">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="dest-addr">{d.direccion}</div>
                    {d.zona && <div className="dest-zone">{d.zona}</div>}
                  </div>
                  <div className="dest-count">{d.count}<small>viajes</small></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
