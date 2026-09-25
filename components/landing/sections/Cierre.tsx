import Link from "next/link";
import Isotipo from "@/components/Isotipo";
import EmpezarButton from "../ui/EmpezarButton";
import Words from "../ui/Words";
import { Wordmark } from "./Nav";

export default function Cierre() {
  return (
    <>
      <section id="cierre" className="lp-close">
        <div className="lp-close__road" aria-hidden="true" />
        <div className="lp-close__glow" aria-hidden="true" />
        <div className="lp-wrap lp-close__inner">
          <div className="lp-stack" data-reveal aria-hidden="true">
            <Isotipo className="isotipo--stack" />
          </div>
          <Words text="Tu logística, de punta a punta." as="h2" split className="lp-display lp-close__h" />
          <p className="lp-lead" data-reveal>Contanos cómo trabajás. Del resto nos ocupamos nosotros.</p>
          <div className="lp-close__cta" data-reveal>
            <EmpezarButton size="lg" />
            <Link href="/contacto" target="_blank" rel="noopener" className="lp-link">
              Contacto
            </Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer__row">
          <Wordmark />
          <span className="lp-micro">Tu logística, de punta a punta.</span>
          <nav aria-label="Pie">
            <Link href="/login">Acceder</Link>
            <Link href="/contacto" target="_blank" rel="noopener">Contacto</Link>
          </nav>
          <span className="lp-micro">© 2026 Fleter</span>
        </div>
      </footer>
    </>
  );
}
