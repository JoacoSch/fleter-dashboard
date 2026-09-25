"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, useSyncExternalStore, type MutableRefObject, type ReactNode } from "react";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/** Si WebGL falla (o no hay), la página sigue: se muestra el póster CSS. */
class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[HeroCanvas] WebGL falló, se usa el póster.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

const subscribeNone = () => () => {};
const capability = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches || !webglOk() ? ("poster" as const) : ("gl" as const);

/** Póster estático: mismo look (autopista al atardecer) sin una línea de WebGL. */
export function HeroPoster() {
  return <div className="lp-poster" aria-hidden="true" />;
}

export default function HeroCanvas({ progress }: { progress: MutableRefObject<number> }) {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  // El servidor no sabe si hay WebGL: "pending" hasta hidratar, después "gl" o "poster".
  const mode = useSyncExternalStore(subscribeNone, capability, () => "pending" as const);

  // Pausa el render cuando el hero sale de pantalla.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="lp-canvas">
      <HeroPoster />
      {mode === "gl" && (
        <Boundary fallback={null}>
          <HeroScene progress={progress} active={active} />
        </Boundary>
      )}
    </div>
  );
}
