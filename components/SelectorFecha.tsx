"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock } from "lucide-react";

/**
 * Selector de fecha propio — reemplaza a `<input type="date">` y
 * `<input type="datetime-local">` del navegador.
 *
 * Portado de `docs/design-system-v2.html` (sección 06). Exporta los dos
 * componentes del documento: `FechaPicker` (un día, con hora opcional en campo
 * aparte) y `RangoPicker` (dos días, con atajos). El tercer patrón,
 * `SelectorPeriodo`, ya existe como `components/PeriodoSelector.tsx` y usa a
 * `RangoPicker` para su modo personalizado.
 *
 * Por qué no los nativos: cada navegador dibuja el suyo, ninguno respeta los
 * tokens del sistema, el de Firefox no muestra el mes en español y ninguno
 * permite deshabilitar franjas horarias (la anticipación mínima del viaje).
 *
 * **Las fechas van y vienen como `YYYY-MM-DD`, nunca como `Date`.** Un `Date`
 * arrastra hora y zona, y `new Date("2026-09-17")` se interpreta en UTC: en
 * Argentina eso es el 16 a las 21:00, así que el calendario marcaría el día
 * anterior. Con el string plano el día es el día.
 */

const DOW = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** `Date` local → `YYYY-MM-DD`. No usa `toISOString`, que convierte a UTC. */
export function aISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** `YYYY-MM-DD` → `Date` local a medianoche. */
export function deISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function hoyISO(): string {
  return aISO(new Date());
}

/** Suma días a una fecha ISO sin pasar por milisegundos (evita el salto de DST). */
function sumarDias(iso: string, dias: number): string {
  const d = deISO(iso);
  d.setDate(d.getDate() + dias);
  return aISO(d);
}

/** "jue 17 sep" */
export function fmtFecha(iso: string): string {
  return deISO(iso)
    .toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\./g, "")
    .replace(",", "");
}

/** "2 – 15 sep" si comparten mes; "2 sep – 3 oct" si no. */
export function fmtRango(desde: string, hasta: string): string {
  if (!desde || !hasta) return "";
  const a = deISO(desde);
  const b = deISO(hasta);
  const mismoAnio = a.getFullYear() === b.getFullYear();
  const mismoMes = mismoAnio && a.getMonth() === b.getMonth();
  const mes = (d: Date) => d.toLocaleDateString("es-AR", { month: "short" }).replace(".", "");
  const anio = (d: Date) => (mismoAnio && d.getFullYear() === new Date().getFullYear() ? "" : ` ${d.getFullYear()}`);
  if (mismoMes) return `${a.getDate()} – ${b.getDate()} ${mes(b)}${anio(b)}`;
  return `${a.getDate()} ${mes(a)}${anio(a)} – ${b.getDate()} ${mes(b)}${anio(b)}`;
}

/** "septiembre 2026" — `text-transform: capitalize` dejaría "Septiembre De 2026". */
export function fmtMes(anio: number, mes: number): string {
  const s = new Date(anio, mes, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Cierra al hacer click afuera y con Escape; devuelve el foco al disparador. */
function useCerrarAfuera(
  abierto: boolean,
  cerrar: () => void,
  ref: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!abierto) return;
    function fuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cerrar();
    }
    function tecla(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      cerrar();
      ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto, cerrar, ref]);
}

// ── Calendario ──────────────────────────────────────────────────────────────

interface CalendarioProps {
  /** Mes visible, como `YYYY-MM-01`. */
  mes: string;
  onMes: (mes: string) => void;
  /** Clases de estado de cada día: is-selected, is-in-range, is-range-start… */
  estado: (iso: string) => string;
  onElegir: (iso: string) => void;
  min?: string;
  max?: string;
  /** `[desde, hasta]` para el desplegable de años. */
  anios?: [number, number];
  /** El calendario de la derecha del rango no navega solo: lo arrastra el otro. */
  navegable?: boolean;
}

