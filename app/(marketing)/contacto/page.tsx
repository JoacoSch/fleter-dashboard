import Link from "next/link";
import Isotipo from "@/components/Isotipo";

export const metadata = { title: "Contacto — Fleter" };

/** Placeholder: la página de contacto con formulario está pendiente. */
export default function ContactoPage() {
  return (
    <section className="lp-contact">
      <Isotipo style={{ width: 72, height: 72 }} />
      <h1 className="lp-display">Contanos cómo trabajás.</h1>
      <p className="lp-lead">Estamos armando esta página. Mientras tanto, volvé al inicio.</p>
      <Link href="/" className="lp-link">Volver</Link>
    </section>
  );
}
