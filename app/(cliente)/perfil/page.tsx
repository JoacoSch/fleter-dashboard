"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PerfilData {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  telefono?: string;
  empresa?: string;
  cuit?: string;
  direccion?: string;
  fecha_registro?: string;
  rol: string;
}

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  marginBottom: 5,
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--line-strong)",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 13,
  fontFamily: "var(--font-ui)",
  boxSizing: "border-box",
};

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <p style={LABEL_STYLE}>{label}</p>
      <p style={{ fontSize: 13.5, color: value ? "var(--ink)" : "var(--ink-4)" }}>{value ?? "—"}</p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, val: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label htmlFor={name} style={LABEL_STYLE}>{label}</label>
      <input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        style={{ ...INPUT_STYLE, opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "text" }}
      />
    </div>
  );
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [draft, setDraft] = useState<Partial<PerfilData>>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PerfilData>("/api/auth/me")
      .then((data) => { setPerfil(data); setDraft(data); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar el perfil"))
      .finally(() => setLoading(false));
  }, []);

  function startEdit() {
    setDraft({ ...perfil });
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft({ ...perfil });
    setSaveError(null);
    setEditing(false);
  }

  async function saveEdit() {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.put<PerfilData>("/api/auth/perfil", {
        nombre: draft.nombre,
        apellido: draft.apellido,
        telefono: draft.telefono,
        empresa: draft.empresa,
        cuit: draft.cuit,
        direccion: draft.direccion,
      });
      setPerfil(updated);
      setDraft(updated);
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(name: string, val: string) {
    setDraft((prev) => ({ ...prev, [name]: val }));
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2>Perfil</h2>
          <p>Tus datos de cuenta.</p>
        </div>
        {!loading && !error && perfil && !editing && (
          <button className="btn" onClick={startEdit} type="button">Editar</button>
        )}
      </div>

      {loading && (
        <div className="card" style={{ maxWidth: 560 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 36, background: "var(--surface-2)", borderRadius: 4, marginBottom: 16 }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ maxWidth: 560, color: "var(--err)", fontSize: 13 }}>{error}</div>
      )}

      {!loading && !error && perfil && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
          {/* Datos personales */}
          <div className="card">
            <p className="metric__label" style={{ marginBottom: 16 }}>Datos personales</p>
            {editing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Nombre" name="nombre" value={draft.nombre ?? ""} onChange={handleChange} />
                <Field label="Apellido" name="apellido" value={draft.apellido ?? ""} onChange={handleChange} />
                <Field label="DNI" name="dni" value={draft.dni ?? ""} onChange={handleChange} disabled />
                <Field label="Teléfono" name="telefono" value={draft.telefono ?? ""} onChange={handleChange} type="tel" />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <Row label="Nombre" value={perfil.nombre} />
                <Row label="Apellido" value={perfil.apellido} />
                <Row label="DNI" value={perfil.dni} />
                <Row label="Teléfono" value={perfil.telefono} />
              </div>
            )}
          </div>

          {/* Datos de empresa */}
          <div className="card">
            <p className="metric__label" style={{ marginBottom: 16 }}>Empresa</p>
            {editing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Empresa" name="empresa" value={draft.empresa ?? ""} onChange={handleChange} />
                <Field label="CUIT" name="cuit" value={draft.cuit ?? ""} onChange={handleChange} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Dirección" name="direccion" value={draft.direccion ?? ""} onChange={handleChange} />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <Row label="Empresa" value={perfil.empresa} />
                <Row label="CUIT" value={perfil.cuit} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Row label="Dirección" value={perfil.direccion} />
                </div>
              </div>
            )}
          </div>

          {/* Cuenta */}
          <div className="card">
            <p className="metric__label" style={{ marginBottom: 16 }}>Cuenta</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Row label="Email" value={perfil.email} />
              <Row label="Rol" value={perfil.rol} />
              {perfil.fecha_registro && (
                <Row
                  label="Miembro desde"
                  value={new Date(perfil.fecha_registro).toLocaleDateString("es-AR", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                />
              )}
            </div>
          </div>

          {/* Acciones de edición */}
          {editing && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {saveError && (
                <p style={{ fontSize: 12.5, color: "var(--err)", background: "var(--err-soft)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
                  {saveError}
                </p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn--primary"
                  onClick={saveEdit}
                  disabled={saving}
                  type="button"
                  style={{ opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={cancelEdit}
                  disabled={saving}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
