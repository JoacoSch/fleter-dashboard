"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PerfilData {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  telefono?: string;
  fecha_registro?: string;
  rol: string;
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <p className="metric__label">{label}</p>
      <p style={{ fontSize: 13.5, color: value ? "var(--ink)" : "var(--ink-4)" }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<PerfilData>("/api/auth/me")
      .then(setPerfil)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar el perfil"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2>Perfil</h2>
        <p>Tus datos de cuenta.</p>
      </div>

      {loading && (
        <div className="card" style={{ maxWidth: 560 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 36, background: "var(--surface-2)", borderRadius: 4, marginBottom: 16 }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ maxWidth: 560, color: "var(--err)", fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && perfil && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
          <div className="card">
            <p className="metric__label" style={{ marginBottom: 16 }}>Datos personales</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Row label="Nombre" value={perfil.nombre} />
              <Row label="Apellido" value={perfil.apellido} />
              <Row label="DNI" value={perfil.dni} />
              <Row label="Teléfono" value={perfil.telefono} />
            </div>
          </div>

          <div className="card">
            <p className="metric__label" style={{ marginBottom: 16 }}>Cuenta</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Row label="Email" value={perfil.email} />
              <Row label="Rol" value={perfil.rol} />
              {perfil.fecha_registro && (
                <Row
                  label="Miembro desde"
                  value={new Date(perfil.fecha_registro).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                />
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
