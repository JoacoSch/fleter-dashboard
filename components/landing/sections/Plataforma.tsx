import Stage from "../fx/Stage";
import Words from "../ui/Words";

export default function Plataforma() {
  return (
    <Stage id="plataforma" className="lp-sec lp-platform" start="top bottom" end="bottom top">
      <div className="lp-wrap lp-platform__grid">
        <div>
          <Words text="Un sistema. Todos conectados." className="lp-h2" />
          <p className="lp-lead" data-reveal>
            Vos operás desde la web. Tu conductor, desde la app. Tu cliente recibe el remito
            conformado. Cada movimiento queda registrado, sin que nadie tenga que cargarlo.
          </p>
        </div>

        <div className="lp-devices" aria-hidden="true">
          <div className="lp-laptop">
            <div className="lp-laptop__screen">
              <aside><i /><i /><i /><i /></aside>
              <main>
                <div className="lp-mini-kpis"><span>37<small>viajes</small></span><span>$ 1,28 M<small>gasto</small></span><span>4<small>en curso</small></span></div>
                <div className="lp-mini-bars">{[40, 62, 48, 80, 66, 92, 74, 58].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
              </main>
            </div>
            <div className="lp-laptop__base" />
          </div>
          <div className="lp-phone lp-phone--float">
            <i className="lp-phone__notch" />
            <small className="lp-mono">VJ-2419</small>
            <b>En camino</b>
            <div className="lp-mini-map"><i /></div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
