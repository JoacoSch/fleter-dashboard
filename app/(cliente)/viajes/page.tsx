"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { usePeriodo } from "@/hooks/usePeriodo";
import SelectorPeriodo from "@/components/SelectorPeriodo";
import { formatARS, formatDuracion, fmtDate } from "@/lib/utils";

const PAGE_SIZE = 10;

const ESTADO_LABEL: Record<string, string> = {
  ENTREGADO: "ENTREGADO",
  EN_CURSO: "EN CURSO",
  CANCELADO: "CANCELADO",
  BUSCANDO_CONDUCTOR: "BUSCANDO",
  CONDUCTOR_ASIGNADO: "ASIGNADO",
};

// CSS class mapping (globals.css only has BUSCANDO_FLETERO, not BUSCANDO_CONDUCTOR)
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

function AjusteBadge({ estimado, real }: { estimado: number; real: number | null }) {
  if (real == null) return <span className="trip-row__ajuste--null">—</span>;
  const diff = real - estimado;
  if (diff === 0) {
    return <span className="trip-row__ajuste trip-row__ajuste--equal">= {formatARS(real)}</span>;
  }
  if (diff < 0) {
    return (
      <span className="trip-row__ajuste trip-row__ajuste--lower">
        ▼ {formatARS(Math.abs(diff))}
      </span>
    );
  }
  return (
    <span className="trip-row__ajuste trip-row__ajuste--higher">
      ▲ {formatARS(diff)}
    </span>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: "asc" | "desc" }) {
  const active = col === sortKey;
  const icon = active ? (sortDir === "asc" ? "↑" : "↓") : "↕";
  return (
    <span className={`trip-row__sort-icon${active ? " trip-row__sort-icon--active" : ""}`}>
      {icon}
    </span>
  );
}

function PaginationBar({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="pagination">
      <button
        className="pagination__page"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        type="button"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="pagination__ellipsis">
            …
          </span>
        ) : (
          <button
            key={p}
            className={`pagination__page${p === current ? " is-active" : ""}`}
            onClick={() => onChange(p as number)}
            type="button"
          >
            {p}
          </button>
        )
      )}
      <button
        className="pagination__page"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        type="button"
      >
        ›
      </button>
    </div>
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
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset page on period or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [periodo, sortKey]);

  const filtered = useMemo(() => {
    if (periodo.mode === "todo") return rawViajes;
    return rawViajes.filter((v) => {
      const dateStr = v.fecha_programada ?? v.creado_en;
      const d = new Date(dateStr);
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

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = useMemo(
    () => sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sorted, currentPage]
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function goToViaje(id: number) {
    router.push(`/viajes/${id}`);
  }

  const COLS: { label: string; sortable?: SortKey }[] = [
    { label: "Fecha", sortable: "fecha" },
    { label: "Ruta" },
    { label: "Zona" },
    { label: "Duración", sortable: "duracion_real" },
    { label: "Estimado" },
    { label: "Final", sortable: "precio_real" },
    { label: "Ajuste" },
    { label: "Estado" },
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
        <div
          className="card"
          style={{ color: "var(--err)", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}
        >
          <span>{error}</span>
          <button className="btn" onClick={fetchViajes} type="button">
            Reintentar
          </button>
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
              {col.sortable && (
                <SortIcon col={col.sortable} sortKey={sortKey} sortDir={sortDir} />
              )}
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
          paged.map((v) => {
            const origen = v.paradas.find((p) => p.orden === 1)?.direccion ?? "—";
            const destino =
              v.paradas.reduce((max, p) => (p.orden > max.orden ? p : max), v.paradas[0])
                ?.direccion ?? "—";
            const fechaStr = fmtDate(v.fecha_programada ?? v.creado_en);
            const estadoCss = ESTADO_CSS[v.estado] ?? v.estado;
            const estadoLabel = ESTADO_LABEL[v.estado] ?? v.estado;

            return (
              <div
                key={v.id_viaje}
                className="trip-row"
                onClick={() => goToViaje(v.id_viaje)}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className="trip-row__meta">{fechaStr}</span>
                  <span className="trip-row__id">VJ-{v.id_viaje}</span>
                </div>

                <div className="trip-row__route">
                  <span className="trip-row__route-origin">{origen}</span>
                  <span className="trip-row__route-dest">→ {destino}</span>
                </div>

                <span className={`zone-tag ${v.zona}`}>{v.zona}</span>

                <span className="trip-row__meta">{formatDuracion(v.duracion_real)}</span>

                <span className="trip-row__price">{formatARS(v.precio_estimado)}</span>

                <span className={`trip-row__price${v.precio_real == null ? " trip-row__price--null" : ""}`}>
                  {v.precio_real != null ? formatARS(v.precio_real) : "—"}
                </span>

                <AjusteBadge estimado={v.precio_estimado} real={v.precio_real} />

                <span className={`status ${estadoCss}`}>{estadoLabel}</span>

                <span className="trip-row__alert-icon">
                  {v.alertas_count != null && v.alertas_count > 0 ? "⚠" : ""}
                </span>

                <button
                  className="btn btn--ghost"
                  style={{ fontSize: 12 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToViaje(v.id_viaje);
                  }}
                  type="button"
                >
                  Ver detalle
                </button>
              </div>
            );
          })}
      </div>

      {!loading && filtered.length > 0 && (
        <PaginationBar current={currentPage} total={totalPages} onChange={setCurrentPage} />
      )}
    </div>
  );
}
