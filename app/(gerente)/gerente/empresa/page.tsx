"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useEmpresa } from "@/hooks/useEmpresa";
import type { EmpresaDetalle } from "@/lib/types-empresa";

function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export default function EmpresaPage() {
  const { empresaActiva, loading: loadingEmpresas, error: errorEmpresas, refetch } = useEmpresa();

  const [detalle, setDetalle] = useState<EmpresaDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(true);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  const [copiado, setCopiado] = useState(false);
  const [confirmandoRegenerar, setConfirmandoRegenerar] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [errorRegenerar, setErrorRegenerar] = useState<string | null>(null);

  const [formAbierto, setFormAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [cuit, setCuit] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);

  useEffect(() => {
    if (loadingEmpresas) return;

    if (!empresaActiva) {
      return;
    }

    let cancelado = false;
    api
      .get<EmpresaDetalle>(`/api/empresas/${empresaActiva.id_empresa}`)
      .then((data) => {
        if (!cancelado) {
          setDetalle(data);
          setErrorDetalle(null);
        }
      })
      .catch((e) => {
        if (!cancelado) {
          setErrorDetalle(e instanceof Error ? e.message : "Error al cargar la empresa");
          setDetalle(null);
        }
      })
      .finally(() => {
        if (!cancelado) setLoadingDetalle(false);
      });

    return () => {
      cancelado = true;
    };
  }, [loadingEmpresas, empresaActiva]);

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si el navegador bloquea el clipboard no rompemos la UI.
    }
  }

  async function regenerarCodigo() {
    if (!empresaActiva) return;
    setRegenerando(true);
    setErrorRegenerar(null);
    try {
      const res = await api.post<{ id_empresa: number; codigo_afiliacion: string }>(
        `/api/empresas/${empresaActiva.id_empresa}/regenerar-codigo`,
        {}
      );
      setDetalle((prev) => (prev ? { ...prev, codigo_afiliacion: res.codigo_afiliacion } : prev));
      setConfirmandoRegenerar(false);
    } catch (e) {
      setErrorRegenerar(e instanceof Error ? e.message : "Error al regenerar el código");
    } finally {
      setRegenerando(false);
    }
  }

  async function crearEmpresa(e: FormEvent) {
    e.preventDefault();
    setErrorCrear(null);

    if (nombre.trim().length === 0) {
      setErrorCrear("El nombre es obligatorio.");
      return;
    }
    if (cuit.length !== 11) {
      setErrorCrear("El CUIT debe tener 11 dígitos.");
      return;
    }

    setCreando(true);
    try {
      await api.post("/api/empresas", { nombre: nombre.trim(), cuit });
      setNombre("");
      setCuit("");
      setFormAbierto(false);
      await refetch();
    } catch (e) {
      setErrorCrear(e instanceof Error ? e.message : "Error al crear la empresa");
    } finally {
      setCreando(false);
    }
  }

  const loading = loadingEmpresas || (empresaActiva !== null && loadingDetalle && !detalle);

  return (
    <div>
      <div className="section-header section-header--top">
        <div>
          <h2>Mi empresa</h2>
          <p>Datos de tu empresa y código de afiliación para conductores.</p>
        </div>
      </div>

      {errorEmpresas && <div className="error-banner">{errorEmpresas}</div>}
      {errorDetalle && <div className="error-banner">{errorDetalle}</div>}

      {loading && (
        <div className="stack stack--lg">
          <div className="card stack">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 36 }} />
            ))}
          </div>
          <div className="card skeleton" style={{ height: 96 }} />
        </div>
      )}

      {!loading && !empresaActiva && (
        <div className="stack stack--lg">
          <div className="card">
            <p className="metric__label card-section-label">Sin empresa</p>
            <p className="empty-state__text">
              Todavía no tenés ninguna empresa registrada. Creá una para empezar a recibir viajes
              y afiliar conductores a tu flota.
            </p>
          </div>
          <FormularioCrearEmpresa
            nombre={nombre}
            cuit={cuit}
            creando={creando}
            error={errorCrear}
            onNombreChange={setNombre}
            onCuitChange={(v) => setCuit(soloDigitos(v).slice(0, 11))}
            onSubmit={crearEmpresa}
          />
        </div>
      )}

      {!loading && empresaActiva && (
        <div className="stack stack--lg">
          {/* Datos de la empresa */}
          <div className="card">
            <p className="metric__label card-section-label">Datos de la empresa</p>
            <div className="datos-grid">
              <div>
                <p className="metric__label">Nombre</p>
                <p className="dato-valor">{empresaActiva.nombre}</p>
              </div>
              <div>
                <p className="metric__label">CUIT</p>
                <p className="dato-valor dato-valor--mono">{empresaActiva.cuit}</p>
              </div>
              <div>
                <p className="metric__label">Estado</p>
                <p className="dato-valor">
                  <span className={`status ${empresaActiva.activa ? "status--ok" : "status--err"}`}>
                    {empresaActiva.activa ? "Activa" : "Inactiva"}
                  </span>
                </p>
              </div>
              <div>
                <p className="metric__label">Calificación promedio</p>
                <p className="stat__value">
                  {detalle?.calificacion_promedio != null
                    ? `${detalle.calificacion_promedio.toFixed(1)} ★`
                    : "Sin calificaciones aún"}
                </p>
              </div>
              <div>
                <p className="metric__label">Conductores activos</p>
                <p className="stat__value">
                  {detalle?.cantidad_conductores_activos ?? "—"}
                </p>
              </div>
              {empresaActiva._count && (
                <>
                  <div>
                    <p className="metric__label">Vehículos</p>
                    <p className="stat__value">
                      {empresaActiva._count.vehiculos}
                    </p>
                  </div>
                  <div>
                    <p className="metric__label">Viajes</p>
                    <p className="stat__value">
                      {empresaActiva._count.viajes}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Código de afiliación */}
          <div className="card card--destacada">
            <p className="metric__label card-section-label">Código de afiliación</p>
            <p className="empty-state__text">
              Es el código que un conductor usa para afiliarse a tu empresa.
            </p>

            <div className="cluster stack--lg">
              <p className="codigo-afiliacion">{empresaActiva.codigo_afiliacion}</p>

              <div className="cluster">
                <button
                  type="button"
                  className="btn"
                  onClick={() => copiarCodigo(empresaActiva.codigo_afiliacion)}
                >
                  {copiado ? "¡Copiado!" : "Copiar"}
                </button>
                {!confirmandoRegenerar && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setErrorRegenerar(null);
                      setConfirmandoRegenerar(true);
                    }}
                  >
                    Regenerar
                  </button>
                )}
              </div>
            </div>

            {confirmandoRegenerar && (
              <div className="note note--warn stack">
                <p>
                  Al regenerar, el código actual (<strong>{empresaActiva.codigo_afiliacion}</strong>) deja de
                  funcionar de inmediato. Los conductores que todavía no se afiliaron van a necesitar el
                  código nuevo.
                </p>
                {errorRegenerar && <p className="error-text">{errorRegenerar}</p>}
                <div className="cluster">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={regenerarCodigo}
                    disabled={regenerando}
                  >
                    {regenerando ? "Regenerando..." : "Sí, regenerar código"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setConfirmandoRegenerar(false)}
                    disabled={regenerando}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Crear otra empresa (colapsable) */}
          <div className="card stack stack--lg">
            <button
              type="button"
              className="btn btn--ghost cluster"
              onClick={() => setFormAbierto((v) => !v)}
            >
              {formAbierto ? "Cerrar" : "Crear otra empresa"}
            </button>
            {formAbierto && (
              <FormularioCrearEmpresa
                nombre={nombre}
                cuit={cuit}
                creando={creando}
                error={errorCrear}
                onNombreChange={setNombre}
                onCuitChange={(v) => setCuit(soloDigitos(v).slice(0, 11))}
                onSubmit={crearEmpresa}
                sinCard
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormularioCrearEmpresa({
  nombre,
  cuit,
  creando,
  error,
  onNombreChange,
  onCuitChange,
  onSubmit,
  sinCard = false,
}: {
  nombre: string;
  cuit: string;
  creando: boolean;
  error: string | null;
  onNombreChange: (v: string) => void;
  onCuitChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  sinCard?: boolean;
}) {
  const contenido = (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="field">
        <label className="metric__label" htmlFor="empresa-nombre">Nombre</label>
        <input
          id="empresa-nombre"
          className="input"
          type="text"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          placeholder="Ej: Fletes García SRL"
        />
      </div>
      <div className="field">
        <label className="metric__label" htmlFor="empresa-cuit">CUIT (11 dígitos)</label>
        <input
          id="empresa-cuit"
          className="input input--mono"
          type="text"
          inputMode="numeric"
          value={cuit}
          onChange={(e) => onCuitChange(e.target.value)}
          placeholder="20123456789"
        />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <div>
        <button type="submit" className="btn btn--primary" disabled={creando}>
          {creando ? "Creando..." : "Crear empresa"}
        </button>
      </div>
    </form>
  );

  if (sinCard) return contenido;

  return (
    <div className="card">
      <p className="metric__label card-section-label">Crear empresa</p>
      {contenido}
    </div>
  );
}
