export function formatDuracion(minutos: number | null | undefined): string {
  if (minutos == null) return "—";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatARS(n: number): string {
  return "$" + n.toLocaleString("es-AR");
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "p.m." : "a.m.";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}
