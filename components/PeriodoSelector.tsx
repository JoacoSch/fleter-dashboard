"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePeriodo, type PeriodoMode } from "@/hooks/usePeriodo";
import { RangoPicker, aISO, deISO, hoyISO } from "@/components/SelectorFecha";

function corto(d: Date, conAnio = false): string {
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", ...(conAnio ? { year: "numeric" } : {}) });
}

export function etiquetaPeriodo(mode: PeriodoMode, desde: Date, hasta: Date): string {
  if (mode === "mensual") {
    // Sólo la inicial: `text-transform: capitalize` dejaba "Septiembre De 2026".
    const s = desde.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  if (mode === "todo") return "Todo el historial";
  return `${corto(desde)} – ${corto(hasta, true)}`;
}

/**
 * Selector de período único para Analytics y Record. Es el patrón
 * `SelectorPeriodo` del sistema de diseño v2.
 *
 * Semana y mes se navegan con flechas. El rango usa `RangoPicker`, sin atajos:
 * los atajos del picker ("Últimos 7 días", "Este mes") serían una segunda forma
 * de hacer lo que ya hacen las pestañas, y las dos se contradirían en pantalla.
 */
export default function PeriodoSelector({ conTodo = false }: { conTodo?: boolean }) {
  const { periodo, setMensual, setSemanal, setTodo, setPersonalizado, shift, puedeAvanzar } = usePeriodo();

  const modos: { key: PeriodoMode; label: string }[] = [
    { key: "semanal", label: "Semana" },
    { key: "mensual", label: "Mes" },
    { key: "personalizado", label: "Rango" },
    ...(conTodo ? [{ key: "todo" as PeriodoMode, label: "Todo" }] : []),
  ];

  function elegirModo(key: PeriodoMode) {
    if (key === "mensual") setMensual();
    else if (key === "semanal") setSemanal();
    else if (key === "todo") setTodo();
    else setPersonalizado(periodo.desde, periodo.hasta);
  }

  return (
    <div className="periodo">
      <div className="period-tabs" role="tablist" aria-label="Tipo de período">
        {modos.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={periodo.mode === key}
            className={`period-tab${periodo.mode === key ? " is-active" : ""}`}
            onClick={() => elegirModo(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {periodo.mode === "personalizado" ? (
        <RangoPicker
          desde={aISO(periodo.desde)}
          hasta={aISO(periodo.hasta)}
          max={hoyISO()}
          atajos={[]}
          alinear="right"
          onChange={({ desde, hasta }) => {
            // El período es un intervalo cerrado: el día "hasta" entra entero.
            const fin = deISO(hasta);
            fin.setHours(23, 59, 59, 999);
            setPersonalizado(deISO(desde), fin);
          }}
        />
      ) : (
        periodo.mode !== "todo" && (
          <div className="periodo__nav">
            <button type="button" className="periodo__arrow" onClick={() => shift(-1)} aria-label="Período anterior">
              <ChevronLeft size={16} />
            </button>
            <span className="periodo__label">{etiquetaPeriodo(periodo.mode, periodo.desde, periodo.hasta)}</span>
            <button
              type="button"
              className="periodo__arrow"
              onClick={() => shift(1)}
              disabled={!puedeAvanzar}
              aria-label="Período siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )
      )}
    </div>
  );
}
