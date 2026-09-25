"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Isotipo from "@/components/Isotipo";
import EmpezarButton from "../ui/EmpezarButton";

const LINKS = [
  { href: "#producto", label: "Producto" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#funciones", label: "Funciones" },
  { href: "#faq", label: "FAQ" },
];

export function Wordmark() {
  return (
    <span className="lp-mark" aria-label="Fleter">
      <Isotipo />
      <span aria-hidden="true">
        Fleter<em>.</em>
      </span>
    </span>
  );
}

export default function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`lp-nav ${solid ? "is-solid" : ""}`}>
      <a href="#top" className="lp-nav__brand" aria-label="Fleter, inicio">
        <Wordmark />
      </a>
      <nav className="lp-nav__links" aria-label="Secciones">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="lp-nav__actions">
        <Link href="/login" className="lp-nav__login">
          Acceder
        </Link>
        <EmpezarButton />
      </div>
    </header>
  );
}
