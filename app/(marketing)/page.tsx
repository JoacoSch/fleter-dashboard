import Hero from "@/components/landing/sections/Hero";
import Problema from "@/components/landing/sections/Problema";
import ComoFunciona from "@/components/landing/sections/ComoFunciona";
import CoreFeatures from "@/components/landing/sections/CoreFeatures";
import Plataforma from "@/components/landing/sections/Plataforma";
import Funciones from "@/components/landing/sections/Funciones";
import Metricas from "@/components/landing/sections/Metricas";
import Onboarding from "@/components/landing/sections/Onboarding";
import Faq from "@/components/landing/sections/Faq";
import Cierre from "@/components/landing/sections/Cierre";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Problema />
      <ComoFunciona />
      <CoreFeatures />
      <Plataforma />
      <Funciones />
      <Metricas />
      <Onboarding />
      <Faq />
      <Cierre />
    </>
  );
}
