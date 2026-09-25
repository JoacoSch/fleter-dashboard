"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, esStatus } from "@/lib/api";
import { formatARS, fmtDateTime } from "@/lib/utils";
import { ESTADO_LABEL, ESTADOS_EN_CURSO, esFinalizado } from "@/lib/estados";
import type { CostoAcumulado } from "@/hooks/useViajeActivo";
import { useEmpresa } from "@/hooks/useEmpresa";
import {
  CONDICION_LABEL,
  vehiculoCumple,
  type ConductorEmpresa,
  type VehiculoFlota,
  type ViajeDetalleGerente,
  type ViajeEmpresa,
} from "@/lib/types-empresa";

/**
 * El detalle se arma con dos endpoints porque ninguno alcanza solo:
 * - `GET /api/empresas/:id/viajes` es el único con `id_vehiculo` (default del
 *   selector) y `fecha_reserva` (countdown de la reserva).
 * - `GET /api/viajes/:id` es el único con `ruta_planeada`.
 *
 * El segundo es best-effort: devuelve 403 si el viaje todavía no fue reservado
 * (`id_empresa` se setea recién al reservar) y no debe tumbar la pantalla.
 */
function cargarDatos(idEmpresa: number, id: number) {
  return Promise.all([
    api.get<ViajeEmpresa[]>(`/api/empresas/${idEmpresa}/viajes`),
    api.get<ConductorEmpresa[]>(`/api/empresas/${idEmpresa}/conductores`),
    api.get<VehiculoFlota[]>(`/api/empresas/${idEmpresa}/vehiculos`),
    api.get<ViajeDetalleGerente>(`/api/viajes/${id}`).catch(() => null),
  ]);
}

