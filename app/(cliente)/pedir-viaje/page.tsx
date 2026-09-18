"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AddressInput from "@/components/AddressInput";

type Condicion = "FRAGIL" | "REFRIGERADO" | "CARGA_PESADA" | "PELIGROSO" | "VOLUMINOSO";

interface Parada {
  id: number;
  direccion: string;
  lat: number | null;
  lng: number | null;
}

interface ViajeCreado {
  id_viaje: number;
  estado: string;
  precio_estimado: number;
  /** La calcula el backend con las coordenadas de las paradas, no el front. */
  zona?: "CABA" | "PROVINCIA" | "MIXTO";
}

const ZONA_LABEL: Record<string, string> = {
  CABA: "CABA",
  PROVINCIA: "Provincia",
  MIXTO: "CABA + Provincia",
};

const CONDICIONES: { value: Condicion; label: string }[] = [
  { value: "FRAGIL", label: "Frágil" },
  { value: "REFRIGERADO", label: "Refrigerado" },
  { value: "CARGA_PESADA", label: "Carga pesada" },
  { value: "PELIGROSO", label: "Peligroso" },
  { value: "VOLUMINOSO", label: "Voluminoso" },
];

/**
 * Anticipación mínima para programar un viaje, en minutos.
 *
 * La autoridad es el backend (`ANTICIPACION_MINIMA_MINUTOS`, default 60): valida
 * el mínimo y responde `400` si no se cumple. Acá se replica sólo para evitar el
 * ida y vuelta. En staging el backend la baja (incluso a 0) para poder crear un
 * viaje y debuggearlo al toque, así que esto tiene que poder acompañarlo.
 */
const ANTICIPACION_MINIMA_MINUTOS = Number(
  process.env.NEXT_PUBLIC_ANTICIPACION_MINIMA_MINUTOS ?? 60,
);

/**
 * Mínimo del `<input type="datetime-local">`, que espera **hora local**.
 *
 * No usar `toISOString()`: devuelve UTC, y en UTC-3 eso corría el mínimo tres
 * horas hacia adelante — el cliente no podía elegir un horario que el backend
 * sí aceptaba.
 */
