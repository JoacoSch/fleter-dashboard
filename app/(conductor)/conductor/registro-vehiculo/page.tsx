"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const TIPOS = [
  { value: "camioneta", label: "Camioneta" },
  { value: "furgon",    label: "Furgón" },
  { value: "camion",    label: "Camión" },
  { value: "utilitario", label: "Utilitario" },
  { value: "pickup",    label: "Pick-up" },
];

const CONDICIONES = [
  { value: "FRAGIL",       label: "Frágil" },
  { value: "REFRIGERADO",  label: "Refrigerado" },
  { value: "CARGA_PESADA", label: "Carga pesada" },
  { value: "PELIGROSO",    label: "Peligroso" },
  { value: "VOLUMINOSO",   label: "Voluminoso" },
];

const ANIO_MIN = 1990;
const ANIO_MAX = new Date().getFullYear();

export default function RegistroVehiculoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    patente: "",
    marca: "",
    modelo: "",
    anio: "",
    color: "",
    tipo_vehiculo: "",
  });
  const [condiciones, setCondiciones] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setError("");
    setLoading(true);
    try {
      await api.post("/api/conductores/mis-vehiculos", {
        ...form,
        anio: parseInt(form.anio, 10),
        condiciones,
      });
      router.push("/conductor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar el vehículo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card" style={{ maxWidth: 520 }}>
      <div className="auth-brand">
        <div className="brand-mark">F</div>
        <span className="brand-name">Fleter<em>.</em></span>
      </div>

      <h1 className="auth-title">Registrá tu vehículo</h1>
      <p className="auth-subtitle">Necesitás al menos un vehículo para recibir viajes</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label htmlFor="patente">Patente</label>
            <input
              id="patente"
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
            <label htmlFor="anio">Año</label>
            <input
              id="anio"
              type="number"
              placeholder="2020"
              value={form.anio}
              onChange={set("anio")}
              required
              min={ANIO_MIN}
              max={ANIO_MAX}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label htmlFor="marca">Marca</label>
            <input id="marca" type="text" placeholder="Ford" value={form.marca} onChange={set("marca")} required />
          </div>
          <div className="field">
            <label htmlFor="modelo">Modelo</label>
            <input id="modelo" type="text" placeholder="Transit" value={form.modelo} onChange={set("modelo")} required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label htmlFor="color">Color</label>
            <input id="color" type="text" placeholder="Blanco" value={form.color} onChange={set("color")} required />
          </div>
          <div className="field">
            <label htmlFor="tipo_vehiculo">Tipo de vehículo</label>
            <select id="tipo_vehiculo" value={form.tipo_vehiculo} onChange={set("tipo_vehiculo")} required>
              <option value="">Seleccioná...</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Condiciones que puede manejar <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(opcional)</span></label>
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

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Registrando..." : "Registrar vehículo"}
        </button>
      </form>

      <p className="auth-footer auth-footer--mt20" style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={() => router.push("/conductor")}
          className="auth-link"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          Omitir por ahora
        </button>
      </p>
    </div>
  );
}
