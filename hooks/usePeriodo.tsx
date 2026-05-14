"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

export type PeriodoMode = "mensual" | "semanal" | "todo" | "personalizado";

interface Periodo {
  mode: PeriodoMode;
  desde: Date;
  hasta: Date;
}

interface PeriodoContextValue {
  periodo: Periodo;
  setMensual: () => void;
  setSemanal: () => void;
  setTodo: () => void;
  setPersonalizado: (desde: Date, hasta: Date) => void;
  queryParams: { desde: string; hasta: string } | Record<never, never>;
}

function inicioMesActual(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function finMesActual(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function inicioSemanaActual(): Date {
  const d = new Date();
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day; // lunes
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

function finSemanaActual(): Date {
  const inicio = inicioSemanaActual();
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  fin.setHours(23, 59, 59, 999);
  return fin;
}

const PeriodoContext = createContext<PeriodoContextValue | null>(null);

export function PeriodoProvider({ children }: { children: ReactNode }) {
  const [periodo, setPeriodo] = useState<Periodo>({
    mode: "mensual",
    desde: inicioMesActual(),
    hasta: finMesActual(),
  });

  const setMensual = () =>
    setPeriodo({ mode: "mensual", desde: inicioMesActual(), hasta: finMesActual() });

  const setSemanal = () =>
    setPeriodo({ mode: "semanal", desde: inicioSemanaActual(), hasta: finSemanaActual() });

  const setTodo = () =>
    setPeriodo({ mode: "todo", desde: new Date(0), hasta: new Date() });

  const setPersonalizado = (desde: Date, hasta: Date) =>
    setPeriodo({ mode: "personalizado", desde, hasta });

  const queryParams = useMemo<PeriodoContextValue["queryParams"]>(() => {
    if (periodo.mode === "todo") return {};
    return {
      desde: periodo.desde.toISOString(),
      hasta: periodo.hasta.toISOString(),
    };
  }, [periodo]);

  return (
    <PeriodoContext.Provider
      value={{ periodo, setMensual, setSemanal, setTodo, setPersonalizado, queryParams }}
    >
      {children}
    </PeriodoContext.Provider>
  );
}

export function usePeriodo(): PeriodoContextValue {
  const ctx = useContext(PeriodoContext);
  if (!ctx) throw new Error("usePeriodo must be used inside PeriodoProvider");
  return ctx;
}
