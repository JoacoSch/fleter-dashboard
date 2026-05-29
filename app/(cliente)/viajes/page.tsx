"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { usePeriodo } from "@/hooks/usePeriodo";
import SelectorPeriodo from "@/components/SelectorPeriodo";
import { formatARS, fmtDate, fmtTime, formatDuracion } from "@/lib/utils";

const ESTADO_LABEL: Record<string, string> = {
  ENTREGADO: "ENTREGADO",
  EN_CURSO: "EN CURSO",
  CANCELADO: "CANCELADO",
  BUSCANDO_CONDUCTOR: "BUSCANDO",
  CONDUCTOR_ASIGNADO: "ASIGNADO",
};

const ESTADO_CSS: Record<string, string> = {
  ENTREGADO: "ENTREGADO",
  EN_CURSO: "EN_CURSO",
  CANCELADO: "CANCELADO",
  BUSCANDO_CONDUCTOR: "BUSCANDO_FLETERO",
  CONDUCTOR_ASIGNADO: "BUSCANDO_FLETERO",
};

type SortKey = "fecha" | "precio_real" | "duracion_real";

interface Parada {
  orden: number;
  direccion: string;
}

interface MisViajesItem {
  id_viaje: number;
  zona: "CABA" | "PROVINCIA" | "MIXTO";
  precio_estimado: number;
  precio_real: number | null;
  estado: string;
  fecha_programada: string;
  creado_en: string;
  duracion_real?: number | null;
  alertas_count?: number;
  paradas: Parada[];
  conductor: { usuario: { nombre: string; apellido: string } } | null;
}

const PAGE_SIZE = 7;

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: "asc" | "desc" }) {
  const active = col === sortKey;
  return (
    <span className={`trip-row__sort-icon${active ? " trip-row__sort-icon--active" : ""}`}>
      {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

export default function ViajesPage() {
  const router = useRouter();
  const { periodo } = usePeriodo();

  const [rawViajes, setRawViajes] = useState<MisViajesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  async function fetchViajes() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<MisViajesItem[]>("/api/viajes/mis-viajes");
      setRawViajes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar los viajes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchViajes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page when period or sort changes
  useEffect(() => { setPage(1); }, [periodo, sortKey, sortDir]);

  const filtered = useMemo(() => {
    if (periodo.mode === "todo") return rawViajes;
    return rawViajes.filter((v) => {
      const d = new Date(v.fecha_programada ?? v.creado_en);
      return d >= periodo.desde && d <= periodo.hasta;
    });
  }, [rawViajes, periodo]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: number | null = null;
      let vb: number | null = null;
      if (sortKey === "fecha") {
        va = new Date(a.fecha_programada ?? a.creado_en).getTime();
        vb = new Date(b.fecha_programada ?? b.creado_en).getTime();
      } else if (sortKey === "precio_real") {
        va = a.precio_real ?? a.precio_estimado;
        vb = b.precio_real ?? b.precio_estimado;
      } else if (sortKey === "duracion_real") {
        va = a.duracion_real ?? null;
        vb = b.duracion_real ?? null;
      }
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const COLS: { label: string; sortable?: SortKey }[] = [
    { label: "Fecha", sortable: "fecha" },
    { label: "Ruta" },
    { label: "Zona" },
    { label: "Estado" },
    { label: "Duración", sortable: "duracion_real" },
    { label: "Estimado" },
    { label: "Final", sortable: "precio_real" },
    { label: "Ajuste" },
    { label: "!" },
    { label: "" },
  ];

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <h2>Mis viajes</h2>
          <p>
            {!loading && !error
              ? `${filtered.length} ${filtered.length === 1 ? "viaje" : "viajes"} en el período`
              : "Historial completo de fletes solicitados."}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <SelectorPeriodo />
      </div>

      {error && (
        <div className="card" style={{ color: "var(--err)", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span>{error}</span>
          <button className="btn" onClick={fetchViajes} type="button">Reintentar</button>
        </div>
      )}

      <div className="trips-table">
        {/* Header */}
        <div className="trip-row trip-row--header">
          {COLS.map((col, i) => (
            <div
              key={i}
              className={`trip-row__header-cell${col.sortable ? " trip-row__header-cell--sortable" : ""}`}
              onClick={col.sortable ? () => handleSort(col.sortable!) : undefined}
            >
              {col.label}
              {col.sortable && <SortIcon col={col.sortable} sortKey={sortKey} sortDir={sortDir} />}
            </div>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-row">
              {Array.from({ length: 10 }).map((_, j) => (
                <div key={j} className="skeleton-cell" />
              ))}
            </div>
          ))}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="trips-empty">Sin viajes en este período.</div>
        )}

        {/* Rows */}
        {!loading &&
          pageItems.map((v) => {
            const origen = v.paradas.find((p) => p.orden === 1)?.direccion ?? "—";
            const destino =
              v.paradas.reduce((max, p) => (p.orden > max.orden ? p : max), v.paradas[0])?.direccion ?? "—";
            const isoStr = v.fecha_programada ?? v.creado_en;
            const estadoCss = ESTADO_CSS[v.estado] ?? v.estado;
            const estadoLabel = ESTADO_LABEL[v.estado] ?? v.estado;
            const ajuste = v.precio_real != null ? v.precio_real - v.precio_estimado : null;

            return (
              <div key={v.id_viaje} className="trip-row" onClick={() => router.push(`/viajes/${v.id_viaje}`)}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className="trip-row__date">{fmtDate(isoStr)}</span>
                  <span className="trip-row__time">{fmtTime(isoStr)}</span>
                </div>

                <div className="trip-row__route">
                  <span className="trip-row__route-origin">{origen}</span>
                  <span className="trip-row__route-dest">{destino}</span>
                </div>

                <span className={`zone-tag ${v.zona}`}>{v.zona}</span>

                <span className={`status ${estadoCss}`}>{estadoLabel}</span>

                <span style={{ fontSize: 12.5, color: v.duracion_real ? "var(--ink)" : "var(--ink-4)" }}>
                  {formatDuracion(v.duracion_real)}
                </span>

                <span className="trip-row__price">
                  {formatARS(v.precio_estimado)}
                </span>

                <span className={`trip-row__price${v.precio_real == null ? " trip-row__price--null" : ""}`}>
                  {v.precio_real != null ? formatARS(v.precio_real) : "—"}
                </span>

                <span
                  className={`trip-row__ajuste${
                    ajuste == null
                      ? " trip-row__ajuste--null"
                      : ajuste < 0
                      ? " trip-row__ajuste--lower"
                      : ajuste > 0
                      ? " trip-row__ajuste--higher"
                      : " trip-row__ajuste--equal"
                  }`}
                >
                  {ajuste == null
                    ? "—"
                    : ajuste === 0
                    ? "="
                    : `${ajuste > 0 ? "+" : ""}${formatARS(ajuste)}`}
                </span>

                <span>
                  {v.alertas_count != null && v.alertas_count > 0 ? (
                    <span className="trip-row__alert-badge">{v.alertas_count}</span>
                  ) : null}
                </span>

                <span className="trip-row__chevron">›</span>
              </div>
            );
          })}
      </div>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            type="button"
          >
            ← Anterior
          </button>
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
            Página {page} de {totalPages}
          </span>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            type="button"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
