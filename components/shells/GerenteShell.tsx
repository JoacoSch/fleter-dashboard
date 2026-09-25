"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresa } from "@/hooks/useEmpresa";
import { Navigation, ClipboardList, Users, Truck, Building2, LogOut } from "lucide-react";
import TemaToggle from "@/components/TemaToggle";
import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth-server";
import AppShell from "@/components/shells/AppShell";

const navItems = [
  { href: "/gerente",             label: "Viajes disponibles", Icon: Navigation },
  { href: "/gerente/viajes",      label: "Mis viajes",         Icon: ClipboardList },
  { href: "/gerente/conductores", label: "Conductores",        Icon: Users },
  { href: "/gerente/flota",       label: "Flota",              Icon: Truck },
  { href: "/gerente/empresa",     label: "Mi empresa",         Icon: Building2 },
];

export default function GerenteShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const { profile, logout } = useAuth();
  const { empresas, empresaActiva, setEmpresaActiva } = useEmpresa();
  const nombre = profile?.nombre ?? user.nombre;
  const apellido = profile?.apellido ?? user.apellido;

  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <AppShell>
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-mark">F</div>
          <span className="brand-name">Fleter<em>.</em></span>
        </div>

        <nav className="sidebar__nav sidebar__nav--grow">
          {navItems.map(({ href, label, Icon }) => {
            const isActive =
              href === "/gerente" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item${isActive ? " is-active" : ""}`}
              >
                <Icon size={16} className="nav-item__icon" />
                <span className="nav-item__label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__profile-section">
          <div ref={menuRef} className="sidebar__user-anchor">
            {menuOpen && (
              <div className="sidebar__user-menu">
                <TemaToggle />
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
                {`${nombre[0]}${apellido[0]}`}
              </div>
              <div className="sidebar__user-info">
                <p className="sidebar__conductor-name">{nombre} {apellido}</p>
                <p className="sidebar__conductor-role">Gerente</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          {empresaActiva && (
            <div className="topbar__empresa">
              <span className="topbar__empresa-label">Empresa</span>
              {empresas.length > 1 ? (
                <select
                  value={empresaActiva.id_empresa}
                  onChange={(e) => setEmpresaActiva(Number(e.target.value))}
                  className="input input--sm"
                >
                  {empresas.map((e) => (
                    <option key={e.id_empresa} value={e.id_empresa}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="topbar__empresa-nombre">{empresaActiva.nombre}</span>
              )}
            </div>
          )}
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </AppShell>
  );
}
