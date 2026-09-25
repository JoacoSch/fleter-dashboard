import Stage from "../fx/Stage";
import Words from "../ui/Words";

const STEPS = [
  { t: "Pedí.", d: "Origen, paradas, destino y carga. Listo." },
  { t: "Asigná.", d: "El viaje le llega al celular a tu conductor." },
  { t: "Seguí.", d: "Cada viaje, en el mapa, en vivo." },
  { t: "Entregado.", d: "Una foto del remito firmado. Ubicación, hora y comprobante, automáticos." },
];

/** Sticky de 4 pasos: `data-step` (Stage) elige qué capa del dispositivo se ve. */
export default function ComoFunciona() {
  return (
    <Stage id="como-funciona" className="lp-how" steps={4}>
      <div className="lp-how__stick lp-wrap">
        <div className="lp-how__text">
          <Words text="Cuatro pasos. Cero papeles." className="lp-h2" />
          <ol className="lp-how__steps">
            {STEPS.map((s, i) => (
              <li key={s.t} data-i={i}>
                <span className="lp-mono">0{i + 1}</span>
                <div>
                  <b>{s.t}</b>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="lp-how__bar" aria-hidden="true"><i /></div>
        </div>

        <div className="lp-device" aria-hidden="true">
          <div className="lp-device__bar"><i /><i /><i /><span>fleter · viaje VJ-2419</span></div>

          <div className="lp-scene lp-scene--0">
            <label>Origen<b>Burzaco, Buenos Aires</b></label>
            <label>Destino<b>Tortuguitas, Malvinas Argentinas</b></label>
            <label>Carga<b>12 pallets · 4.200 kg</b></label>
            <span className="lp-fakebtn">Pedir viaje</span>
          </div>

          <div className="lp-scene lp-scene--1">
            <div className="lp-driver">
              <span className="lp-avatar">MR</span>
              <div>
                <small>Chofer asignado</small>
                <b>Martín R.</b>
                <em className="lp-mono">Utilitario · AB 123 CD</em>
              </div>
              <span className="lp-status">Asignado</span>
            </div>
            <p className="lp-scene__note">Le llegó al celular.</p>
          </div>

          <div className="lp-scene lp-scene--2">
            <svg viewBox="0 0 400 260" className="lp-routesvg">
              <defs>
                <pattern id="lpgrid" width="26" height="26" patternUnits="userSpaceOnUse">
                  <path d="M26 0H0V26" fill="none" stroke="currentColor" strokeOpacity=".12" />
                </pattern>
              </defs>
              <rect width="400" height="260" fill="url(#lpgrid)" />
              <path id="lproute" d="M40 210 C120 200 130 110 210 120 S330 60 362 42" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="6" strokeLinecap="round" />
              <path className="lp-routesvg__done" d="M40 210 C120 200 130 110 210 120 S330 60 362 42" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" pathLength="1" />
              <circle className="lp-truckdot" r="9" fill="var(--accent)" />
            </svg>
            <div className="lp-trip lp-trip--in">
              <span className="lp-trip__dot" />
              <div><b>En camino</b><small>llegada 16:10</small></div>
            </div>
          </div>

          <div className="lp-scene lp-scene--3">
            <div className="lp-remito"><b>REMITO</b><i /><i /><i /><em>firmado</em></div>
            <div className="lp-check"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <div className="lp-scene__meta"><b>Entrega confirmada</b><span className="lp-mono">14:30 · ubicación registrada</span></div>
            <span className="lp-dev">En desarrollo</span>
          </div>
        </div>
      </div>
    </Stage>
  );
}
