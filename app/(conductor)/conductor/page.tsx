"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";

const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";

interface Parada {
  orden: number;
  direccion: string;
}

interface Condicion {
  condicion: string;
}

interface ViajeDisponible {
  id_viaje: number;
  zona: "CABA" | "PROVINCIA" | "MIXTO";
  precio_estimado: number;
  fecha_programada: string;
  estado: string;
  paradas: Parada[];
  condiciones_req: Condicion[];
  cliente: { usuario: { nombre: string; apellido: string; telefono: string } };
}

interface ViajeAsignado {
  id_viaje: number;
  conductor: { nombre: string; apellido: string };
  vehiculo: { patente: string; marca: string; modelo: string } | null;
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtARS(n: number) {
  return "$" + Math.round(n).toLocaleString("es-AR");
}

export default function ConductorPage() {
  const [viajes, setViajes] = useState<ViajeDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [aceptando, setAceptando] = useState<number | null>(null);
  const [asignado, setAsignado] = useState<ViajeAsignado | null>(null);
  const [yaAsignado, setYaAsignado] = useState<number | null>(null);

  const { socket } = useSocket();
  const socketRef = useRef(socket);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  useEffect(() => {
    api.get<ViajeDisponible[]>("/api/viajes/disponibles")
      .then(setViajes)
      .catch(() => setViajes([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (MOCK || !socket) return;

    socket.on("viaje:disponible", (data: ViajeDisponible) => {
      setViajes((prev) => {
        if (prev.some((v) => v.id_viaje === data.id_viaje)) return prev;
        return [data, ...prev];
      });
    });

    socket.on("viaje:conductor_asignado", (data: ViajeAsignado) => {
      setAceptando(null);
      setAsignado(data);
      setViajes((prev) => prev.filter((v) => v.id_viaje !== data.id_viaje));
    });

    socket.on("viaje:ya_asignado", (data: { id_viaje: number }) => {
      setAceptando(null);
      setYaAsignado(data.id_viaje);
      setViajes((prev) => prev.filter((v) => v.id_viaje !== data.id_viaje));
      setTimeout(() => setYaAsignado(null), 4000);
    });

    return () => {
      socket.off("viaje:disponible");
      socket.off("viaje:conductor_asignado");
      socket.off("viaje:ya_asignado");
    };
  }, [socket]);

  function aceptarViaje(id_viaje: number) {
    if (MOCK) {
      setAceptando(id_viaje);
      setTimeout(() => {
        setAsignado({ id_viaje, conductor: { nombre: "Vos", apellido: "" }, vehiculo: null });
        setViajes((prev) => prev.filter((v) => v.id_viaje !== id_viaje));
        setAceptando(null);
      }, 1200);
      return;
    }

    if (!socketRef.current) return;
    setAceptando(id_viaje);
    socketRef.current.emit("viaje:aceptar", { id_viaje });
  }

  if (asignado) {
    return (
      <div>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <h2>¡Viaje aceptado!</h2>
          <p>Quedaste asignado al viaje VJ-{asignado.id_viaje}.</p>
        </div>
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <p className="metric__label">Viaje</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--ink)", marginTop: 4 }}>
                VJ-{asignado.id_viaje}
              </p>
            </div>
            {asignado.vehiculo && (
              <div>
                <p className="metric__label">Vehículo</p>
                <p style={{ fontSize: 13, color: "var(--ink)", marginTop: 4 }}>
                  {asignado.vehiculo.marca} {asignado.vehiculo.modelo} — {asignado.vehiculo.patente}
                </p>
              </div>
            )}
            <button
              className="btn btn--primary"
              style={{ marginTop: 8 }}
              onClick={() => setAsignado(null)}
            >
              Ver más viajes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2>Viajes disponibles</h2>
        <p>
          {loading
            ? "Cargando..."
            : viajes.length === 0
            ? "No hay viajes disponibles en este momento."
            : `${viajes.length} viaje${viajes.length !== 1 ? "s" : ""} esperando conductor`}
        </p>
      </div>

      {yaAsignado && (
        <div style={{
          marginBottom: 16,
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)",
          background: "var(--warn-soft)",
          color: "var(--warn)",
          fontSize: 13,
          fontWeight: 600,
        }}>
          Otro conductor llegó primero al viaje VJ-{yaAsignado}.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card" style={{ height: 120, background: "var(--surface-2)" }} />
            ))
          : viajes.map((viaje) => {
              const origen = viaje.paradas.find((p) => p.orden === 1);
              const destino = viaje.paradas[viaje.paradas.length - 1];
              const intermedias = viaje.paradas.length - 2;

              return (
                <div key={viaje.id_viaje} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
                        VJ-{viaje.id_viaje}
                      </span>
                      <span className={`zone-tag ${viaje.zona}`}>{viaje.zona}</span>
                      {viaje.condiciones_req.map((c) => (
                        <span
                          key={c.condicion}
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "var(--info-soft)",
                            color: "var(--info)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {c.condicion}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)", flexShrink: 0 }}>
                      {fmtARS(viaje.precio_estimado)}
                    </p>
                  </div>

                  {/* Ruta */}
                  <div style={{ position: "relative", paddingLeft: 28 }}>
                    <div style={{
                      position: "absolute",
                      left: 8,
                      top: 10,
                      bottom: 10,
                      width: 1.5,
                      background: "var(--line-strong)",
                    }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          position: "absolute",
                          left: 3,
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          background: "var(--accent)",
                          border: "2px solid var(--surface)",
                          boxShadow: "0 0 0 1.5px var(--accent)",
                        }} />
                        <p style={{ fontSize: 13, color: "var(--ink)" }}>{origen?.direccion}</p>
                      </div>
                      {intermedias > 0 && (
                        <p style={{ fontSize: 12, color: "var(--ink-3)", paddingLeft: 4 }}>
                          + {intermedias} parada{intermedias !== 1 ? "s" : ""} intermedia{intermedias !== 1 ? "s" : ""}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          position: "absolute",
                          left: 3,
                          width: 11,
                          height: 11,
                          borderRadius: 2,
                          background: "var(--ink)",
                          border: "2px solid var(--surface)",
                          boxShadow: "0 0 0 1.5px var(--ink)",
                        }} />
                        <p style={{ fontSize: 13, color: "var(--ink)" }}>{destino?.direccion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <p style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        {viaje.cliente.usuario.nombre} {viaje.cliente.usuario.apellido}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        {fmtFecha(viaje.fecha_programada)}
                      </p>
                    </div>
                    <button
                      className="btn btn--primary"
                      disabled={aceptando === viaje.id_viaje}
                      onClick={() => aceptarViaje(viaje.id_viaje)}
                      style={{ opacity: aceptando === viaje.id_viaje ? 0.7 : 1 }}
                    >
                      {aceptando === viaje.id_viaje ? "Aceptando..." : "Aceptar viaje"}
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
