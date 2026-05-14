"use client";

import { usePeriodo, type PeriodoMode } from "@/hooks/usePeriodo";

interface Props {
  className?: string;
}

const MODOS: { key: PeriodoMode; label: string }[] = [
  { key: "mensual", label: "Mensual" },
  { key: "semanal", label: "Semanal" },
  { key: "todo", label: "Todo" },
  { key: "personalizado", label: "Personalizado" },
];

function toInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function SelectorPeriodo({ className }: Props) {
  const { periodo, setMensual, setSemanal, setTodo, setPersonalizado } = usePeriodo();

  function handleModo(key: PeriodoMode) {
    if (key === "mensual") setMensual();
    else if (key === "semanal") setSemanal();
    else if (key === "todo") setTodo();
    else setPersonalizado(periodo.desde, periodo.hasta);
  }

  function handleDesde(e: React.ChangeEvent<HTMLInputElement>) {
    const d = new Date(e.target.value + "T00:00:00");
    setPersonalizado(d, periodo.hasta);
  }

  function handleHasta(e: React.ChangeEvent<HTMLInputElement>) {
    const h = new Date(e.target.value + "T23:59:59");
    setPersonalizado(periodo.desde, h);
  }

  return (
    <div className={`selector-periodo${className ? " " + className : ""}`}>
      {MODOS.map(({ key, label }) => (
        <button
          key={key}
          className={`btn${periodo.mode === key ? " btn--primary" : ""}`}
          onClick={() => handleModo(key)}
          type="button"
        >
          {label}
        </button>
      ))}

      {periodo.mode === "personalizado" && (
        <div className="selector-periodo__dates">
          <input
            type="date"
            value={toInputValue(periodo.desde)}
            max={toInputValue(periodo.hasta)}
            onChange={handleDesde}
          />
          <span className="selector-periodo__sep">→</span>
          <input
            type="date"
            value={toInputValue(periodo.hasta)}
            min={toInputValue(periodo.desde)}
            max={toInputValue(new Date())}
            onChange={handleHasta}
          />
        </div>
      )}
    </div>
  );
}
