"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useViajeActivo } from "@/hooks/useViajeActivo";
import type { ViajeFinalizadoPayload } from "@/hooks/useViajeActivo";
import { api } from "@/lib/api";
import { formatARS } from "@/lib/utils";
import { ESTADO_LABEL_ACTIVO } from "@/lib/estados";
import { ChevronLeft, Phone, Star, Truck, AlertTriangle, Package } from "lucide-react";

const MapaViajeActivo = dynamic(
  () => import("@/components/MapaViajeActivo").then((m) => m.MapaViajeActivo),
  { ssr: false, loading: () => <div className="viaje-track__map-canvas viaje-track__map-canvas--loading" /> }
);

const ACTIVE_ESTADOS = new Set([
  "CONDUCTOR_ASIGNADO",
  "EN_CAMINO_A_ORIGEN",
  "EN_RUTA",
  "CARGANDO",
  "DESCARGANDO",
]);

const ESTADO_LABELS: Record<string, string> = ESTADO_LABEL_ACTIVO;

interface ViajeListItem {
  id_viaje: number;
  zona: string;
  estado: string;
  precio_estimado: number;
  fecha_programada: string;
  creado_en: string;
  paradas: { orden: number; direccion: string }[];
  conductor: { usuario: { nombre: string; apellido: string } } | null;
}

// ── List view ────────────────────────────────────────────────────────────────

