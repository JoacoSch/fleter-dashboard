"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RecuperarPage() {
  const { sendRecovery } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendRecovery(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el email");
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

      {sent ? (
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--ok-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 22,
          }}>
            ✓
          </div>
          <h1 className="auth-title">Revisá tu casilla</h1>
          <p style={{ color: "var(--ink-3)", fontSize: 13, lineHeight: 1.5 }}>
            Te mandamos un link a <strong style={{ color: "var(--ink)" }}>{email}</strong> para
            restablecer tu contraseña.
          </p>
          <Link href="/login" className="auth-link" style={{ display: "inline-block", marginTop: 24, fontSize: 13 }}>
            ← Volver al login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="auth-title">Recuperar contraseña</h1>
          <p className="auth-subtitle">Te enviamos un link a tu email para restablecerla.</p>

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

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de recuperación"}
            </button>
          </form>

          <p className="auth-footer auth-footer--mt20">
            <Link href="/login" className="auth-link">← Volver al login</Link>
          </p>
        </>
      )}
    </div>
  );
}
