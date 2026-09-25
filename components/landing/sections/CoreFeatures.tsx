import Words from "../ui/Words";

const BARS = [38, 52, 44, 71, 63, 88, 76];

export default function CoreFeatures() {
  return (
    <section id="producto" className="lp-sec lp-features">
      <div className="lp-wrap">
        <Words text="Todo tu transporte. Bajo control." className="lp-h2" />

        <div className="lp-features__grid">
          {/* Dashboard */}
          <article className="lp-feature" data-reveal style={{ "--d": "0s" } as React.CSSProperties}>
            <div className="lp-feature__viz">
              <svg viewBox="0 0 320 190" role="img" aria-label="Gasto por semana, en miles de pesos">
                {[0, 1, 2, 3].map((i) => (
                  <g key={i}>
                    <line x1="44" x2="312" y1={20 + i * 45} y2={20 + i * 45} stroke="currentColor" strokeOpacity=".14" />
                    <text x="36" y={24 + i * 45} textAnchor="end" className="lp-ax">{["$ 1 M", "$ 750 mil", "$ 500 mil", "$ 250 mil"][i]}</text>
                  </g>
                ))}
                {BARS.map((v, i) => (
                  <rect key={i} className="lp-bar" x={54 + i * 37} width="22" rx="4" y={155 - v * 1.35} height={v * 1.35} style={{ "--i": i } as React.CSSProperties} />
                ))}
                {["S1", "S2", "S3", "S4", "S5", "S6", "S7"].map((w, i) => (
                  <text key={w} x={65 + i * 37} y="178" textAnchor="middle" className="lp-ax">{w}</text>
                ))}
              </svg>
              <div className="lp-kpi"><span className="lp-mono">Viajes del mes</span><b>37</b></div>
            </div>
            <h3>Tu operación, de un vistazo.</h3>
            <p>Gasto, viajes y entregas en un tablero que se actualiza solo.</p>
            <ul>
              <li>Viajes en curso en vivo</li>
              <li>Gasto por semana</li>
              <li>Costo promedio por viaje</li>
            </ul>
          </article>

          {/* Facturación */}
          <article className="lp-feature" data-reveal style={{ "--d": ".12s" } as React.CSSProperties}>
            <div className="lp-feature__viz lp-feature__viz--fact">
              <div className="lp-rules" aria-hidden="true">
                {["Por viaje", "Por quincena", "Por mes", "Por kilómetro"].map((r, i) => (
                  <span key={r} style={{ "--i": i } as React.CSSProperties}>{r}</span>
                ))}
              </div>
              <div className="lp-voucher">
                <small className="lp-mono">Comprobante · septiembre</small>
                <b>$ 1.284.500</b>
                <i /><i /><i />
                <em>Informativo</em>
              </div>
            </div>
            <h3>Tu forma de facturar. Nuestro sistema.</h3>
            <p>Cada empresa le factura a su flota a su manera: por viaje, por quincena, por mes, por kilómetro. Fleter se adapta a la tuya. Solo hace falta una entrevista con nuestro equipo.</p>
            <ul>
              <li>Configurada a medida en una entrevista</li>
              <li>Todos los viajes de cada conductor, consolidados</li>
              <li>Cada viaje con su remito como respaldo</li>
            </ul>
          </article>

          {/* App del conductor */}
          <article className="lp-feature" data-reveal style={{ "--d": ".24s" } as React.CSSProperties}>
            <div className="lp-feature__viz lp-feature__viz--app">
              <div className="lp-phone" aria-hidden="true">
                <i className="lp-phone__notch" />
                <small className="lp-mono">VJ-2419</small>
                <b>Viaje asignado</b>
                <span>Burzaco → Tortuguitas</span>
                <span className="lp-fakebtn lp-fakebtn--ph">Subir remito</span>
                <div className="lp-check lp-check--sm"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              </div>
            </div>
            <h3>Todo el viaje. En el bolsillo.</h3>
            <p>Tu conductor recibe el viaje, llega y confirma la entrega con una foto.</p>
            <ul>
              <li>Aviso al instante</li>
              <li>Foto, ubicación y hora</li>
              <li>Sin papeles extra</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