function getMinFecha() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + ANTICIPACION_MINIMA_MINUTOS);
  const pad = (n: number) => String(n).padStart(2, "0");
  // "YYYY-MM-DDTHH:MM" en hora local
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export default function PedirViajePage() {
  const router = useRouter();
  const nextIdRef = useRef(3);

  const [fecha, setFecha] = useState("");
  const [paradas, setParadas] = useState<Parada[]>([
    { id: 1, direccion: "", lat: null, lng: null },
    { id: 2, direccion: "", lat: null, lng: null },
  ]);
  const [condiciones, setCondiciones] = useState<Set<Condicion>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ViajeCreado | null>(null);

  function agregarParada() {
    const destino = paradas[paradas.length - 1];
    const intermedias = paradas.slice(0, -1);
    setParadas([...intermedias, { id: nextIdRef.current++, direccion: "", lat: null, lng: null }, destino]);
  }

  function borrarParada(id: number) {
    setParadas((prev) => prev.filter((p) => p.id !== id));
  }

  function actualizarTexto(id: number, text: string) {
    setParadas((prev) => prev.map((p) => (p.id === id ? { ...p, direccion: text, lat: null, lng: null } : p)));
  }

  function actualizarCoords(id: number, address: string, lat: number, lng: number) {
    setParadas((prev) => prev.map((p) => (p.id === id ? { ...p, direccion: address, lat, lng } : p)));
  }

  function limpiarCoords(id: number) {
    setParadas((prev) => prev.map((p) => (p.id === id ? { ...p, lat: null, lng: null } : p)));
  }

  function toggleCondicion(c: Condicion) {
    setCondiciones((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fecha) {
      setError("Seleccioná la fecha y hora del viaje.");
      return;
    }

    if (paradas.some((p) => !p.direccion.trim())) {
      setError("Completá todas las direcciones.");
      return;
    }

    if (paradas.some((p) => p.lat === null || p.lng === null)) {
      setError("Seleccioná cada dirección desde el menú de sugerencias para confirmar la ubicación.");
      return;
    }

    setLoading(true);
    try {
      // Sin `zona`: la deriva el backend de las coordenadas de las paradas
      // (polígono oficial de CABA). El campo se sigue aceptando en el body por
      // compatibilidad, pero su valor se descarta — mandarlo sólo confundiría.
      const payload = {
        fecha_programada: new Date(fecha).toISOString(),
        paradas: paradas.map((p) => ({ lat: p.lat!, lng: p.lng!, direccion: p.direccion.trim() })),
        condiciones_requeridas: Array.from(condiciones),
      };
      const result = await api.post<ViajeCreado>("/api/viajes", payload);
      setSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el viaje.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <div className="section-header">
          <h2>Viaje solicitado</h2>
          <p>Tu pedido fue enviado. Estamos buscando un conductor.</p>
        </div>
        <div className="card page-narrow">
          <div className="stack stack--lg">
            <div>
              <p className="metric__label">N° de viaje</p>
              <p className="dato-valor dato-valor--mono">VJ-{success.id_viaje}</p>
            </div>
            <div>
              <p className="metric__label">Estado</p>
              <p className="dato-valor">
                <span className="status BUSCANDO_FLETERO">Buscando conductor</span>
              </p>
            </div>
            {success.zona && (
              <div>
                <p className="metric__label">Zona</p>
                <p className="dato-valor">{ZONA_LABEL[success.zona] ?? success.zona}</p>
              </div>
            )}
            {success.precio_estimado > 0 && (
              <div>
                <p className="metric__label">Precio estimado</p>
                <p className="stat__value">${success.precio_estimado.toLocaleString("es-AR")}</p>
              </div>
            )}
            <div className="cluster">
              <button
                className="btn btn--primary"
                onClick={() => router.push("/viajes")}
              >
                Ver mis viajes
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setSuccess(null)}
              >
                Pedir otro viaje
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const coordsCompletas = paradas.every((p) => p.lat !== null && p.lng !== null);

  return (
    <div>
      <div className="section-header">
        <h2>Pedir un viaje</h2>
        <p>Completá los datos del flete y te conectamos con un conductor.</p>
      </div>

      <form onSubmit={handleSubmit} className="page-narrow">
        <div className="card stack stack--lg">

          {/* Fecha programada */}
          <div>
            <label className="metric__label" htmlFor="fecha">Fecha y hora</label>
            <input
              id="fecha"
              type="datetime-local"
              min={getMinFecha()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="input"
            />
          </div>

          {/* Paradas estilo Uber */}
          <div>
            <label className="metric__label">Recorrido</label>
            <div className="recorrido">
              <div className="stack stack--tight">
                {paradas.map((parada, idx) => {
                  const isOrigen = idx === 0;
                  const isDestino = idx === paradas.length - 1;
                  const isIntermedia = !isOrigen && !isDestino;

                  const tipoDot = isOrigen ? " recorrido__dot--origen" : isDestino ? " recorrido__dot--destino" : "";

                  return (
                    <div key={parada.id} className="recorrido__fila">
                      <div className={`recorrido__dot${tipoDot}`} />

                      {/* AddressInput con autocomplete */}
                      <AddressInput
                        placeholder={isOrigen ? "Origen" : isDestino ? "Destino" : `Parada ${idx}`}
                        value={parada.direccion}
                        onChange={(text) => actualizarTexto(parada.id, text)}
                        onSelect={({ address, lat, lng }) => actualizarCoords(parada.id, address, lat, lng)}
                        onClear={() => limpiarCoords(parada.id)}
                      />

                      {/* Botón borrar (solo intermedias) */}
                      {isIntermedia && (
                        <button
                          type="button"
                          onClick={() => borrarParada(parada.id)}
                          className="recorrido__borrar"
                          title="Eliminar parada"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={agregarParada}
              className="btn btn--ghost"
            >
              + Agregar parada intermedia
            </button>
          </div>

          {/* Condiciones requeridas */}
          <div>
            <label className="metric__label">
              Condiciones especiales <span className="opt">(opcional)</span>
            </label>
            <div className="cluster">
              {CONDICIONES.map(({ value, label }) => {
                const active = condiciones.has(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleCondicion(value)}
                    className={`chip${active ? " is-active" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="auth-error">{error}</p>
          )}

          {/* Submit */}
          <div className="vd__price-block">
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={loading || !coordsCompletas}
            >
              {loading ? "Enviando..." : "Confirmar viaje"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
