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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div className="brand-mark">F</div>
        <span className="brand-name">fle<em>ter</em></span>
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
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>
            Revisá tu casilla
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 13, lineHeight: 1.5 }}>
            Te mandamos un link a <strong style={{ color: "var(--ink)" }}>{email}</strong> para
            restablecer tu contraseña.
          </p>
          <Link
            href="/login"
            style={{ display: "inline-block", marginTop: 24, color: "var(--accent)", fontSize: 13, fontWeight: 600 }}
          >
            ← Volver al login
          </Link>
        </div>
      ) : (
        <>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 6 }}>
            Recuperar contraseña
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 24 }}>
            Te enviamos un link a tu email para restablecerla.
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

            {error && (
              <p style={{ color: "var(--err)", fontSize: 13 }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "10px 12px" }}
            >
              {loading ? "Enviando..." : "Enviar link de recuperación"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--ink-3)" }}>
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
              ← Volver al login
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
