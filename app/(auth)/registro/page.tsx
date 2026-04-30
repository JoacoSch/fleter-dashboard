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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div className="brand-mark">F</div>
        <span className="brand-name">fle<em>ter</em></span>
      </div>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 6 }}>
        Creá tu cuenta
      </h1>
      <p style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 24 }}>
        Para empresas que contratan fletes
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
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
