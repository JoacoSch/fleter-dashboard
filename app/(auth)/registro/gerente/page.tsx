"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegistroGerentePage() {
  const { registerGerente } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    nombre_empresa: "",
    cuit_empresa: "",
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
      await registerGerente({
        ...form,
        telefono: form.telefono || undefined,
      });
      router.push("/gerente/empresa");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card" style={{ maxWidth: 480 }}>
      <div className="auth-brand">
        <div className="brand-mark">F</div>
        <span className="brand-name">Fleter<em>.</em></span>
      </div>

      <h1 className="auth-title">Registrá tu empresa fletera</h1>
      <p className="auth-subtitle">
        Creamos tu cuenta de gerente junto con la empresa y su código de afiliación
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
          <label htmlFor="telefono">
            Teléfono <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(opcional)</span>
          </label>
          <input id="telefono" type="tel" placeholder="+5491112345678" value={form.telefono} onChange={set("telefono")} />
        </div>

        <div className="field">
          <label htmlFor="nombre_empresa">Nombre de la empresa</label>
          <input id="nombre_empresa" type="text" placeholder="Fletes del Sur SRL" value={form.nombre_empresa} onChange={set("nombre_empresa")} required />
        </div>

        <div className="field">
          <label htmlFor="cuit_empresa">CUIT de la empresa</label>
          <input id="cuit_empresa" type="text" placeholder="30712345678" value={form.cuit_empresa} onChange={set("cuit_empresa")} required minLength={11} maxLength={13} />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={set("password")} required minLength={8} autoComplete="new-password" />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="auth-footer auth-footer--mt20">
        <Link href="/registro" className="auth-link">← Volver al registro de cliente</Link>
      </p>

      <p className="auth-footer auth-footer--mt12">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="auth-link">Iniciá sesión</Link>
      </p>
    </div>
  );
}
