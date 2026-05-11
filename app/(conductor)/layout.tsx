"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import type { ReactNode } from "react";

const navItems = [
  { href: "/conductor", label: "Viajes disponibles", icon: "⊡" },
];

function ConductorLayoutInner({ children }: { children: ReactNode }) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 2px", marginBottom: 20 }}>
          <div className="brand-mark">F</div>
          <span className="brand-name">fle<em>ter</em></span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href ? "is-active" : ""}`}
            >
              <span className="nav-item__icon" style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                {icon}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px" }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--accent-soft)",
              color: "var(--accent-ink)",
              fontFamily: "var(--font-display)",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {profile ? `${profile.nombre[0]}${profile.apellido[0]}` : "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.nombre} {profile?.apellido}
              </p>
              <p style={{ fontSize: 11, color: "var(--ink-3)" }}>Conductor</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn--ghost"
            style={{ width: "100%", justifyContent: "flex-start", fontSize: 12.5, color: "var(--ink-3)" }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <p style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--ink)" }}>
            Panel del conductor
          </p>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ConductorLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConductorLayoutInner>{children}</ConductorLayoutInner>
    </AuthProvider>
  );
}
