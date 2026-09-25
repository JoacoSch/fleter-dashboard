"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";

/**
 * Único CTA primario de la landing. Abre /contacto en otra pestaña
 * (el informe: en la landing no hay formulario). Efecto magnético leve.
 */
export default function EmpezarButton({
  size = "md",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Link
      ref={ref}
      href="/contacto"
      target="_blank"
      rel="noopener"
      className={`lp-btn lp-btn--${size} ${className}`}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <span>Empezar</span>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
