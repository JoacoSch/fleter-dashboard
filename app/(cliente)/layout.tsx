"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PeriodoProvider } from "@/hooks/usePeriodo";
import { api } from "@/lib/api";
import { formatARS, fmtDate } from "@/lib/utils";
import { BarChart2, ClipboardList, Truck, FileText, User, LogOut } from "lucide-react";
import type { ReactNode } from "react";

interface RecentViaje {
  id_viaje: number;
  precio_real: number | null;
  precio_estimado: number;
  fecha_programada: string;
  creado_en: string;
  paradas: { orden: number; direccion: string }[];
}

const navItems = [
  { href: "/",             label: "Analytics",    Icon: BarChart2,     suffix: undefined, disabled: false },
  { href: "/viajes",       label: "Record",       Icon: ClipboardList, suffix: undefined, disabled: false },
  { href: "/viaje-activo", label: "Viaje activo", Icon: Truck,         suffix: "Próx.",   disabled: true },
  { href: "/facturacion",  label: "Facturación",  Icon: FileText,      suffix: "Próx.",   disabled: true },
];

function ClienteLayoutInner({ children }: { children: ReactNode }) {
  const { profile, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [recentViajes, setRecentViajes] = useState<RecentViaje[]>([]);
  const [totalViajes, setTotalViajes] = useState(0);
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

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [loading, profile, router]);

  useEffect(() => {
    if (!profile) return;
    api.get<RecentViaje[]>("/api/viajes/mis-viajes")
      .then((data) => {
        setTotalViajes(data.length);
        const sorted = [...data].sort((a, b) => {
          const da = new Date(a.fecha_programada ?? a.creado_en).getTime();
          const db = new Date(b.fecha_programada ?? b.creado_en).getTime();
          return db - da;
        });
        setRecentViajes(sorted.slice(0, 5));
      })
      .catch(() => {});
  }, [profile]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (loading || !profile) return null;

  return (
    <div className="app">
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand-header">
          <div className="brand-mark">F</div>
          <span className="brand-name">Fleter<em>.</em></span>
        </div>

        {/* CTA */}
        <Link href="/pedir-viaje" className="sidebar__new">
          <span style={{ fontSize: 18, lineHeight: 1, marginRight: 2 }}>+</span>
          Solicitar nuevo flete
        </Link>

        {/* Nav */}
        <nav className="sidebar__nav">
          {navItems.map(({ href, label, Icon, suffix, disabled }) => {
            const isActive = pathname === href;
            const showBadge = href === "/viajes" && totalViajes > 0;
            if (disabled) {
              return (
                <span key={href} className="nav-item nav-item--disabled">
                  <Icon size={16} className="nav-item__icon" />
                  <span className="nav-item__label">{label}</span>
                  <span className="nav-item__suffix">{suffix}</span>
                </span>
              );
            }
            return (
              <Link key={href} href={href} className={`nav-item${isActive ? " is-active" : ""}`}>
                <Icon size={16} className="nav-item__icon" />
                <span className="nav-item__label">{label}</span>
                {showBadge && <span className="nav-item__badge">{totalViajes}</span>}
                {suffix && !showBadge && <span className="nav-item__suffix">{suffix}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Viajes recientes */}
        {recentViajes.length > 0 && (
          <div className="sidebar__recent">
            <p className="sidebar__recent-title">Viajes recientes</p>
            {recentViajes.map((v) => {
              const destino =
                v.paradas.length > 0
                  ? v.paradas.reduce((max, p) => (p.orden > max.orden ? p : max), v.paradas[0])?.direccion
                  : "—";
              const precio = v.precio_real ?? v.precio_estimado;
              const fecha = fmtDate(v.fecha_programada ?? v.creado_en);
              return (
                <Link key={v.id_viaje} href={`/viajes/${v.id_viaje}`} className="sidebar__recent-item">
                  <span className="sidebar__recent-dest">{destino}</span>
                  <span className="sidebar__recent-meta">
                    {fecha} · {precio != null ? formatARS(precio) : "—"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* User card */}
        <div ref={menuRef} className="sidebar__profile-section">
          {menuOpen && (
            <div className="sidebar__user-menu">
              <Link
                href="/perfil"
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
            className="sidebar__user sidebar__user--btn"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div className="sidebar__user-avatar">
              {`${profile.nombre[0]}${profile.apellido[0]}`}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="sidebar__user-name">{profile.nombre} {profile.apellido}</p>
              <p className="sidebar__user-empresa">{profile.empresa}</p>
            </div>
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <p className="topbar__company">
            {loading ? "Cargando..." : (profile.empresa ?? "")}
          </p>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ClienteLayout({ children }: { children: ReactNode }) {
  return (
    <PeriodoProvider>
      <ClienteLayoutInner>{children}</ClienteLayoutInner>
    </PeriodoProvider>
  );
}