export default function GerenteViajeDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { empresaActiva, loading: empresaLoading } = useEmpresa();
  const idEmpresa = empresaActiva?.id_empresa;

  const [viaje, setViaje] = useState<ViajeEmpresa | null>(null);
  const [conductores, setConductores] = useState<ConductorEmpresa[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoFlota[]>([]);
  // Todavía no se dibuja: queda disponible para el mapa del viaje.
  const [rutaPlaneada, setRutaPlaneada] = useState<[number, number][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idConductor, setIdConductor] = useState<number | "">("");
  const [idVehiculo, setIdVehiculo] = useState<number | "">("");
  const [accion, setAccion] = useState<string | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);
  const [confirmSoltar, setConfirmSoltar] = useState(false);
  const [costo, setCosto] = useState<CostoAcumulado | null>(null);
  const [remitoLoading, setRemitoLoading] = useState(false);
  const [remitoError, setRemitoError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!idEmpresa) return;
    setLoading(true);
    try {
      const [viajes, cond, veh, detalle] = await cargarDatos(idEmpresa, id);
      const encontrado = viajes.find((v) => v.id_viaje === id) ?? null;
      setViaje(encontrado);
      setConductores(cond);
      setVehiculos(veh);
      setRutaPlaneada(detalle?.ruta_planeada ?? null);
      setError(encontrado ? null : "Este viaje no pertenece a tu empresa.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [idEmpresa, id]);

  // Carga inicial inline: llamar a `cargar()` haría setState de forma síncrona
  // dentro del efecto, que es lo que prohíbe react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!idEmpresa) return;
    let cancelled = false;
    cargarDatos(idEmpresa, id)
      .then(([viajesEmpresa, cond, veh, detalle]) => {
        if (cancelled) return;
        const encontrado = viajesEmpresa.find((v) => v.id_viaje === id) ?? null;
        setViaje(encontrado);
        setConductores(cond);
        setVehiculos(veh);
        setRutaPlaneada(detalle?.ruta_planeada ?? null);
        setError(encontrado ? null : "Este viaje no pertenece a tu empresa.");
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [idEmpresa, id]);

  /**
   * Costo en vivo mientras el viaje está en curso. El gerente de la empresa
   * dueña ahora pasa el control de acceso de `costo-acumulado` (misma regla que
   * el detalle). Best-effort: si falla, la card simplemente no aparece.
   */
  const estado = viaje?.estado;
  useEffect(() => {
    if (!estado || !ESTADOS_EN_CURSO.includes(estado)) return;
    let cancelled = false;
    api
      .get<CostoAcumulado>(`/api/viajes/${id}/costo-acumulado`)
      .then((c) => {
        if (!cancelled) setCosto(c);
      })
      .catch(() => {
        if (!cancelled) setCosto(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, estado]);

  /**
   * El endpoint no devuelve el PDF sino JSON `{ remito_url }` con una URL
   * pública de R2: hay que pedirlo con `api` (que agrega BASE_URL y el
   * Authorization) y recién después abrir esa URL.
   */
  async function abrirRemito() {
    setRemitoLoading(true);
    setRemitoError(null);
    try {
      const { remito_url } = await api.get<{ remito_url: string }>(
        `/api/viajes/${id}/remito`,
      );
      window.open(remito_url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setRemitoError(e instanceof Error ? e.message : "No se pudo obtener el remito");
    } finally {
      setRemitoLoading(false);
    }
  }

  async function ejecutar(nombre: string, fn: () => Promise<unknown>) {
    setAccion(nombre);
    setAccionError(null);
    try {
      await fn();
      await cargar();
    } catch (err) {
      // `reservar`, `asignar` y `reasignar` son atómicos: ante dos gerentes o un
      // doble-submit, exactamente uno recibe 200 y el otro 409. Un 409 no se
      // reintenta — significa que alguien más ya resolvió el viaje, así que se
      // refresca el estado en vez de mostrar el mensaje crudo del backend.
      if (esStatus(err, 409)) {
        setAccionError("Otro usuario ya resolvió este viaje. Se actualizó el estado.");
        await cargar();
      } else {
        setAccionError((err as Error).message);
      }
    } finally {
      setAccion(null);
    }
  }

  const asignar = (idc: number, idv: number) =>
    ejecutar("asignar", () =>
      api.post(`/api/viajes/${id}/asignar`, { id_conductor: idc, id_vehiculo: idv }),
    );

  const reasignar = (idc: number, idv: number) =>
    ejecutar("reasignar", () =>
      api.post(`/api/viajes/${id}/reasignar`, { id_conductor: idc, id_vehiculo: idv }),
    );

  const soltarReserva = () =>
    ejecutar("soltar", async () => {
      await api.post(`/api/viajes/${id}/cancelar-reserva`, {});
      router.push("/gerente");
    });

  const iniciar = () => ejecutar("iniciar", () => api.post(`/api/viajes/${id}/iniciar`, {}));

  if (loading || empresaLoading) {
    return (
      <div>
        <button className="btn btn--ghost back-link" onClick={() => router.back()} type="button">
          ← Volver
        </button>
        <div className="stack">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: 100 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !viaje) {
    return (
      <div>
        <button className="btn btn--ghost back-link" onClick={() => router.back()} type="button">
          ← Volver
        </button>
        <div className="error-banner">{error ?? "Viaje no encontrado."}</div>
      </div>
    );
  }

  const conductoresActivos = conductores.filter((c) => c.estado === "ACTIVO");
  // Misma regla de elegibilidad que aplica el backend al asignar: el vehículo
  // tiene que cubrir todas las condiciones requeridas del viaje.
  const vehiculosElegibles = vehiculos.filter((v) => vehiculoCumple(v, viaje.condiciones_req));

  const esReservado = viaje.estado === "RESERVADO_POR_EMPRESA";
  const puedeReasignar = viaje.estado === "CONDUCTOR_ASIGNADO" && !viaje.fecha_inicio;
  const mostrarFormulario = esReservado || puedeReasignar;

  // El select arranca en la asignación vigente del viaje (caso reasignación) y
  // pasa a lo elegido por el usuario apenas toca el control. Derivarlo en el
  // render evita un efecto que haga setState al cargar el viaje.
  const conductorSel = idConductor !== "" ? idConductor : viaje.id_conductor ?? "";
  const vehiculoSel = idVehiculo !== "" ? idVehiculo : viaje.id_vehiculo ?? "";
  const formularioValido = conductorSel !== "" && vehiculoSel !== "";

  return (
    <div>
      <button className="btn btn--ghost back-link" onClick={() => router.back()} type="button">
        ← Volver
      </button>

      <div className="section-header">
        <div className="cluster">
          <h2 className="titulo-mono">VJ-{viaje.id_viaje}</h2>
          <span className={`status ${viaje.estado}`}>{ESTADO_LABEL[viaje.estado]}</span>
          <span className={`zone-tag ${viaje.zona}`}>{viaje.zona}</span>
        </div>
        <p>{fmtDateTime(viaje.fecha_programada)}</p>
      </div>

      {accionError && (
        <div className="error-banner">{accionError}</div>
      )}

      <div className="stack stack--lg">
        {/* Datos del viaje */}
        <div className="card">
          <div className="card-head">
            <div>
              <p className="metric__label">Precio {viaje.precio_real ? "final" : "estimado"}</p>
              <p className="stat__value">{formatARS(viaje.precio_real ?? viaje.precio_estimado)}</p>
            </div>
            {viaje.cliente && (
              <div className="kv">
                <span>Cliente</span>
                <strong className="kv__texto">
                  {viaje.cliente.usuario.nombre} {viaje.cliente.usuario.apellido}
                </strong>
                {viaje.cliente.usuario.telefono && (
                  <span>{viaje.cliente.usuario.telefono}</span>
                )}
              </div>
            )}
          </div>

          {viaje.condiciones_req.length > 0 && (
            <div className="cred-list">
              {viaje.condiciones_req.map((c) => (
                <span key={c.condicion} className="cond">
                  {CONDICION_LABEL[c.condicion] ?? c.condicion}
                </span>
              ))}
            </div>
          )}

          {viaje.descripcion && (
            <p className="note">{viaje.descripcion}</p>
          )}

          {/* Paradas */}
          <div className="vd__price-block">
            <div className="route-stops">
              {viaje.paradas.map((p, i) => {
                const ultima = i === viaje.paradas.length - 1;
                return (
                  <div
                    key={p.id_parada ?? p.orden}
                    className={`route-stop${ultima ? " route-stop--dest" : ""}`}
                  >
                    <div className="route-stop__calle">{p.direccion}</div>
                    {p.fecha_entrega && (
                      <div className="route-stop__loc">Entregado {fmtDateTime(p.fecha_entrega)}</div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* El mapa va acá cuando se construya; por ahora sólo se informa que
                el backend tiene la ruta calculada para este viaje. */}
            {rutaPlaneada && rutaPlaneada.length > 0 && (
              <p className="stat__hint">Ruta planificada disponible ({rutaPlaneada.length} puntos)</p>
            )}
          </div>
        </div>

        {/* Costo en vivo — sólo mientras el viaje está en curso */}
        {costo && (
          <div className="card stack stack--tight">
            <p className="metric__label">Costo acumulado</p>
            <p className="stat__value">{formatARS(costo.precio_acumulado)}</p>
            {costo.desglose && (
              <p className="stat__hint">
                {costo.desglose.distancia_km} km · {costo.desglose.tiempo_horas} h
              </p>
            )}
          </div>
        )}

        {/* Remito — sólo en viajes finalizados */}
        {esFinalizado(viaje.estado) && (
          <div className="card stack stack--tight">
            <p className="metric__label">Remito</p>
            <button
              className="btn btn--ghost"
              onClick={abrirRemito}
              disabled={remitoLoading}
              type="button"
            >
              {remitoLoading ? "Abriendo..." : "Ver remito (PDF)"}
            </button>
            {remitoError && <p className="error-text">{remitoError}</p>}
          </div>
        )}

        {/* Asignación actual */}
        {viaje.conductor && (
          <div className="card stack stack--tight">
            <p className="metric__label">Asignado a</p>
            <p className="driver-info">
              <strong>{viaje.conductor.usuario.nombre} {viaje.conductor.usuario.apellido}</strong>
              {viaje.conductor.calificacion_promedio != null && (
                <span className="rating">★ {viaje.conductor.calificacion_promedio.toFixed(1)}</span>
              )}
            </p>
            {viaje.vehiculo && (
              <p className="veh-card__meta">
                {viaje.vehiculo.marca} {viaje.vehiculo.modelo} —{" "}
                <span className="patente">{viaje.vehiculo.patente}</span>
              </p>
            )}
          </div>
        )}

        {/* Formulario de asignación / reasignación */}
        {mostrarFormulario && (
          <div className="card">
            <div className="section-header">
              <h2 className="card-title">
                {puedeReasignar ? "Reasignar viaje" : "Asignar conductor y vehículo"}
              </h2>
              {viaje.condiciones_req.length > 0 && (
                <p>
                  Sólo se listan los vehículos de la flota que cumplen las condiciones
                  requeridas del viaje.
                </p>
              )}
            </div>

            {conductoresActivos.length === 0 && (
              <p className="note note--warn">
                No tenés conductores activos. Aprobá solicitudes en <strong>Conductores</strong>.
              </p>
            )}
            {vehiculosElegibles.length === 0 && (
              <p className="note note--warn">
                Ningún vehículo de tu flota cumple las condiciones de este viaje.
              </p>
            )}

            <div className="stack">
              <div className="field">
                <label className="metric__label" htmlFor="conductor">Conductor</label>
                <select
                  id="conductor"
                  className="input"
                  value={conductorSel}
                  onChange={(e) => setIdConductor(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Elegir conductor…</option>
                  {conductoresActivos.map((c) => (
                    <option key={c.id_conductor} value={c.id_conductor}>
                      {c.usuario.nombre} {c.usuario.apellido}
                      {c.calificacion_promedio != null ? ` — ★ ${c.calificacion_promedio.toFixed(1)}` : " — sin calificar"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="metric__label" htmlFor="vehiculo">Vehículo</label>
                <select
                  id="vehiculo"
                  className="input"
                  value={vehiculoSel}
                  onChange={(e) => setIdVehiculo(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Elegir vehículo…</option>
                  {vehiculosElegibles.map((v) => (
                    <option key={v.id_vehiculo} value={v.id_vehiculo}>
                      {v.patente} — {v.marca} {v.modelo} ({v.tipo_vehiculo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="cluster">
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={!formularioValido || accion !== null}
                  onClick={() =>
                    (puedeReasignar ? reasignar : asignar)(Number(conductorSel), Number(vehiculoSel))
                  }
                >
                  {accion === "asignar" || accion === "reasignar"
                    ? "Guardando..."
                    : puedeReasignar
                    ? "Reasignar"
                    : "Asignar viaje"}
                </button>

                {puedeReasignar && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={accion !== null}
                    onClick={iniciar}
                  >
                    {accion === "iniciar" ? "Iniciando..." : "Iniciar viaje"}
                  </button>
                )}

                {esReservado && (
                  confirmSoltar ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--ghost btn--danger"
                        disabled={accion !== null}
                        onClick={soltarReserva}
                      >
                        {accion === "soltar" ? "Soltando..." : "¿Confirmar? Vuelve al mercado"}
                      </button>
                      <button type="button" className="btn btn--ghost" onClick={() => setConfirmSoltar(false)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => setConfirmSoltar(true)}
                      disabled={accion !== null}
                    >
                      Soltar reserva
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
