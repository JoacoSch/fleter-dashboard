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

      {loading && (
        <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Cargando...</p>
      )}

      {!loading && error && <ErrorState />}

      {!loading && !error && viajes.length === 0 && <EmptyState />}

      {!loading && !error && viajes.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "var(--ink-3)", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "var(--ink-3)", fontWeight: 500 }}>Origen</th>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "var(--ink-3)", fontWeight: 500 }}>Destino</th>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "var(--ink-3)", fontWeight: 500 }}>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {viajes.map((v) => {
                const sorted = [...v.paradas].sort((a, b) => a.orden - b.orden);
                const origen = sorted[0]?.direccion ?? "—";
                const destino = sorted[sorted.length - 1]?.direccion ?? "—";
                const cliente = `${v.cliente.usuario.nombre} ${v.cliente.usuario.apellido}`;
                return (
                  <tr key={v.id_viaje} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "10px 16px", color: "var(--ink-3)", fontFamily: "var(--font-mono, monospace)" }}>
                      VJ-{v.id_viaje}
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--ink)" }}>{origen}</td>
                    <td style={{ padding: "10px 16px", color: "var(--ink)" }}>{destino}</td>
                    <td style={{ padding: "10px 16px", color: "var(--ink)" }}>{cliente}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