function Calendario({
  mes,
  onMes,
  estado,
  onElegir,
  min,
  max,
  anios,
  navegable = true,
}: CalendarioProps) {
  const [verAnios, setVerAnios] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const primero = deISO(mes);
  const anio = primero.getFullYear();
  const numMes = primero.getMonth();

  /**
   * El día que recibe el foco del teclado. Sólo uno de los 42 botones es
   * tabulable (roving tabindex): si no, tabular por un calendario serían 42
   * paradas antes de llegar al botón siguiente.
   */
  const [foco, setFoco] = useState<string | null>(null);
  const moviendo = useRef(false);

  // Mueve el foco real del navegador al día que eligieron las flechas. No hay
  // setState acá: sólo se enfoca el nodo que ya corresponde.
  useEffect(() => {
    if (!moviendo.current || !foco) return;
    moviendo.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${foco}"]`)?.focus();
  }, [foco]);

  const dias = useMemo(() => {
    // Lunes primero: getDay() da 0 para domingo, que en esta grilla es el 7º.
    const arranque = (deISO(mes).getDay() + 6) % 7;
    // 42 celdas fijas (6 semanas): si el alto cambiara según el mes, el
    // popover saltaría al navegar.
    return Array.from({ length: 42 }, (_, i) => sumarDias(mes, i - arranque));
  }, [mes]);

  const fueraDeRango = useCallback(
    (iso: string) => (min != null && iso < min) || (max != null && iso > max),
    [min, max],
  );

  const mesAnterior = aISO(new Date(anio, numMes - 1, 1));
  const mesSiguiente = aISO(new Date(anio, numMes + 1, 1));
  // Se puede retroceder si al menos un día del mes anterior está permitido.
  const puedeAtras = min == null || sumarDias(mesSiguiente, -1) > min;
  const puedeAdelante = max == null || mesSiguiente <= max;

  function teclas(e: React.KeyboardEvent<HTMLDivElement>) {
    const base = foco ?? dias.find((d) => estado(d).includes("is-selected")) ?? hoyISO();
    const salto: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      PageUp: -28,
      PageDown: 28,
    };
    let destino: string | null = null;
    if (e.key in salto) destino = sumarDias(base, salto[e.key]);
    else if (e.key === "Home") destino = aISO(new Date(anio, numMes, 1));
    else if (e.key === "End") destino = aISO(new Date(anio, numMes + 1, 0));
    if (!destino) return;
    e.preventDefault();
    if (fueraDeRango(destino)) return;
    // Si el día cae en otro mes, el calendario lo sigue.
    if (destino.slice(0, 7) !== mes.slice(0, 7)) onMes(`${destino.slice(0, 7)}-01`);
    moviendo.current = true;
    setFoco(destino);
  }

  const hoy = hoyISO();
  const tabulable = foco ?? dias.find((d) => estado(d).includes("is-selected")) ?? hoy;

  return (
    <div className="cal" ref={ref}>
      <div className="cal__head">
        <button
          type="button"
          className="cal__nav"
          onClick={() => onMes(mesAnterior)}
          disabled={!navegable || !puedeAtras}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="cal__title">
          <button
            type="button"
            className={`cal__title-btn${verAnios ? " is-open" : ""}`}
            onClick={() => setVerAnios((v) => !v)}
            aria-expanded={verAnios}
            disabled={!navegable}
          >
            {fmtMes(anio, numMes)} <ChevronDown size={14} />
          </button>
        </div>
        <button
          type="button"
          className="cal__nav"
          onClick={() => onMes(mesSiguiente)}
          disabled={!navegable || !puedeAdelante}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {verAnios ? (
        <div className="cal__years">
          {(() => {
            const [desde, hasta] = anios ?? [anio - 5, anio + 5];
            return Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i).map((a) => (
              <button
                key={a}
                type="button"
                className={`cal__year${a === anio ? " is-selected" : ""}`}
                onClick={() => {
                  onMes(aISO(new Date(a, numMes, 1)));
                  setVerAnios(false);
                }}
              >
                {a}
              </button>
            ));
          })()}
        </div>
      ) : (
        <div className="cal__grid" ref={gridRef} role="grid" onKeyDown={teclas}>
          {DOW.map((d) => (
            <div key={d} className="cal__dow" role="columnheader" aria-label={d}>
              {d}
            </div>
          ))}
          {dias.map((iso) => {
            const otroMes = iso.slice(0, 7) !== mes.slice(0, 7);
            const clases = [
              "cal__day",
              otroMes ? "is-outside" : "",
              iso === hoy ? "is-today" : "",
              estado(iso),
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={iso}
                type="button"
                data-iso={iso}
                className={clases}
                disabled={fueraDeRango(iso)}
                tabIndex={iso === tabulable ? 0 : -1}
                aria-label={fmtFecha(iso)}
                aria-current={iso === hoy ? "date" : undefined}
                onFocus={() => setFoco(iso)}
                onClick={() => onElegir(iso)}
              >
                {deISO(iso).getDate()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── FechaPicker ─────────────────────────────────────────────────────────────

export interface FechaPickerProps {
  /** `YYYY-MM-DD`, o "" si todavía no eligieron. */
  value: string;
  /** `HH:MM` en 24 h. Sólo se usa con `conHora`. */
  hora?: string;
  onChange: (fecha: string, hora: string) => void;
  min?: string;
  max?: string;
  conHora?: boolean;
  /** Minutos de anticipación mínima desde ahora (bloquea las franjas pasadas). */
  anticipacionMinutos?: number;
  pasoMinutos?: number;
  size?: "md" | "lg";
  placeholder?: string;
  hint?: string;
  error?: string;
  anios?: [number, number];
  id?: string;
  required?: boolean;
}

export function FechaPicker({
  value,
  hora = "",
  onChange,
  min,
  max,
  conHora = false,
  anticipacionMinutos = 0,
  pasoMinutos = 15,
  size = "md",
  placeholder = "Elegí una fecha",
  hint,
  error,
  anios,
  id,
  required,
}: FechaPickerProps) {
  const [abierto, setAbierto] = useState(false);
  const [horaAbierta, setHoraAbierta] = useState(false);
  const [mes, setMes] = useState(() => `${(value || hoyISO()).slice(0, 7)}-01`);
  const ref = useRef<HTMLDivElement>(null);
  const horaRef = useRef<HTMLDivElement>(null);

  const cerrar = useCallback(() => setAbierto(false), []);
  const cerrarHora = useCallback(() => setHoraAbierta(false), []);
  useCerrarAfuera(abierto, cerrar, ref);
  useCerrarAfuera(horaAbierta, cerrarHora, horaRef);

  /**
   * El instante más temprano aceptable, con la anticipación ya sumada.
   *
   * "Ahora" se fija al montar: leer el reloj en cada render rompe la pureza y,
   * peor, iría corriendo el mínimo mientras el usuario mira la lista — una
   * franja elegible al abrir podría estar deshabilitada al hacerle click.
   */
  const [ahora] = useState(() => Date.now());
  const minimo = useMemo(() => {
    const d = new Date(ahora + anticipacionMinutos * 60_000);
    return { iso: aISO(d), minutos: d.getHours() * 60 + d.getMinutes() };
  }, [ahora, anticipacionMinutos]);

  const minEfectivo = anticipacionMinutos > 0 ? (min && min > minimo.iso ? min : minimo.iso) : min;

  const franjas = useMemo(() => {
    if (!conHora) return [];
    const out: { hhmm: string; deshabilitada: boolean }[] = [];
    // Sólo el día mínimo tiene franjas vencidas; los posteriores están enteros.
    const recorta = value === minimo.iso && anticipacionMinutos >= 0;
    for (let m = 0; m < 24 * 60; m += pasoMinutos) {
      out.push({
        hhmm: `${pad(Math.floor(m / 60))}:${pad(m % 60)}`,
        deshabilitada: recorta && m < minimo.minutos,
      });
    }
    return out;
  }, [conHora, pasoMinutos, value, minimo, anticipacionMinutos]);

  function elegirDia(iso: string) {
    onChange(iso, hora);
    setAbierto(false);
    // La hora se abre sola: sin esto el campo queda a medias y no se nota.
    if (conHora && !hora) setHoraAbierta(true);
  }

  const claseTrigger = [
    "fecha__trigger",
    abierto ? "is-open" : "",
    error ? "is-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`fecha${size === "lg" ? " fecha--lg" : ""}`} ref={ref}>
      <div className={conHora ? "fecha__row" : undefined}>
        <button
          type="button"
          id={id}
          className={claseTrigger}
          aria-haspopup="dialog"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
        >
          <Calendar size={16} />
          <span className={`fecha__value${value ? "" : " is-placeholder"}`}>
            {value ? fmtFecha(value) : placeholder}
          </span>
        </button>

        {conHora && (
          <div className="hora" ref={horaRef}>
            <button
              type="button"
              className={`hora__trigger${horaAbierta ? " is-open" : ""}${error ? " is-invalid" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={horaAbierta}
              aria-label="Hora"
              onClick={() => setHoraAbierta((v) => !v)}
            >
              <Clock size={16} />
              <span className={`hora__value${hora ? "" : " is-placeholder"}`}>{hora || "--:--"}</span>
            </button>
            {horaAbierta && (
              <div className="hora__pop hora__pop--right" role="listbox" aria-label="Hora">
                {franjas.map(({ hhmm, deshabilitada }) => (
                  <button
                    key={hhmm}
                    type="button"
                    role="option"
                    aria-selected={hhmm === hora}
                    className={`hora__slot${hhmm === hora ? " is-selected" : ""}`}
                    disabled={deshabilitada}
                    onClick={() => {
                      onChange(value, hhmm);
                      setHoraAbierta(false);
                    }}
                  >
                    {hhmm}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/*
        Espejo del valor para la validación nativa del formulario. El disparador
        es un <button> y un botón no puede ser `required`, así que sin esto el
        registro del conductor dejaba pasar de paso con el vencimiento vacío
        (ese formulario avanza apoyándose en la validación del navegador).
        No lleva `readOnly` ni `hidden`: los dos excluyen al campo de la
        validación, que es exactamente lo que acá hace falta que ocurra.
      */}
      {required && (
        <input
          className="fecha__nativo"
          tabIndex={-1}
          aria-hidden="true"
          required
          value={conHora ? (value && hora ? `${value}T${hora}` : "") : value}
          onChange={() => {}}
          onFocus={() => setAbierto(true)}
        />
      )}

      {abierto && (
        <div className="fecha__pop" role="dialog" aria-label="Elegir fecha">
          <Calendario
            mes={mes}
            onMes={setMes}
            estado={(iso) => (iso === value ? "is-selected" : "")}
            onElegir={elegirDia}
            min={minEfectivo}
            max={max}
            anios={anios}
          />
          <div className="fecha__foot">
            <span className={`fecha__hint${error ? " fecha__hint--err" : ""}`}>
              {error ?? hint ?? ""}
            </span>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              disabled={minEfectivo != null && hoyISO() < minEfectivo}
              onClick={() => elegirDia(hoyISO())}
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RangoPicker ─────────────────────────────────────────────────────────────

export interface Atajo {
  label: string;
  /** Devuelve `[desde, hasta]` en ISO. */
  rango: () => [string, string];
}

/** Los cinco del documento. Se pasan `[]` para ocultar la columna. */
export const ATAJOS: Atajo[] = [
  { label: "Hoy", rango: () => [hoyISO(), hoyISO()] },
  { label: "Últimos 7 días", rango: () => [sumarDias(hoyISO(), -6), hoyISO()] },
  { label: "Últimos 30 días", rango: () => [sumarDias(hoyISO(), -29), hoyISO()] },
  {
    label: "Este mes",
    rango: () => {
      const h = new Date();
      return [aISO(new Date(h.getFullYear(), h.getMonth(), 1)), hoyISO()];
    },
  },
  {
    label: "Mes pasado",
    rango: () => {
      const h = new Date();
      return [
        aISO(new Date(h.getFullYear(), h.getMonth() - 1, 1)),
        aISO(new Date(h.getFullYear(), h.getMonth(), 0)),
      ];
    },
  },
];

export interface RangoPickerProps {
  desde: string;
  hasta: string;
  onChange: (r: { desde: string; hasta: string; atajo?: string }) => void;
  min?: string;
  max?: string;
  atajos?: Atajo[];
  size?: "md" | "lg";
  placeholder?: string;
  alinear?: "left" | "right";
  id?: string;
  /** Id del rótulo visible. El disparador es un botón: sin esto se anuncia
      con el rango como único nombre y no se sabe de qué campo es. */
  etiquetaId?: string;
}

export function RangoPicker({
  desde,
  hasta,
  onChange,
  min,
  max,
  atajos = ATAJOS,
  size = "md",
  placeholder = "Elegí un período",
  alinear = "left",
  id,
  etiquetaId,
}: RangoPickerProps) {
  const [abierto, setAbierto] = useState(false);
  const [mes, setMes] = useState(() => `${(desde || hoyISO()).slice(0, 7)}-01`);
  /** Primer click del rango nuevo; mientras vale, el segundo click cierra. */
  const [borrador, setBorrador] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setBorrador(null);
  }, []);
  useCerrarAfuera(abierto, cerrar, ref);

  const mesDerecha = useMemo(() => {
    const d = deISO(mes);
    return aISO(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, [mes]);

  function elegir(iso: string) {
    if (borrador == null) {
      setBorrador(iso);
      return;
    }
    // Clickear al revés no es un error: se ordena y listo.
    const [a, b] = borrador <= iso ? [borrador, iso] : [iso, borrador];
    setBorrador(null);
    setAbierto(false);
    onChange({ desde: a, hasta: b });
  }

  /** Extremos que se están mostrando: el borrador manda sobre lo aplicado. */
  const [ini, fin] = borrador != null ? [borrador, borrador] : [desde, hasta];

  const estado = useCallback(
    (iso: string) => {
      if (!ini) return "";
      if (iso === ini && iso === fin) return "is-range-start is-range-end";
      if (iso === ini) return "is-range-start";
      if (iso === fin) return "is-range-end";
      if (fin && iso > ini && iso < fin) return "is-in-range";
      return "";
    },
    [ini, fin],
  );

  const atajoActivo = useMemo(() => {
    if (!desde || !hasta) return null;
    return atajos.find((a) => {
      const [x, y] = a.rango();
      return x === desde && y === hasta;
    })?.label ?? null;
  }, [atajos, desde, hasta]);

  return (
    <div className={`rango${size === "lg" ? " rango--lg" : ""}`} ref={ref}>
      <button
        type="button"
        id={id}
        className={`rango__trigger${abierto ? " is-open" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-labelledby={etiquetaId ? `${etiquetaId} ${id ?? ""}`.trim() : undefined}
        onClick={() => setAbierto((v) => !v)}
      >
        <Calendar size={16} />
        <span className={`rango__value${desde && hasta ? "" : " is-placeholder"}`}>
          {desde && hasta ? fmtRango(desde, hasta) : placeholder}
        </span>
      </button>

      {abierto && (
        <div
          className={`rango__pop${alinear === "right" ? " rango__pop--right" : ""}`}
          role="dialog"
          aria-label="Elegir período"
        >
          {atajos.length > 0 && (
            <div className="rango__side">
              {atajos.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className={`rango__atajo${atajoActivo === a.label ? " is-active" : ""}`}
                  onClick={() => {
                    const [x, y] = a.rango();
                    setBorrador(null);
                    setAbierto(false);
                    onChange({ desde: x, hasta: y, atajo: a.label });
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <div className="rango__main">
            <div className="rango__cals">
              <Calendario
                mes={mes}
                onMes={setMes}
                estado={estado}
                onElegir={elegir}
                min={min}
                max={max}
              />
              {/* El segundo mes es de sólo lectura: navega el de la izquierda.
                  Debajo de 1080 px el CSS lo esconde. */}
              <Calendario
                mes={mesDerecha}
                onMes={setMes}
                estado={estado}
                onElegir={elegir}
                min={min}
                max={max}
                navegable={false}
              />
            </div>
            <div className="rango__fields">
              <div className={`rango__field${borrador == null ? " is-active" : ""}`}>
                <span>Desde</span>
                <strong>{borrador ?? desde ?? "—"}</strong>
              </div>
              <div className={`rango__field${borrador != null ? " is-active" : ""}`}>
                <span>Hasta</span>
                <strong>{borrador != null ? "—" : hasta || "—"}</strong>
              </div>
            </div>
            <div className="rango__foot">
              <span className="fecha__hint">
                {borrador != null ? "Elegí el día de cierre." : "Elegí el día de inicio."}
              </span>
              <button type="button" className="btn btn--sm btn--ghost" onClick={cerrar}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
