import Stage from "../fx/Stage";
import Words from "../ui/Words";

const PASOS = [
  { t: "Entrevista.", d: "Conocemos tu operación y cómo le facturás a tu flota." },
  { t: "Configuración.", d: "Armamos Fleter a tu medida." },
  { t: "Tus conductores.", d: "Se suman a la app en minutos." },
  { t: "Primer viaje.", d: "Y el papel no vuelve más." },
];

export default function Onboarding() {
  return (
    <Stage id="semana" className="lp-sec lp-week" start="top 70%" end="bottom 60%">
      <div className="lp-wrap">
        <Words text="Empezar es lo más fácil." className="lp-h2" />
        <p className="lp-lead" data-reveal>Funcionando en una semana.</p>

        <ol className="lp-timeline">
          <span className="lp-timeline__rail" aria-hidden="true"><i /></span>
          {PASOS.map((p, i) => (
            <li key={p.t} style={{ "--i": i } as React.CSSProperties}>
              <span className="lp-timeline__node lp-mono">0{i + 1}</span>
              <b>{p.t}</b>
              <p>{p.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </Stage>
  );
}
