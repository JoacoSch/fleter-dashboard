"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Contenedor común de los cuatro paneles (cliente, conductor, gerente, admin).
 *
 * Sirve para una sola cosa: el ancho de la sidebar. Vive en la variable CSS
 * `--sidebar-w` sobre el propio `.app`, y todo el layout se deriva de ahí, así
 * que el contenido acompaña solo. La manija del borde lo cambia arrastrando.
 *
 * El ancho **no** es estado de React: se escribe directo en la variable CSS y se
 * recuerda en un ref. Arrastrar dispara decenas de eventos por segundo y volver
 * a renderizar el panel entero en cada uno se nota; además, `set-state-in-effect`
 * prohíbe el `setState` que haría falta para leer el valor guardado al montar.
 *
 * Por debajo de `--bp-riel` (900 px) la sidebar pasa a riel de íconos y el ancho
 * manual se ignora: lo fija el CSS, no este componente.
 */
const CLAVE = "fleter_sidebar_w";
const MIN = 200;
const MAX = 400;
export const SIDEBAR_DEFAULT = 248;
/** Igual que `--bp-riel` en tokens/spacing.css. Debajo de esto manda el riel. */
const BP_RIEL = 900;

function acotar(v: number): number {
  return Math.round(Math.min(MAX, Math.max(MIN, v)));
}

export default function AppShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const anchoRef = useRef(SIDEBAR_DEFAULT);
  /**
   * Si "estoy arrastrando" fuera sólo estado de React, los `pointermove` que
   * llegan antes del re-render se descartarían: el manejador leería el valor
   * viejo. Por eso la decisión sale del ref y el estado queda sólo para la
   * clase visual.
   */
  const arrastrandoRef = useRef(false);
  const [arrastrando, setArrastrando] = useState(false);

  const aplicar = useCallback((v: number, guardar: boolean) => {
    anchoRef.current = v;
    ref.current?.style.setProperty("--sidebar-w", `${v}px`);
    ref.current
      ?.querySelector(".sidebar-handle")
      ?.setAttribute("aria-valuenow", String(v));
    if (!guardar) return;
    try {
      localStorage.setItem(CLAVE, String(v));
    } catch {
      // Sin permiso de storage el ancho vale para esta sesión y nada más.
    }
  }, []);

  // Sólo escribe en el DOM: no hay setState, así que no dispara un render extra
  // ni rompe la hidratación (en el servidor no existe localStorage).
  useEffect(() => {
    let guardado: number | null = null;
    try {
      const v = Number(localStorage.getItem(CLAVE));
      if (Number.isFinite(v) && v >= MIN && v <= MAX) guardado = v;
    } catch {
      guardado = null;
    }
    if (guardado !== null) aplicar(guardado, false);
  }, [aplicar]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Debajo del breakpoint manda el riel: arrastrar no tiene sentido.
    if (window.innerWidth < BP_RIEL) return;
    e.preventDefault();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Sin captura el arrastre sigue funcionando mientras el puntero no se
      // vaya del elemento. No es motivo para no empezar a arrastrar.
    }
    arrastrandoRef.current = true;
    setArrastrando(true);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!arrastrandoRef.current || !ref.current) return;
      aplicar(acotar(e.clientX - ref.current.getBoundingClientRect().left), false);
    },
    [aplicar],
  );

  const soltar = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Si nunca hubo captura no hay nada que soltar.
      }
      // Se guarda también en pointercancel: si el puntero se pierde fuera de la
      // ventana, el ancho ya aplicado no debe quedar sin registrar.
      if (arrastrandoRef.current) aplicar(anchoRef.current, true);
      arrastrandoRef.current = false;
      setArrastrando(false);
    },
    [aplicar],
  );

  // El teclado mueve el borde de a 16 px; Home vuelve al ancho de fábrica.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        aplicar(acotar(anchoRef.current + (e.key === "ArrowLeft" ? -16 : 16)), true);
      } else if (e.key === "Home") {
        e.preventDefault();
        aplicar(SIDEBAR_DEFAULT, true);
      }
    },
    [aplicar],
  );

  return (
    <div ref={ref} className={`app${arrastrando ? " app--arrastrando" : ""}`}>
      {children}
      <div
        className="sidebar-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label="Ancho de la barra lateral"
        aria-valuenow={SIDEBAR_DEFAULT}
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onDoubleClick={() => aplicar(SIDEBAR_DEFAULT, true)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
