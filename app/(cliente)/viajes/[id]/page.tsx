"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatARS, fmtDate, fmtTime, formatDuracion } from "@/lib/utils";
import { ESTADO_LABEL as ESTADO_LABEL_BASE, esFinalizado } from "@/lib/estados";

const ESTADO_LABEL: Record<string, string> = {
  ...ESTADO_LABEL_BASE,
  // El cliente ve el estado de la parada además del estado del viaje.
  ENTREGADO: "ENTREGADO",
  FINALIZADO: "FINALIZADO",
};

const ESTADO_CSS: Record<string, string> = {
  ENTREGADO: "ENTREGADO",
  FINALIZADO: "ENTREGADO",
  CANCELADO: "CANCELADO",
  BUSCANDO_CONDUCTOR: "BUSCANDO_FLETERO",
  RESERVADO_POR_EMPRESA: "BUSCANDO_FLETERO",
  CONDUCTOR_ASIGNADO: "BUSCANDO_FLETERO",
  EN_CAMINO_A_ORIGEN: "EN_RUTA",
  CARGANDO: "EN_RUTA",
  EN_RUTA: "EN_RUTA",
  DESCARGANDO: "EN_RUTA",
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
    calificacion_promedio?: number | null;
  } | null;
}

function initials(nombre: string, apellido: string): string {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

export default function ViajeDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [viaje, setViaje] = useState<ViajeDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remitoLoading, setRemitoLoading] = useState(false);
  const [remitoError, setRemitoError] = useState<string | null>(null);

  /**
   * El endpoint no devuelve el PDF sino JSON `{ remito_url }` con una URL
   * pública de R2. Hay que pedirlo con `api` (que agrega BASE_URL y el
   * Authorization) y recién después abrir esa URL.
   */
  async function abrirRemito() {
    setRemitoLoading(true);
    setRemitoError(null);
    try {
      const { remito_url } = await api.get<{ remito_url: string }>(
        `/api/viajes/${id}/remito`,
      );
      window.open(remito_url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setRemitoError(e instanceof Error ? e.message : "No se pudo obtener el remito");
    } finally {
      setRemitoLoading(false);
    }
  }

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
        <button className="btn btn--ghost" style={{ marginBottom: 14 }} onClick={() => router.back()} type="button">← Volver al record</button>
        <div className="detail__col">
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
        <button className="btn btn--ghost" style={{ marginBottom: 14 }} onClick={() => router.back()} type="button">← Volver al record</button>
        <div className="error-banner">{error ?? "Viaje no encontrado."}</div>
      </div>
    );
  }

  const paradas = [...viaje.paradas].sort((a, b) => a.orden - b.orden);
  const origen = paradas[0]?.direccion ?? "—";
  const destino = paradas[paradas.length - 1]?.direccion ?? "—";

  const isoStr = viaje.fecha_programada ?? viaje.creado_en;
  const estadoCss = ESTADO_CSS[viaje.estado] ?? viaje.estado;
  const estadoLabel = ESTADO_LABEL[viaje.estado] ?? viaje.estado;
  const precioDiff = viaje.precio_real != null ? viaje.precio_real - viaje.precio_estimado : null;
  const overTime = false; // duracion_estimada pendiente

  return (
    <div>
      <button className="btn btn--ghost" onClick={() => router.back()} style={{ marginBottom: 14 }} type="button">
        ← Volver al record
      </button>

      <div className="detail">
        {/* Header */}
        <div className="detail__head">
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className={`status ${estadoCss}`}>{estadoLabel}</span>
              <span className={`zone-tag ${viaje.zona}`}>{viaje.zona}</span>
              <span className="trip-row__id">VJ-{viaje.id_viaje}</span>
            </div>
            <h2>{origen} → {destino}</h2>
            <p className="detail__head-meta">
              {new Date(isoStr).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · {fmtTime(isoStr)}
            </p>
          </div>
          {viaje.precio_real != null && (
            <div className="detail__price">
              <p className="metric__label">Precio final</p>
              <p className="metric__value">
                <sup>$</sup>{viaje.precio_real.toLocaleString("es-AR")}
                {precioDiff != null && precioDiff !== 0 && (
                  <span className={`delta ${precioDiff > 0 ? "delta--down" : "delta--up"}`}>
                    {precioDiff > 0 ? "+" : ""}{formatARS(precioDiff)}
                  </span>
                )}
              </p>
              <p className="metric__hint" style={{ textAlign: "right" }}>
                Estimado: {formatARS(viaje.precio_estimado)}
              </p>
            </div>
          )}
        </div>

        {/* Columna izquierda */}
        <div className="detail__col">
          {/* Tiempo del viaje */}
          <div className="card">
            <p className="card-title">Tiempo del viaje</p>
            <p className="card-sub">Estimado vs. real al cierre</p>
            <div className="time-compare">
              <div className="time-cell">
                <div className="time-cell__label">Estimado</div>
                <div className="time-cell__value">—</div>
              </div>
              <div className={`time-cell${overTime ? " time-cell--over" : ""}`}>
                <div className="time-cell__label">Real</div>
                <div className="time-cell__value">{formatDuracion(viaje.duracion_real)}</div>
              </div>
            </div>
            <div className="kv-grid" style={{ marginTop: 14 }}>
              <div className="kv">
                <span>Km recorridos</span>
                <strong>{viaje.km_reales != null ? `${viaje.km_reales} km` : "—"}</strong>
              </div>
              <div className="kv">
                <span>Carga</span>
                <strong>—</strong>
              </div>
              <div className="kv">
                <span>Peso</span>
                <strong>—</strong>
              </div>
              <div className="kv">
                <span>Tipo de zona</span>
                <strong>{viaje.zona}</strong>
              </div>
            </div>
          </div>

          {/* Paradas */}
          {paradas.length > 0 && (
            <div className="card">
              <p className="card-title">Recorrido y paradas</p>
              <p className="card-sub">{paradas.length} parada{paradas.length !== 1 ? "s" : ""}</p>
              <div className="timeline">
                {paradas.map((p, i) => {
                  const done = p.estado === "ENTREGADO";
                  return (
                    <div className="tl-item" key={i}>
                      <div className="tl-marker">
                        <span className={`tl-marker__dot${done ? " done" : ""}`} />
                        <span className="tl-marker__line" />
                      </div>
                      <div className="tl-body">
                        <strong>Parada {p.orden} — {p.direccion}</strong>
                        <span>{done ? "Confirmada" : "Pendiente"}</span>
                      </div>
                      <div className="tl-time">
                        {p.hora_entrega ? fmtTime(p.hora_entrega) : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alertas */}
          <div className="card">
            <p className="card-title">Alertas detectadas</p>
            <p className="card-sub">{viaje.alertas?.length ?? 0} eventos durante el recorrido</p>
            {(!viaje.alertas || viaje.alertas.length === 0) ? (
              <div className="ok-state">
                <span className="ok-state__dot" />
                Sin alertas — viaje sin desvíos ni paradas sospechosas.
              </div>
            ) : (
              viaje.alertas.map((a, i) => (
                <div className="alert-row" key={i}>
                  <div className="alert-row__icon">⚠</div>
                  <div>
                    <strong>{a.tipo === "DESVIO" ? "Desvío de ruta" : "Parada sospechosa"}</strong>
                    <span>{a.descripcion}</span>
                  </div>
                  <time>{fmtDate(a.creado_en)} · {fmtTime(a.creado_en)}</time>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="detail__col">
          {/* Chofer */}
          <div className="card">
            <p className="card-title">Chofer</p>
            {viaje.conductor ? (
              <div className="driver-card">
                <div className="driver-avatar">
                  {initials(viaje.conductor.usuario.nombre, viaje.conductor.usuario.apellido)}
                </div>
                <div className="driver-info">
                  <strong>{viaje.conductor.usuario.nombre} {viaje.conductor.usuario.apellido}</strong>
                  <span>Conductor titular</span>
                  {viaje.conductor.calificacion_promedio != null && (
                    <span className="rating">★ {viaje.conductor.calificacion_promedio.toFixed(1)} / 5.0</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty" style={{ padding: 14 }}>Sin chofer asignado</div>
            )}
          </div>

          {/* Vehículo — pendiente de datos del backend */}
          <div className="card">
            <p className="card-title">Vehículo utilizado</p>
            <div className="empty" style={{ padding: "12px 0", fontSize: 12 }}>
              Sin datos del vehículo disponibles
            </div>
          </div>

          {/* Resumen de cobro */}
          <div className="card">
            <p className="card-title">Resumen de cobro</p>
            <div className="billing-rows">
              <div className="billing-row">
                <div>
                  <div className="billing-row__label">Precio estimado</div>
                  <div className="billing-row__sub">Al momento de solicitar</div>
                </div>
                <span className="billing-row__amount">{formatARS(viaje.precio_estimado)}</span>
              </div>
              {viaje.precio_real != null && (
                <div className="billing-row">
                  <div>
                    <div className="billing-row__label">Precio final</div>
                    <div className="billing-row__sub">Al cierre del viaje</div>
                  </div>
                  <span className="billing-row__amount">{formatARS(viaje.precio_real)}</span>
                </div>
              )}
              {precioDiff != null && precioDiff !== 0 && (
                <div className="billing-row">
                  <div>
                    <div className="billing-row__label">Diferencia</div>
                    <div className="billing-row__sub">{precioDiff > 0 ? "Ajuste por encima" : "Ajuste a favor"}</div>
                  </div>
                  <span className={`billing-row__amount ${precioDiff > 0 ? "billing-row__amount--up" : "billing-row__amount--down"}`}>
                    {precioDiff > 0 ? "+" : ""}{formatARS(precioDiff)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PDF remito — sólo existe para viajes finalizados */}
          {esFinalizado(viaje.estado) && (
            <>
              <button
                type="button"
                className="btn btn--full"
                onClick={abrirRemito}
                disabled={remitoLoading}
              >
                {remitoLoading ? "Abriendo remito..." : "Descargar remito PDF"}
              </button>
              {remitoError && (
                <p style={{ fontSize: 12.5, color: "var(--err)", marginTop: 8 }}>
                  {remitoError}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
