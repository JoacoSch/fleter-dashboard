"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
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

interface Parada {
  orden: number;
  direccion: string;
  estado?: string;
  hora_entrega?: string | null;
}

interface Alerta {
  tipo: string;
  descripcion: string;
  creado_en: string;
}

interface ViajeDetalle {
  id_viaje: number;
  zona: "CABA" | "PROVINCIA" | "MIXTO";
  precio_estimado: number;
  precio_real: number | null;
  estado: string;
  fecha_programada: string;
  creado_en: string;
  duracion_real?: number | null;
  km_reales?: number | null;
  alertas_count?: number;
  alertas?: Alerta[];
  paradas: Parada[];
  conductor: {
    usuario: { nombre: string; apellido: string };
    calificacion?: number | null;
  } | null;
}

export default function ViajeDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [viaje, setViaje] = useState<ViajeDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ViajeDetalle>(`/api/viajes/${id}`)
      .then(setViaje)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar el viaje"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <h2>Viaje VJ-{id}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ height: 80, background: "var(--surface-2)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !viaje) {
    return (
      <div>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <h2>Viaje VJ-{id}</h2>
          <p style={{ color: "var(--err)" }}>{error ?? "Viaje no encontrado."}</p>
        </div>
        <button className="btn" onClick={() => router.back()} type="button">← Volver</button>
      </div>
    );
  }

  const paradas = [...viaje.paradas].sort((a, b) => a.orden - b.orden);
  const origen = paradas[0]?.direccion ?? "—";
  const destino = paradas[paradas.length - 1]?.direccion ?? "—";
  const intermedias = paradas.slice(1, -1);

  const isoStr = viaje.fecha_programada ?? viaje.creado_en;
  const estadoCss = ESTADO_CSS[viaje.estado] ?? viaje.estado;
  const estadoLabel = ESTADO_LABEL[viaje.estado] ?? viaje.estado;
  const precioDiff = viaje.precio_real != null ? viaje.precio_real - viaje.precio_estimado : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn" onClick={() => router.back()} type="button" style={{ flexShrink: 0 }}>←</button>
        <div className="section-header" style={{ flex: 1 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            VJ-{viaje.id_viaje}
            <span className={`status ${estadoCss}`}>{estadoLabel}</span>
            <span className={`zone-tag ${viaje.zona}`}>{viaje.zona}</span>
          </h2>
          <p>{fmtDate(isoStr)} · {fmtTime(isoStr)}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Ruta */}
        <div className="card">
          <p className="metric__label" style={{ marginBottom: 16 }}>Ruta</p>
          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div style={{
              position: "absolute", left: 8, top: 10, bottom: 10,
              width: 1.5, background: "var(--line-strong)",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Origen */}
              <ParadaItem
                dot="circle-accent"
                direccion={origen}
                estado={paradas[0]?.estado}
                hora={paradas[0]?.hora_entrega}
              />
              {/* Intermedias */}
              {intermedias.map((p) => (
                <ParadaItem
                  key={p.orden}
                  dot="circle-muted"
                  direccion={p.direccion}
                  estado={p.estado}
                  hora={p.hora_entrega}
                  small
                />
              ))}
              {/* Destino */}
              {paradas.length > 1 && (
                <ParadaItem
                  dot="square"
                  direccion={destino}
                  estado={paradas[paradas.length - 1]?.estado}
                  hora={paradas[paradas.length - 1]?.hora_entrega}
                />
              )}
            </div>
          </div>
        </div>

        {/* Precio */}
        <div className="card">
          <p className="metric__label" style={{ marginBottom: 12 }}>Precio</p>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <p className="metric__label">Estimado</p>
              <p className="metric__value" style={{ fontSize: 22 }}>{formatARS(viaje.precio_estimado)}</p>
            </div>
            {viaje.precio_real != null && (
              <div>
                <p className="metric__label">Final</p>
                <p className="metric__value" style={{ fontSize: 22 }}>{formatARS(viaje.precio_real)}</p>
              </div>
            )}
            {precioDiff != null && precioDiff !== 0 && (
              <div>
                <p className="metric__label">Ajuste</p>
                <p className="metric__value" style={{ fontSize: 22, color: precioDiff > 0 ? "var(--err)" : "var(--ok)" }}>
                  {precioDiff > 0 ? "+" : ""}{formatARS(precioDiff)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info adicional */}
        <div className="card">
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {viaje.conductor && (
              <div>
                <p className="metric__label">Conductor</p>
                <p style={{ fontSize: 13, color: "var(--ink)", marginTop: 4 }}>
                  {viaje.conductor.usuario.nombre} {viaje.conductor.usuario.apellido}
                </p>
                {viaje.conductor.calificacion != null && (
                  <p style={{ fontSize: 11.5, color: "var(--warn)", marginTop: 2 }}>
                    ★ {viaje.conductor.calificacion.toFixed(1)}
                  </p>
                )}
              </div>
            )}
            <div>
              <p className="metric__label">Duración</p>
              <p style={{ fontSize: 13, color: viaje.duracion_real ? "var(--ink)" : "var(--ink-4)", marginTop: 4 }}>
                {formatDuracion(viaje.duracion_real)}
              </p>
            </div>
            <div>
              <p className="metric__label">Distancia</p>
              <p style={{ fontSize: 13, color: viaje.km_reales ? "var(--ink)" : "var(--ink-4)", marginTop: 4 }}>
                {viaje.km_reales != null ? `${viaje.km_reales} km` : "—"}
              </p>
            </div>
            {viaje.alertas_count != null && viaje.alertas_count > 0 && (
              <div>
                <p className="metric__label">Alertas</p>
                <p style={{ fontSize: 13, color: "var(--err)", marginTop: 4, fontWeight: 600 }}>
                  {viaje.alertas_count}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Historial de alertas */}
        {viaje.alertas && viaje.alertas.length > 0 && (
          <div className="card">
            <p className="metric__label" style={{ marginBottom: 12 }}>Historial de alertas</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {viaje.alertas.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span className="status CANCELADO" style={{ flexShrink: 0, fontSize: 10 }}>{a.tipo}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12.5, color: "var(--ink)" }}>{a.descripcion}</p>
                    <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                      {fmtDate(a.creado_en)} · {fmtTime(a.creado_en)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón PDF */}
        {viaje.estado === "ENTREGADO" && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <a
              href={`/api/viajes/${viaje.id_viaje}/remito`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ textDecoration: "none" }}
            >
              Descargar remito PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ParadaItem({
  dot,
  direccion,
  estado,
  hora,
  small = false,
}: {
  dot: "circle-accent" | "circle-muted" | "square";
  direccion: string;
  estado?: string;
  hora?: string | null;
  small?: boolean;
}) {
  const dotStyle: React.CSSProperties =
    dot === "circle-accent"
      ? { position: "absolute", left: 3, width: 11, height: 11, borderRadius: "50%", background: "var(--accent)", border: "2px solid var(--surface)", boxShadow: "0 0 0 1.5px var(--accent)" }
      : dot === "square"
      ? { position: "absolute", left: 3, width: 11, height: 11, borderRadius: 2, background: "var(--ink)", border: "2px solid var(--surface)", boxShadow: "0 0 0 1.5px var(--ink)" }
      : { position: "absolute", left: 5, width: 7, height: 7, borderRadius: "50%", background: "var(--line-strong)" };

  const estadoLabel = estado ?? "PENDIENTE";
  const entregada = estadoLabel === "ENTREGADO";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <div style={dotStyle} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: small ? 12 : 13, color: small ? "var(--ink-3)" : "var(--ink)" }}>{direccion}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: entregada ? "var(--ok)" : "var(--ink-4)",
            }}
          >
            {estadoLabel}
          </span>
          {entregada && hora && (
            <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
              {fmtDate(hora)} · {fmtTime(hora)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
