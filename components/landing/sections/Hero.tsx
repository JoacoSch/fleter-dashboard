"use client";

import { useRef } from "react";
import Stage from "../fx/Stage";
import HeroCanvas from "../three/HeroCanvas";
import EmpezarButton from "../ui/EmpezarButton";

/**
 * Sticky de 320vh: el scroll conduce la cámara (persecución → cenital → mapa).
 * Los textos se acomodan con --p, sin JS: ver .lp-hero__* en styles/landing.
 */
export default function Hero() {
  const progress = useRef(0);

  return (
    <Stage
      className="lp-hero"
      onProgress={(p) => {
        progress.current = p;
      }}
    >
      <div className="lp-hero__stick">
        <HeroCanvas progress={progress} />
        <div className="lp-hero__vignette" aria-hidden="true" />

        <div className="lp-hero__copy lp-wrap">
          <p className="lp-eyebrow">
            <i /> Logística industrial · AMBA
          </p>
          <h1 className="lp-display lp-hero__h1">
            <span className="lp-line"><span>Tus conductores</span></span>
            <span className="lp-line"><span>de siempre.</span></span>
            <span className="lp-line lp-line--accent"><span>Sin el trabajo</span></span>
            <span className="lp-line lp-line--accent"><span>de siempre.</span></span>
          </h1>
          <p className="lp-lead lp-hero__lead">
            Fleter pide, sigue, confirma y factura cada viaje de tu empresa. Vos elegís con quién
            trabajás. El resto se hace solo.
          </p>
          <div className="lp-hero__cta">
            <EmpezarButton size="lg" />
            <span className="lp-micro">Funcionando en una semana</span>
          </div>
        </div>

        <div className="lp-hero__map" aria-hidden="true">
          <div className="lp-trip">
            <span className="lp-trip__dot" />
            <div>
              <b>VJ-2419 · En ruta</b>
              <small>Burzaco → Tortuguitas · llegada 16:10</small>
            </div>
          </div>
          <p className="lp-slogan">Tu logística, de punta a punta.</p>
        </div>

        <div className="lp-hero__scroll" aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </Stage>
  );
}
