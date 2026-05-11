"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function homeForRole(role: string) {
  if (role === "CONDUCTOR") return "/conductor";
  if (role === "GERENTE") return "/gerente";
  return "/";
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(email, password);
      router.push(homeForRole(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const role = await loginWithGoogle();
      router.push(homeForRole(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error con Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div className="brand-mark">F</div>
        <span className="brand-name">fle<em>ter</em></span>
      </div>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 6 }}>
        Iniciá sesión
      </h1>
      <p style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 24 }}>
        Accedé al panel de tu empresa
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="vos@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p style={{ color: "var(--err)", fontSize: 13 }}>{error}</p>
        )}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", padding: "10px 12px" }}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="divider" style={{ margin: "20px 0" }}>o</div>

      <button
        type="button"
        className="btn"
        onClick={handleGoogle}
        disabled={loading}
        style={{ width: "100%", justifyContent: "center", padding: "10px 12px" }}
      >
        Continuar con Google
      </button>

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--ink-3)" }}>
        <Link href="/recuperar" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Olvidé mi contraseña
        </Link>
      </p>

      <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "var(--ink-3)" }}>
        ¿No tenés cuenta?{" "}
        <Link href="/registro" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Registrate
        </Link>
      </p>
    </div>
  );
}
