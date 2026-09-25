import Words from "../ui/Words";

const FAQ = [
  {
    q: "¿Mis conductores tienen que cambiar cómo trabajan?",
    a: "Casi nada. Reciben el viaje en el celular, llegan y confirman la entrega con una foto. Lo demás lo hace Fleter.",
  },
  {
    q: "¿Y si mi conductor no usa apps?",
    a: "Se suman en minutos y lo que tienen que hacer es muy poco. En la entrevista vemos cómo sumar a cada uno.",
  },
  {
    q: "¿Sirve si trabajo con 2 o 3 conductores?",
    a: "Sí. Fleter se configura a la medida de tu operación, sea chica o grande.",
  },
  {
    q: "¿Cómo se adapta la facturación a mi empresa?",
    a: "Cada empresa le factura a su flota a su manera: por viaje, por quincena, por mes, por kilómetro. En la entrevista lo configuramos con la tuya.",
  },
  {
    q: "¿Puedo seguir usando remitos de papel?",
    a: "Sí. El remito sigue siendo el respaldo: el conductor lo fotografía firmado y queda guardado en el viaje, con ubicación y hora.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="lp-sec lp-faq">
      <div className="lp-wrap lp-faq__grid">
        <div>
          <Words text="Preguntas frecuentes." className="lp-h2" />
        </div>
        <div className="lp-faq__list">
          {FAQ.map((f) => (
            <details key={f.q} className="lp-qa" data-reveal>
              <summary>
                <span>{f.q}</span>
                <i aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
