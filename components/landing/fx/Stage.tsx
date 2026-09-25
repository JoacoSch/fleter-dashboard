"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface StageProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Cantidad de pasos discretos: se expone como `data-step` (0..steps-1). */
  steps?: number;
  /** Marcadores de ScrollTrigger; por defecto la sección entera (para sticky). */
  start?: string;
  end?: string;
  /** Callback sin re-render: para escenas WebGL que leen el progreso por ref. */
  onProgress?: (progress: number) => void;
  children: ReactNode;
}

/**
 * Convierte el scroll de una sección en estado para CSS:
 *  - `--p`: progreso 0..1 (las animaciones se escriben con calc()/clamp()).
 *  - `data-step`: paso activo, si se pasa `steps`.
 * No dispara renders de React: escribe directo al DOM.
 */
export default function Stage({
  id,
  className,
  style,
  steps,
  start = "top top",
  end = "bottom bottom",
  onProgress,
  children,
}: StageProps) {
  const ref = useRef<HTMLElement>(null);
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => {
        const p = self.progress;
        el.style.setProperty("--p", p.toFixed(4));
        if (steps) {
          el.dataset.step = String(Math.min(steps - 1, Math.floor(p * steps)));
        }
        cb.current?.(p);
      },
    });
    return () => st.kill();
  }, [start, end, steps]);

  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={{ "--p": 0, ...style } as CSSProperties}
      data-step={steps ? 0 : undefined}
    >
      {children}
    </section>
  );
}
