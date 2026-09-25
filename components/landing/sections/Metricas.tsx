import CountUp from "../fx/CountUp";
import Words from "../ui/Words";

const METRICAS = [
  { n: 1, unit: "", label: "Un solo lugar para viajes, remitos y facturación", from: 3 },
  { n: 0, unit: "", label: "Llamadas para saber dónde está el camión", from: 9 },
  { n: 1, unit: "foto", label: "Para confirmar una entrega, con ubicación y hora", from: 5 },
  { n: 7, unit: "días", label: "Para tener tu operación funcionando", from: 0 },
];

export default function Metricas() {
  return (
    <section id="metricas" className="lp-sec lp-metrics">
      <div className="lp-wrap">
        <Words text="Lo que ganás con Fleter." className="lp-h2" />
        <div className="lp-metrics__grid">
          {METRICAS.map((m, i) => (
            <div key={i} className="lp-metric" data-reveal style={{ "--d": `${i * 0.1}s` } as React.CSSProperties}>
              <div className="lp-metric__n">
                <CountUp to={m.n} from={m.from} />
                {m.unit && <small>{m.unit}</small>}
              </div>
              <p>{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
