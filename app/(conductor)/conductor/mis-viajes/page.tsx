"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Parada {
  orden: number;
  direccion: string;
}

interface MiViaje {
  id_viaje: number;
  estado: string;
  paradas: Parada[];
  cliente: { usuario: { nombre: string; apellido: string } };
}

function EmptyState() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px",
      gap: 12,
      color: "var(--ink-3)",
    }}>
      <span style={{ fontSize: 32 }}>📦</span>
      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-2)" }}>No tenés viajes asignados</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px",
      gap: 12,
    }}>
      <span style={{ fontSize: 32 }}>🔌</span>
      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-2)" }}>No se pudieron cargar los viajes</p>
      <p style={{ fontSize: 12, color: "var(--ink-3)" }}>El servicio no está disponible por el momento</p>
    </div>
  );
}

export default function MisViajesPage() {
  const [viajes, setViajes] = useState<MiViaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<MiViaje[]>("/api/conductor/mis-viajes")
      .then(setViajes)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2>Mis viajes</h2>
      </div>

      {!loading && error && <ErrorState />}
      {!loading && !error && viajes.length === 0 && <EmptyState />}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card" style={{ height: 100, background: "var(--surface-2)" }} />
            ))
          : viajes.map((v) => {
              const sorted = [...v.paradas].sort((a, b) => a.orden - b.orden);
              const origen = sorted[0]?.direccion ?? "—";
              const destino = sorted[sorted.length - 1]?.direccion ?? "—";
              const intermedias = sorted.length - 2;
              const cliente = `${v.cliente.usuario.nombre} ${v.cliente.usuario.apellido}`;

              return (
                <div key={v.id_viaje} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
                      VJ-{v.id_viaje}
                    </span>
                    <span className={`status ${v.estado}`}>
                      {v.estado.replace(/_/g, " ")}
                    </span>
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
                        <p style={{ fontSize: 13, color: "var(--ink)" }}>{origen}</p>
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
                        <p style={{ fontSize: 13, color: "var(--ink)" }}>{destino}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                    <p style={{ fontSize: 12, color: "var(--ink-3)" }}>{cliente}</p>
                  </div>

                </div>
              );
            })}
      </div>
    </div>
  );
}
