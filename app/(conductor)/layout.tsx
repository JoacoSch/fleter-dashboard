"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { Navigation, ClipboardList, Truck, User, LogOut } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/conductor",               label: "Viajes disponibles", Icon: Navigation },
  { href: "/conductor/mis-viajes",    label: "Mis viajes",         Icon: ClipboardList },
  { href: "/conductor/mis-vehiculos", label: "Mis vehículos",      Icon: Truck },
];

function ConductorLayoutInner({ children }: { children: ReactNode }) {
  const { profile, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [loading, profile, router]);

  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

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
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item${pathname === href ? " is-active" : ""}`}
            >
              <Icon size={16} className="nav-item__icon" />
              <span className="nav-item__label">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar__profile-section">
          <div ref={menuRef} style={{ position: "relative" }}>
            {menuOpen && (
              <div className="sidebar__user-menu">
                <Link
                  href="/conductor/perfil"
                  className="sidebar__user-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={14} />
                  Mi perfil
                </Link>
                <div className="sidebar__user-menu-sep" />
                <button
                  type="button"
                  className="sidebar__user-menu-item sidebar__user-menu-item--danger"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            )}
            <button
              type="button"
              className="sidebar__conductor-user sidebar__user--btn"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <div className="sidebar__conductor-avatar">
                {`${profile.nombre[0]}${profile.apellido[0]}`}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="sidebar__conductor-name">{profile.nombre} {profile.apellido}</p>
                <p className="sidebar__conductor-role">Conductor</p>
              </div>
            </button>
          </div>
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
