"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useEmpresa } from "@/hooks/useEmpresa";
import type { ConductorEmpresa } from "@/lib/types-empresa";

export default function ConductoresPage() {
  const { empresaActiva, loading: empresaLoading } = useEmpresa();

  const [conductores, setConductores] = useState<ConductorEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [aprobandoId, setAprobandoId] = useState<number | null>(null);
  const [aprobarError, setAprobarError] = useState<string | null>(null);

  const [desafiliarId, setDesafiliarId] = useState<number | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [desafiliarError, setDesafiliarError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!empresaActiva) {
      setConductores([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setListError("");
    try {
      const data = await api.get<ConductorEmpresa[]>(
        `/api/empresas/${empresaActiva.id_empresa}/conductores`
      );
      setConductores(data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Error al cargar conductores");
      setConductores([]);
    } finally {
      setLoading(false);
    }
  }, [empresaActiva]);

  useEffect(() => {
    if (empresaLoading) return;

    if (!empresaActiva) return;

    let cancelado = false;
    api
      .get<ConductorEmpresa[]>(`/api/empresas/${empresaActiva.id_empresa}/conductores`)
      .then((data) => {
        if (!cancelado) {
          setConductores(data);
          setListError("");
        }
      })
      .catch((err) => {
        if (!cancelado) {
          setListError(err instanceof Error ? err.message : "Error al cargar conductores");
          setConductores([]);
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [empresaLoading, empresaActiva]);

  async function handleAprobar(id_conductor: number) {
    if (!empresaActiva) return;
    setAprobandoId(id_conductor);
    setAprobarError(null);
    try {
      await api.post(
        `/api/empresas/${empresaActiva.id_empresa}/conductores/${id_conductor}/aprobar`,
        {}
      );
      await cargar();
    } catch (err) {
      setAprobarError(err instanceof Error ? err.message : "Error al aprobar el conductor");
    } finally {
      setAprobandoId(null);
    }
  }

  async function handleDesafiliar(id_conductor: number) {
    if (!empresaActiva) return;
    if (confirmandoId !== id_conductor) {
      setConfirmandoId(id_conductor);
      setDesafiliarError(null);
      return;
    }
    setDesafiliarId(id_conductor);
    setDesafiliarError(null);
    try {
      await api.delete(`/api/empresas/${empresaActiva.id_empresa}/conductores/${id_conductor}`);
      setConfirmandoId(null);
      await cargar();
    } catch (err) {
      setDesafiliarError(err instanceof Error ? err.message : "Error al desafiliar el conductor");
    } finally {
      setDesafiliarId(null);
    }
  }

  if (!empresaLoading && !empresaActiva) {
    return (
      <div>
        <div className="section-header">
          <h2>Conductores</h2>
          <p>No tenés ninguna empresa todavía.</p>
        </div>
      </div>
    );
  }

  const pendientes = conductores.filter((c) => c.estado === "PENDIENTE");
  const activos = conductores.filter((c) => c.estado === "ACTIVO");

  return (
    <div>
      <div className="section-header">
        <h2>Conductores</h2>
        <p>
          {loading || empresaLoading
            ? "Cargando..."
            : conductores.length === 0
            ? "No hay conductores afiliados todavía."
            : `${activos.length} activo${activos.length !== 1 ? "s" : ""}${
                pendientes.length > 0
                  ? `, ${pendientes.length} pendiente${pendientes.length !== 1 ? "s" : ""}`
                  : ""
              }`}
        </p>
      </div>

      {listError && (
        <div className="error-banner">{listError}</div>
      )}

      {aprobarError && (
        <div className="error-banner">{aprobarError}</div>
      )}

      {desafiliarError && (
        <div className="error-banner">{desafiliarError}</div>
      )}

      {(loading || empresaLoading) && (
        <div className="stack">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: 72 }} />
          ))}
        </div>
      )}

      {!loading && !empresaLoading && !listError && conductores.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__text">No hay conductores afiliados todavía.</p>
        </div>
      )}

      {!loading && !empresaLoading && pendientes.length > 0 && (
        <div className="bloque">
          <p className="metric__label">Solicitudes pendientes</p>
          <div className="stack">
            {pendientes.map((c) => (
              <div key={c.id_conductor} className="error-banner error-banner--warn error-banner--row">
                <p><strong>{c.usuario.nombre} {c.usuario.apellido}</strong></p>
                <button
                  className="btn btn--primary"
                  disabled={aprobandoId === c.id_conductor}
                  onClick={() => handleAprobar(c.id_conductor)}
                >
                  {aprobandoId === c.id_conductor ? "Aprobando..." : "Aprobar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !empresaLoading && activos.length > 0 && (
        <div className="stack">
          {activos.map((c) => (
            <div key={c.id_conductor} className="card card-row">
              <div className="stack stack--xs">
                <p className="veh-card__title">
                  {c.usuario.nombre} {c.usuario.apellido}
                </p>
                <p className="veh-card__meta">
                  {c.calificacion_promedio === null
                    ? "—"
                    : `★ ${c.calificacion_promedio.toFixed(1)}`}
                </p>
              </div>
              <button
                className="btn btn--ghost btn--danger"
                disabled={desafiliarId === c.id_conductor}
                onClick={() => handleDesafiliar(c.id_conductor)}
              >
                {desafiliarId === c.id_conductor
                  ? "Desafiliando..."
                  : confirmandoId === c.id_conductor
                  ? "¿Confirmar?"
                  : "Desafiliar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