function ViajeListView() {
  const [viajes, setViajes] = useState<ViajeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get<ViajeListItem[]>("/api/viajes/mis-viajes")
      .then((data) => setViajes(data.filter((v) => ACTIVE_ESTADOS.has(v.estado))))
      .finally(() => setLoading(false));
  }, []);

  // Single active trip → auto-redirect (in effect to avoid setState-during-render).
  // Must run before any conditional return to keep hook order stable.
  useEffect(() => {
    if (!loading && viajes.length === 1) {
      router.replace(`/viaje-activo?id=${viajes[0].id_viaje}`);
    }
  }, [loading, viajes, router]);

  if (loading) {
    return (
      <div className="viaje-activo-list">
        <div className="section-header"><h2>Viajes en curso</h2></div>
        {[1, 2].map((i) => (
          <div key={i} className="card" style={{ height: 90, background: "var(--surface-2)" }} />
        ))}
      </div>
    );
  }

  if (viajes.length === 0) {
    return (
      <div className="viaje-activo-list">
        <div className="section-header"><h2>Viajes en curso</h2></div>
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--ink-4)" }}>
          <Truck size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontWeight: 600, fontSize: 15 }}>No tenés viajes activos</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Cuando solicites un flete vas a poder seguirlo desde acá</p>
          <Link href="/pedir-viaje" className="btn" style={{ display: "inline-block", marginTop: 20 }}>
            Solicitar flete
          </Link>
        </div>
      </div>
    );
  }

  if (viajes.length === 1) return null;

  return (
    <div className="viaje-activo-list">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h2>Viajes en curso</h2>
          <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 4 }}>
            {viajes.length} viajes activos — seleccioná uno para seguirlo
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {viajes.map((v) => {
          const destino = v.paradas.length > 0
            ? v.paradas.reduce((m, p) => p.orden > m.orden ? p : m, v.paradas[0]).direccion
            : "—";
          const origen = v.paradas.length > 0
            ? v.paradas.reduce((m, p) => p.orden < m.orden ? p : m, v.paradas[0]).direccion
            : "—";
          return (
            <Link
              key={v.id_viaje}
              href={`/viaje-activo?id=${v.id_viaje}`}
              className="card viaje-activo-list__item"
            >
              <div className="viaje-activo-list__item-header">
                <span className="viaje-activo-list__id">VJ-{v.id_viaje}</span>
                <span className="viaje-activo-list__estado">{ESTADO_LABELS[v.estado] ?? v.estado}</span>
              </div>
              <div className="viaje-activo-list__route">
                <div className="viaje-activo-list__stop">
                  <span className="viaje-activo-list__dot viaje-activo-list__dot--origin" />
                  <span>{origen}</span>
                </div>
                <div className="viaje-activo-list__line" />
                <div className="viaje-activo-list__stop">
                  <span className="viaje-activo-list__dot viaje-activo-list__dot--dest" />
                  <span>{destino}</span>
                </div>
              </div>
              <div className="viaje-activo-list__footer">
                {v.conductor && (
                  <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
                    {v.conductor.usuario.nombre} {v.conductor.usuario.apellido}
                  </span>
                )}
                <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  {formatARS(v.precio_estimado)} est.
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Finalizado overlay ───────────────────────────────────────────────────────

function FinalizadoOverlay({ data }: { data: ViajeFinalizadoPayload }) {
  return (
    <div className="finalizado-overlay">
      <div className="card finalizado-overlay__card">
        <div className="finalizado-overlay__icon">✓</div>
        <h2>Viaje finalizado</h2>
        <p className="finalizado-overlay__sub">El conductor completó todas las entregas</p>
        <div className="finalizado-overlay__cost">
          <p className="finalizado-overlay__cost-label">Costo final</p>
          <p className="finalizado-overlay__cost-value">{formatARS(data.precio_real)}</p>
          {data.desglose && (
            <div className="finalizado-overlay__desglose">
              {data.desglose.distancia_km > 0 && <span>{data.desglose.distancia_km.toFixed(1)} km</span>}
              {data.desglose.tiempo_horas > 0 && <span>{(data.desglose.tiempo_horas * 60).toFixed(0)} min</span>}
            </div>
          )}
        </div>
        {data.remito_url && (
          <a href={data.remito_url} target="_blank" rel="noreferrer" className="btn" style={{ display: "block", marginBottom: 10 }}>
            Descargar remito
          </a>
        )}
        <Link href="/viajes" className="btn btn--ghost" style={{ display: "block" }}>
          Ver mis viajes
        </Link>
      </div>
    </div>
  );
}

// ── Tracking view ────────────────────────────────────────────────────────────

function TrackingView({ idViaje }: { idViaje: number }) {
  const { viaje, costo, estado, ultimaPos, ruta, eta, alertas, finalizado, loading, error } = useViajeActivo(idViaje);
  const [panelOpen, setPanelOpen] = useState(true);

  if (loading) {
    return (
      <div className="viaje-track">
        <div className="viaje-track__map-placeholder">
          <div style={{ color: "var(--ink-4)", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
            <p>Cargando viaje...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error-banner" style={{ margin: 32 }}>{error}</div>;
  }

  if (!viaje) return null;

  const paradas = [...viaje.paradas].sort((a, b) => a.orden - b.orden);
  const paradasEntregadas = paradas.filter((p) => p.estado === "ENTREGADO").length;
  const estadoActual = estado ?? viaje.estado;

  return (
    <div className="viaje-track">
      {finalizado && <FinalizadoOverlay data={finalizado} />}

      {/* Map area */}
      <div className="viaje-track__map">
        {/* Floating top-left: back + trip ID */}
        <div className="viaje-track__map-topbar">
          <Link href="/viaje-activo" className="viaje-track__back-btn">
            <ChevronLeft size={16} />
            Volver
          </Link>
          <div className="viaje-track__map-id">VJ-{viaje.id_viaje}</div>
          <div className="viaje-track__estado-badge">
            <span className="nav-item__live-dot" style={{ width: 7, height: 7 }} />
            {ESTADO_LABELS[estadoActual] ?? estadoActual.replace(/_/g, " ")}
          </div>
        </div>

        <div className="viaje-track__map-canvas">
          <MapaViajeActivo paradas={viaje.paradas} ultimaPos={ultimaPos} ruta={ruta} />
        </div>

        {/* Floating bottom: ETA pill (el acumulado no se muestra por diseño) */}
        {eta && (
          <div className="viaje-track__cost-pill">
            <span className="viaje-track__cost-label">Llega en</span>
            <span className="viaje-track__cost-value">~{eta.minutos_restantes} min</span>
          </div>
        )}

        {/* Floating alerts */}
        {alertas.length > 0 && (
          <div className="viaje-track__alerts">
            {alertas.slice(0, 2).map((a) => (
              <div key={a.id} className={`viaje-track__alert viaje-track__alert--${a.tipo}`}>
                <AlertTriangle size={13} />
                <span>{a.mensaje}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className={`viaje-track__panel${panelOpen ? "" : " viaje-track__panel--collapsed"}`}>
        <button
          type="button"
          className="viaje-track__panel-toggle"
          onClick={() => setPanelOpen((v) => !v)}
          aria-label={panelOpen ? "Ocultar panel" : "Mostrar panel"}
        >
          {panelOpen ? "›" : "‹"}
        </button>

        <div className="viaje-track__panel-content">
          {/* Conductor */}
          {viaje.conductor && (
            <div className="viaje-track__section">
              <p className="viaje-track__section-title">Conductor</p>
              <div className="viaje-track__conductor">
                <div className="viaje-track__conductor-avatar">
                  {viaje.conductor.usuario.nombre[0]}{viaje.conductor.usuario.apellido[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="viaje-track__conductor-name">
                    {viaje.conductor.usuario.nombre} {viaje.conductor.usuario.apellido}
                  </p>
                  <div className="viaje-track__conductor-meta">
                    <span className="viaje-track__rating">
                      <Star size={11} fill="currentColor" style={{ color: "#F59E0B" }} />
                      {viaje.conductor.calificacion_promedio.toFixed(1)}
                    </span>
                    {viaje.vehiculo && (
                      <span>{viaje.vehiculo.tipo_vehiculo}</span>
                    )}
                  </div>
                  {viaje.vehiculo && (
                    <div className="viaje-track__vehiculo-info">
                      <span className="viaje-track__patente-sm">{viaje.vehiculo.patente}</span>
                      <span className="viaje-track__vehiculo-nombre">{viaje.vehiculo.marca} {viaje.vehiculo.modelo}</span>
                    </div>
                  )}
                </div>
                <a
                  href={`tel:${viaje.conductor.usuario.telefono}`}
                  className="viaje-track__call-btn"
                  title="Llamar al conductor"
                >
                  <Phone size={15} />
                </a>
              </div>
            </div>
          )}

          {/* Paradas */}
          <div className="viaje-track__section">
            <div className="viaje-track__section-header">
              <p className="viaje-track__section-title">Paradas</p>
              <span className="viaje-track__section-badge">{paradasEntregadas}/{paradas.length}</span>
            </div>
            <div className="viaje-track__stops">
              {paradas.map((p, idx) => {
                const isDone = p.estado === "ENTREGADO";
                const isLast = idx === paradas.length - 1;
                const firstPending = paradas.find((s) => s.estado === "PENDIENTE");
                const isActive = !isDone && p.orden === firstPending?.orden;
                const statusVariant = isDone ? "done" : isActive ? "active" : "pending";
                const statusLabel = isDone
                  ? `Confirmado${p.fecha_entrega ? ` · ${new Date(p.fecha_entrega).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}` : ""}`
                  : isActive
                  ? "En camino"
                  : "Pendiente";
                return (
                  <div key={p.orden} className="viaje-track__stop-row">
                    <div className="viaje-track__stop-rail">
                      <div className={`viaje-track__stop-dot${isDone ? " is-done" : ""}`}>
                        {isDone ? "✓" : p.orden}
                      </div>
                      {!isLast && <div className={`viaje-track__stop-line${isDone ? " is-done" : ""}`} />}
                    </div>
                    <div className="viaje-track__stop-info">
                      <p className={`viaje-track__stop-addr${isDone ? " is-done" : ""}`}>{p.direccion}</p>
                      <p className={`viaje-track__stop-status viaje-track__stop-status--${statusVariant}`}>
                        {isDone && <Package size={9} style={{ marginRight: 3, verticalAlign: "middle" }} />}
                        {statusLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Costo desglose */}
          {costo?.desglose && (
            <div className="viaje-track__section">
              <p className="viaje-track__section-title">Desglose</p>
              <div className="viaje-track__desglose">
                {costo.desglose.tarifa_km != null && (
                  <div className="viaje-track__desglose-row">
                    <span>Tarifa km</span><span>{formatARS(costo.desglose.tarifa_km)}</span>
                  </div>
                )}
                {costo.desglose.distancia_km > 0 && (
                  <div className="viaje-track__desglose-row">
                    <span>Distancia</span><span>{costo.desglose.distancia_km.toFixed(1)} km</span>
                  </div>
                )}
                {/*
                  En un viaje MIXTO no se factura el total medido: se cobra la
                  distancia por la parte en provincia y el tiempo por la parte
                  en CABA. Sólo se muestran estas filas cuando lo facturado
                  difiere del total, para no repetir el mismo número en los
                  viajes de zona pura.
                */}
                {costo.desglose.distancia_provincia != null &&
                  costo.desglose.distancia_provincia < costo.desglose.distancia_km && (
                    <div className="viaje-track__desglose-row">
                      <span>Distancia facturada</span>
                      <span>{costo.desglose.distancia_provincia.toFixed(1)} km</span>
                    </div>
                  )}
                {costo.desglose.tiempo_horas > 0 && (
                  <div className="viaje-track__desglose-row">
                    <span>Tiempo</span><span>{(costo.desglose.tiempo_horas * 60).toFixed(0)} min</span>
                  </div>
                )}
                {costo.desglose.tiempo_capital != null &&
                  costo.desglose.tiempo_capital < costo.desglose.tiempo_horas && (
                    <div className="viaje-track__desglose-row">
                      <span>Tiempo facturado</span>
                      <span>{(costo.desglose.tiempo_capital * 60).toFixed(0)} min</span>
                    </div>
                  )}
                {costo.desglose.es_hora_pico && (
                  <div className="viaje-track__desglose-row viaje-track__desglose-row--warn">
                    <span>⚡ Hora pico</span><span>activo</span>
                  </div>
                )}
                <div className="viaje-track__desglose-total">
                  <span>Estimado</span><span>{formatARS(viaje.precio_estimado)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ETA + precio estimado */}
          <div className="viaje-track__section viaje-track__section--eta">
            <div className="viaje-track__eta-row">
              <span>Precio estimado</span>
              <span>{formatARS(viaje.precio_estimado)}</span>
            </div>
            <div className="viaje-track__eta-row viaje-track__eta-row--muted">
              <span>ETA</span>
              <span>—</span>
            </div>
          </div>

          {/* Alertas */}
          {alertas.length > 0 && (
            <div className="viaje-track__section">
              <p className="viaje-track__section-title">Alertas</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {alertas.map((a) => (
                  <div key={a.id} className={`viaje-track__alert-item viaje-track__alert-item--${a.tipo}`}>
                    <AlertTriangle size={12} />
                    <div>
                      <p>{a.mensaje}</p>
                      <span>{new Date(a.timestamp).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Entry point ──────────────────────────────────────────────────────────────

function ViajeActivoContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  if (idParam) {
    const idViaje = parseInt(idParam, 10);
    return <TrackingView idViaje={idViaje} />;
  }

  return <ViajeListView />;
}

export default function ViajeActivoPage() {
  return (
    <Suspense>
      <ViajeActivoContent />
    </Suspense>
  );
}
