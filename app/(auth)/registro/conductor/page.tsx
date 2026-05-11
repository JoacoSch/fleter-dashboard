"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegistroConductorPage() {
  const { registerConductor } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    nro_licencia: "",
    licencia_vencimiento: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerConductor({
        ...form,
        telefono: form.telefono || undefined,
        licencia_vencimiento: new Date(form.licencia_vencimiento).toISOString(),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card" style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div className="brand-mark">F</div>
        <span className="brand-name">fle<em>ter</em></span>
      </div>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 6 }}>
        Registrate como conductor
      </h1>
      <p style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 24 }}>
        Completá tus datos y los de tu licencia
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" type="text" placeholder="Juan" value={form.nombre} onChange={set("nombre")} required />
          </div>
          <div className="field">
            <label htmlFor="apellido">Apellido</label>
            <input id="apellido" type="text" placeholder="García" value={form.apellido} onChange={set("apellido")} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="dni">DNI</label>
          <input id="dni" type="text" placeholder="12345678" value={form.dni} onChange={set("dni")} required minLength={7} maxLength={9} pattern="\d{7,9}" />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="vos@email.com" value={form.email} onChange={set("email")} required autoComplete="email" />
        </div>

        <div className="field">
          <label htmlFor="telefono">Teléfono <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(opcional)</span></label>
          <input id="telefono" type="tel" placeholder="+5491112345678" value={form.telefono} onChange={set("telefono")} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label htmlFor="nro_licencia">Nro. de licencia</label>
            <input id="nro_licencia" type="text" placeholder="B1234567" value={form.nro_licencia} onChange={set("nro_licencia")} required />
          </div>
          <div className="field">
            <label htmlFor="licencia_vencimiento">Vencimiento de licencia</label>
            <input id="licencia_vencimiento" type="date" value={form.licencia_vencimiento} onChange={set("licencia_vencimiento")} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set("password")} required minLength={8} autoComplete="new-password" />
        </div>

        {error && (
          <p style={{ color: "var(--err)", fontSize: 13 }}>{error}</p>
        )}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", padding: "10px 12px", marginTop: 4 }}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--ink-3)" }}>
        <Link href="/registro" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Volver al registro de empresa
        </Link>
      </p>

      <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "var(--ink-3)" }}>
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
