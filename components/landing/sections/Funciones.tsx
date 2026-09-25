"use client";

import { useState } from "react";
import Words from "../ui/Words";

const FUNCIONES = [
  { chip: "Seguimiento en vivo", text: "Sabés dónde está cada viaje. Sin llamar a nadie." },
  { chip: "Remito conformado", text: "Foto del remito firmado, con ubicación y hora, guardada en el viaje." },
  { chip: "Comprobante automático", text: "Se genera solo al entregar. Listo para mandarle a tu cliente." },
  { chip: "Estados del viaje", text: "De Buscando a Entregado, con la hora real de cada paso." },
  { chip: "Estimado y real", text: "Distancia, tiempo y llegada: lo planeado contra lo que pasó." },
  { chip: "Tus conductores", text: "Cada conductor con su vehículo, patente y licencia." },
  { chip: "Empresas cliente", text: "Viajes ordenados por cada cliente al que le entregás." },
  { chip: "Condiciones de carga", text: "Peso, volumen, pallets y requisitos especiales en cada viaje." },
  { chip: "Recorridos con paradas", text: "Un viaje, varias paradas, cada una con su dirección." },
  { chip: "Registro", text: "Cada viaje queda registrado para buscar, filtrar o exportar." },
  { chip: "Conductores verificados", text: "Cuando tu flota no alcanza, sumás conductores verificados." },
];

export default function Funciones() {
  const [i, setI] = useState(0);
  const cur = FUNCIONES[i];

  return (
    <section id="funciones" className="lp-sec lp-funcs">
      <div className="lp-wrap">
        <Words text="Y todo lo demás." className="lp-h2" />
      </div>

      <div className="lp-chips" role="tablist" aria-label="Funciones">
        {FUNCIONES.map((f, n) => (
          <button
            key={f.chip}
            role="tab"
            aria-selected={n === i}
            className={`lp-chip ${n === i ? "is-on" : ""}`}
            onClick={() => setI(n)}
          >
            {f.chip}
          </button>
        ))}
      </div>

      <div className="lp-wrap">
        <div className="lp-funcs__panel" role="tabpanel" key={i}>
          <h3>{cur.chip}</h3>
          <p>{cur.text}</p>
          <div className="lp-funcs__viz" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, n) => (
              <i key={n} style={{ "--n": n } as React.CSSProperties} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
