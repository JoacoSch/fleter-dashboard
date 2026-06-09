"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import type { ReactNode } from "react";

const navItems = [
  { href: "/conductor",           label: "Viajes disponibles" },
  { href: "/conductor/mis-viajes", label: "Mis viajes" },
];

function ConductorLayoutInner({ children }: { children: ReactNode }) {
  const { profile, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [loading, profile, router]);

  if (loading || !profile) return null;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-mark">F</div>
          <span className="brand-name">Fleter<em>.</em></span>
        </div>

        <nav className="sidebar__nav" style={{ flex: 1 }}>
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item${pathname === href ? " is-active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebar__conductor-footer">
          <div className="sidebar__conductor-user">
            <div className="sidebar__conductor-avatar">
              {`${profile.nombre[0]}${profile.apellido[0]}`}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="sidebar__conductor-name">{profile.nombre} {profile.apellido}</p>
              <p className="sidebar__conductor-role">Conductor</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn--ghost btn--full"
            style={{ justifyContent: "flex-start", fontSize: 12.5, color: "var(--ink-3)" }}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar" />
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
