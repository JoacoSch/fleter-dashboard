"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { homeForRole } from "@/lib/roles";

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
      <div className="auth-brand">
        <div className="brand-mark">F</div>
        <span className="brand-name">Fleter<em>.</em></span>
      </div>

      <h1 className="auth-title">Iniciá sesión</h1>
      <p className="auth-subtitle">Accedé al panel de tu empresa</p>

      <form onSubmit={handleSubmit} className="auth-form">
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

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="divider" style={{ margin: "20px 0" }}>o</div>

      <button type="button" className="btn btn--full" onClick={handleGoogle} disabled={loading}>
        Continuar con Google
      </button>

      <p className="auth-footer auth-footer--mt20">
        <Link href="/recuperar" className="auth-link">Olvidé mi contraseña</Link>
      </p>

      <p className="auth-footer auth-footer--mt12">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="auth-link">Registrate</Link>
      </p>
    </div>
  );
}
