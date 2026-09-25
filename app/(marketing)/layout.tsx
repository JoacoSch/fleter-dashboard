import type { Metadata } from "next";
import Nav from "@/components/landing/sections/Nav";
import SmoothScroll from "@/components/landing/fx/SmoothScroll";
import RevealObserver from "@/components/landing/fx/RevealObserver";
import "@/styles/landing/landing.css";

export const metadata: Metadata = {
  title: "Fleter — Tu logística, de punta a punta",
  description:
    "Fleter pide, sigue, confirma y factura cada viaje de tu empresa. Vos elegís con quién trabajás. El resto se hace solo.",
};

/**
 * Landing pública. Tiene su propio tema (siempre oscuro, scope `.lp`): no
 * depende del conmutador del dashboard ni de `data-theme`.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp" id="top">
      <SmoothScroll />
      <RevealObserver />
      <Nav />
      <main>{children}</main>
    </div>
  );
}
