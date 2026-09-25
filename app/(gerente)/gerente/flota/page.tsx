"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useEmpresa } from "@/hooks/useEmpresa";
import {
  CONDICIONES,
  CONDICION_LABEL,
  type Condicion,
  type NuevoVehiculo,
  type VehiculoFlota,
} from "@/lib/types-empresa";

const TIPOS = [
  { value: "camioneta", label: "Camioneta" },
  { value: "furgon", label: "Furgón" },
  { value: "camion", label: "Camión" },
  { value: "utilitario", label: "Utilitario" },
  { value: "pickup", label: "Pick-up" },
];

const TIPO_LABEL: Record<string, string> = {
  camioneta: "Camioneta",
  furgon: "Furgón",
  camion: "Camión",
  utilitario: "Utilitario",
  pickup: "Pick-up",
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

export default function FlotaPage() {
  const { empresaActiva } = useEmpresa();

  const [vehiculos, setVehiculos] = useState<VehiculoFlota[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [condiciones, setCondiciones] = useState<Condicion[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!empresaActiva) return;
    api
      .get<VehiculoFlota[]>(`/api/empresas/${empresaActiva.id_empresa}/vehiculos`)
      .then((data) => {
        setVehiculos(data);
        setListError("");
      })
      .catch((err) => setListError(err instanceof Error ? err.message : "Error al cargar la flota"))
      .finally(() => setLoadingList(false));
  }, [empresaActiva]);

  async function refrescarVehiculos() {
    if (!empresaActiva) return;
    try {
      const data = await api.get<VehiculoFlota[]>(
        `/api/empresas/${empresaActiva.id_empresa}/vehiculos`
      );
      setVehiculos(data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Error al cargar la flota");
    }
  }

  function set(field: keyof typeof form) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function toggleCondicion(val: Condicion) {
    setCondiciones((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  function validar(): string | null {
    const patente = form.patente.trim();
    if (patente.length < 6 || patente.length > 8) {
      return "La patente debe tener entre 6 y 8 caracteres.";
    }
    if (!form.marca.trim() || !form.modelo.trim() || !form.color.trim() || !form.tipo_vehiculo) {
      return "Completá todos los campos requeridos.";
    }
    const anio = parseInt(form.anio, 10);
    if (!Number.isInteger(anio) || anio < 1990 || anio > ANIO_MAX) {
      return `El año debe ser un número entre 1990 y ${ANIO_MAX}.`;
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!empresaActiva) return;
    const error = validar();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      const payload: NuevoVehiculo = {
        patente: form.patente.trim(),
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        anio: parseInt(form.anio, 10),
        color: form.color.trim(),
        tipo_vehiculo: form.tipo_vehiculo,
        condiciones,
      };
      await api.post<VehiculoFlota>(
        `/api/empresas/${empresaActiva.id_empresa}/vehiculos`,
        payload
      );
      setForm(EMPTY_FORM);
      setCondiciones([]);
      setShowForm(false);
      await refrescarVehiculos();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al registrar el vehículo");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!empresaActiva) return;
    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }
    setDeleteError("");
    setDeletingId(id);
    try {
      await api.delete(`/api/empresas/${empresaActiva.id_empresa}/vehiculos/${id}`);
      await refrescarVehiculos();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error al dar de baja el vehículo");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  if (!empresaActiva) {
    return (
      <div className="page-medium">
        <div className="section-header">
          <h2>Flota</h2>
          <p>No tenés ninguna empresa todavía.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-medium">
      <div className="section-header">
        <div>
          <h2>Flota</h2>
          <p>
            {loadingList
              ? "Cargando vehículos..."
              : `${vehiculos.length} vehículo${vehiculos.length === 1 ? "" : "s"} registrado${
                  vehiculos.length === 1 ? "" : "s"
                }`}
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => {
            setShowForm((v) => !v);
            setFormError("");
          }}
        >
          {showForm ? "Cancelar" : "+ Agregar vehículo"}
        </button>
      </div>

      {showForm && (
        <div className="card card--form bloque">
          <h2 className="card-title">Nuevo vehículo</h2>
          <form onSubmit={handleSubmit} className="stack stack--lg">
            <div className="form-grid">
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
                  className="patente"
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

            <div className="form-grid">
              <div className="field">
                <label htmlFor="nv-marca">Marca</label>
                <input
                  id="nv-marca"
                  type="text"
                  placeholder="Ford"
                  value={form.marca}
                  onChange={set("marca")}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="nv-modelo">Modelo</label>
                <input
                  id="nv-modelo"
                  type="text"
                  placeholder="Transit"
                  value={form.modelo}
                  onChange={set("modelo")}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="nv-color">Color</label>
                <input
                  id="nv-color"
                  type="text"
                  placeholder="Blanco"
                  value={form.color}
                  onChange={set("color")}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="nv-tipo">Tipo de vehículo</label>
                <select id="nv-tipo" value={form.tipo_vehiculo} onChange={set("tipo_vehiculo")} required>
                  <option value="">Seleccioná...</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>
                Condiciones <span className="opt">(opcional)</span>
              </label>
              <div className="cluster">
                {CONDICIONES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip${condiciones.includes(c) ? " is-active" : ""}`}
                    onClick={() => toggleCondicion(c)}
                  >
                    {CONDICION_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>

            {formError && <p className="auth-error">{formError}</p>}

            <div className="form-actions form-actions--end">
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

      {deleteError && <p className="auth-error">{deleteError}</p>}
      {listError && <p className="auth-error">{listError}</p>}

      {loadingList && (
        <div className="stack stack--lg">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card skeleton" style={{ height: 84 }} />
          ))}
        </div>
      )}

      {!loadingList && !listError && vehiculos.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__title">Todavía no hay vehículos en la flota</p>
          <p className="empty-state__text">Agregá uno para poder asignarlo a los viajes.</p>
        </div>
      )}

      {!loadingList && !listError && vehiculos.length > 0 && (
        <div className="stack stack--lg">
          {vehiculos.map((v) => (
            <div key={v.id_vehiculo} className="card card-head">
              <div className="stack stack--xs">
                <div className="cluster">
                  <span className="veh-card__patente">{v.patente.toUpperCase()}</span>
                  <span className="texto-meta">
                    {TIPO_LABEL[v.tipo_vehiculo] ?? v.tipo_vehiculo}
                  </span>
                </div>
                <p className="veh-card__meta">
                  {v.marca} {v.modelo} — {v.anio} — {v.color}
                </p>
                {v.condiciones.length > 0 && (
                  <div className="cred-list">
                    {v.condiciones.map((c, idx) => (
                      <span key={c.id_condicion ?? idx} className="cond">
                        {CONDICION_LABEL[c.condicion] ?? c.condicion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="btn btn--ghost btn--danger"
                disabled={deletingId === v.id_vehiculo}
                onClick={() => handleDelete(v.id_vehiculo)}
              >
                {deletingId === v.id_vehiculo
                  ? "Dando de baja..."
                  : confirmingId === v.id_vehiculo
                    ? "¿Confirmar?"
                    : "Dar de baja"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
