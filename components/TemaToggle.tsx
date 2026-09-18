"use client";

import { Moon, Sun } from "lucide-react";

/** Misma clave que lee el script de arranque en app/layout.tsx. */
export const CLAVE_TEMA = "fleter_tema";

/**
 * Conmutador de tema, en el menú de usuario de los cuatro paneles.
 *
 * No tiene estado de React, por la misma razón que el ancho de la sidebar en
 * AppShell: el tema vive en `data-theme` sobre <html>, lo pone el script de
 * arranque antes del primer pintado y este botón sólo lo cambia.
 *
 * Los dos rótulos están siempre en el DOM y el CSS muestra el que corresponde.
 * Si en cambio el rótulo saliera de un estado leído del cliente, el servidor
 * renderizaría "Tema oscuro" y el cliente podría renderizar "Tema claro": eso
 * es un error de hidratación y React descarta y regenera el árbol entero.
 * `display: none` además saca al rótulo oculto del árbol de accesibilidad, así
 * que el botón se anuncia con un solo nombre, el correcto.
 */
export default function TemaToggle() {
  function alternar() {
    const raiz = document.documentElement;
    const nuevo = raiz.dataset.theme === "dark" ? "light" : "dark";
    raiz.dataset.theme = nuevo;
    try {
      localStorage.setItem(CLAVE_TEMA, nuevo);
    } catch {
      // Sin permiso de storage el tema vale para esta pestaña y nada más.
    }
  }

  return (
    <button type="button" className="sidebar__user-menu-item tema-toggle" onClick={alternar}>
      <span className="tema-toggle__a-oscuro">
        <Moon size={14} />
        Tema oscuro
      </span>
      <span className="tema-toggle__a-claro">
        <Sun size={14} />
        Tema claro
      </span>
    </button>
  );
}
