import Stage from "../fx/Stage";
import Words from "../ui/Words";

/** El caos (chat, planilla, remito) se ordena solo mientras se scrollea. */
export default function Problema() {
  return (
    <Stage id="problema" className="lp-problema" start="top top" end="bottom bottom">
      <div className="lp-problema__stick lp-wrap">
        <Words text="La logística no debería vivir en WhatsApp." className="lp-h2" />
        <p className="lp-lead lp-problema__lead">
          Llamadas, planillas y remitos que tardan días en volver. Todo eso ya tiene solución.
        </p>

        <div className="lp-chaos">
          <article className="lp-chaos__card" style={{ "--x0": "-36vw", "--y0": "12vh", "--r0": "-14deg", "--k": 0 } as React.CSSProperties}>
            <h3>¿Dónde está el camión?</h3>
            <div className="lp-chat">
              <span>¿salió el camión?</span>
              <span className="r">salió hace rato</span>
              <span>¿llegó?</span>
              <span>mandame foto del remito</span>
            </div>
          </article>

          <article className="lp-chaos__card" style={{ "--x0": "6vw", "--y0": "-18vh", "--r0": "9deg", "--k": 1 } as React.CSSProperties}>
            <h3>¿Se entregó?</h3>
            <div className="lp-sheet" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <i key={i} />
              ))}
            </div>
          </article>

          <article className="lp-chaos__card" style={{ "--x0": "40vw", "--y0": "14vh", "--r0": "-7deg", "--k": 2 } as React.CSSProperties}>
            <h3>¿Cuánto le debo?</h3>
            <div className="lp-paper" aria-hidden="true">
              <b>REMITO</b>
              <i /><i /><i />
              <em>firma</em>
            </div>
          </article>
        </div>
      </div>
    </Stage>
  );
}
