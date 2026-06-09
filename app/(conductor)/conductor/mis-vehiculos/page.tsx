"use client";

import { useState, useEffect, type FormEvent } from "react";
import { api } from "@/lib/api";

interface Condicion {
  id_condicion: number;
  id_vehiculo: number;
  condicion: string;
}

interface Vehiculo {
  id_vehiculo: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  tipo_vehiculo: string;
  condiciones: Condicion[];
}

const TIPOS = [
  { value: "camioneta",  label: "Camioneta" },
  { value: "furgon",     label: "Furgón" },
  { value: "camion",     label: "Camión" },
  { value: "utilitario", label: "Utilitario" },
  { value: "pickup",     label: "Pick-up" },
];

const CONDICIONES = [
  { value: "FRAGIL",       label: "Frágil" },
  { value: "REFRIGERADO",  label: "Refrigerado" },
  { value: "CARGA_PESADA", label: "Carga pesada" },
  { value: "PELIGROSO",    label: "Peligroso" },
  { value: "VOLUMINOSO",   label: "Voluminoso" },
];

const TIPO_LABEL: Record<string, string> = {
  camioneta: "Camioneta",
  furgon: "Furgón",
  camion: "Camión",
  utilitario: "Utilitario",
  pickup: "Pick-up",
};

const CONDICION_LABEL: Record<string, string> = {
  FRAGIL: "Frágil",
  REFRIGERADO: "Refrigerado",
  CARGA_PESADA: "Carga pesada",
  PELIGROSO: "Peligroso",
  VOLUMINOSO: "Voluminoso",
};

const ANIO_MAX = new Date().getFullYear();

const EMPTY_FORM = {
  patente: "",
  marca: "",
  modelo: "",
  anio: "",
  color: "",
  tipo_vehiculo: "",
};

export default function MisVehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [condiciones, setCondiciones] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    api.get<Vehiculo[]>("/api/conductores/mis-vehiculos")
      .then(setVehiculos)
      .catch((err) => setListError(err instanceof Error ? err.message : "Error al cargar vehículos"))
      .finally(() => setLoadingList(false));
  }, []);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function toggleCondicion(val: string) {
    setCondiciones((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const nuevo = await api.post<Vehiculo>("/api/conductores/mis-vehiculos", {
        ...form,
        anio: parseInt(form.anio, 10),
        condiciones,
      });
      setVehiculos((prev) => [...prev, nuevo]);
      setForm(EMPTY_FORM);
      setCondiciones([]);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al registrar el vehículo");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este vehículo?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/conductores/mis-vehiculos/${id}`);
      setVehiculos((prev) => prev.filter((v) => v.id_vehiculo !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el vehículo");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Mis vehículos</h1>
          <p className="page-subtitle">Gestioná los vehículos con los que operás</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => { setShowForm((v) => !v); setFormError(""); }}
        >
          {showForm ? "Cancelar" : "+ Registrar vehículo"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 28, padding: "24px 28px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18, color: "var(--ink)" }}>Nuevo vehículo</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label htmlFor="nv-patente">Patente</label>
                <input
                  id="nv-patente"
                  type="text"
                  placeholder="ABC123"
                  value={form.patente}
                  onChange={set("patente")}
                  required
                  minLength={6}
                  maxLength={8}
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              <div className="field">
                <label htmlFor="nv-anio">Año</label>
                <input
                  id="nv-anio"
                  type="number"
                  placeholder="2020"
                  value={form.anio}
                  onChange={set("anio")}
                  required
                  min={1990}
                  max={ANIO_MAX}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label htmlFor="nv-marca">Marca</label>
                <input id="nv-marca" type="text" placeholder="Ford" value={form.marca} onChange={set("marca")} required />
              </div>
              <div className="field">
                <label htmlFor="nv-modelo">Modelo</label>
                <input id="nv-modelo" type="text" placeholder="Transit" value={form.modelo} onChange={set("modelo")} required />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label htmlFor="nv-color">Color</label>
                <input id="nv-color" type="text" placeholder="Blanco" value={form.color} onChange={set("color")} required />
              </div>
              <div className="field">
                <label htmlFor="nv-tipo">Tipo de vehículo</label>
                <select id="nv-tipo" value={form.tipo_vehiculo} onChange={set("tipo_vehiculo")} required>
                  <option value="">Seleccioná...</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Condiciones <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(opcional)</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {CONDICIONES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`chip${condiciones.includes(c.value) ? " is-active" : ""}`}
                    onClick={() => toggleCondicion(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {formError && <p className="auth-error">{formError}</p>}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? "Registrando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadingList && (
        <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Cargando vehículos...</p>
      )}

      {listError && (
        <p className="auth-error">{listError}</p>
      )}

      {!loadingList && !listError && vehiculos.length === 0 && (
        <div className="card" style={{ padding: "40px 28px", textAlign: "center" }}>
          <p style={{ color: "var(--ink-3)", fontSize: 14 }}>No tenés vehículos registrados.</p>
          <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6 }}>
            Registrá uno para poder recibir viajes.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {vehiculos.map((v) => (
          <div
            key={v.id_vehiculo}
            className="card"
            style={{ padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)", letterSpacing: 1 }}>
                  {v.patente.toUpperCase()}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  {TIPO_LABEL[v.tipo_vehiculo] ?? v.tipo_vehiculo}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 4 }}>
                {v.marca} {v.modelo} — {v.anio} — {v.color}
              </p>
              {v.condiciones.length > 0 && (
                <div className="cred-list">
                  {v.condiciones.map((c) => (
                    <span key={c.id_condicion} className="cond">
                      {CONDICION_LABEL[c.condicion] ?? c.condicion}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn btn--ghost"
              style={{ fontSize: 13, color: "var(--err)", flexShrink: 0 }}
              disabled={deletingId === v.id_vehiculo}
              onClick={() => handleDelete(v.id_vehiculo)}
            >
              {deletingId === v.id_vehiculo ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
