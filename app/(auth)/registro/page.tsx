"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegistroPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    empresa: "",
    cuit: "",
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
      await register(form);
      router.push("/login");
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

      <h1 className="auth-title">Creá tu cuenta</h1>
      <p className="auth-subtitle">Para empresas que contratan fletes</p>

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
          <input id="email" type="email" placeholder="vos@empresa.com" value={form.email} onChange={set("email")} required autoComplete="email" />
        </div>

        <div className="field">
          <label htmlFor="empresa">Nombre de la empresa</label>
          <input id="empresa" type="text" placeholder="Mi PyME S.A." value={form.empresa} onChange={set("empresa")} required />
        </div>

        <div className="field">
          <label htmlFor="cuit">CUIT</label>
          <input id="cuit" type="text" placeholder="20-12345678-9" value={form.cuit} onChange={set("cuit")} required />
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
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="auth-link">Iniciá sesión</Link>
      </p>

      <div style={{ borderTop: "1px solid var(--line)", marginTop: 20, paddingTop: 16, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 10 }}>¿Sos conductor?</p>
        <Link href="/registro/conductor" className="btn" style={{ display: "inline-flex", justifyContent: "center", padding: "9px 20px", fontSize: 13 }}>
          Registrate como conductor
        </Link>
      </div>
    </div>
  );
}
