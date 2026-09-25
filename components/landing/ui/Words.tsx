import type { ElementType, ComponentPropsWithoutRef } from "react";

/**
 * Titular. Por defecto entra con un fundido corto (un mismo gesto en cada
 * sección se vuelve ruido). Con `split` parte en palabras con máscara: se
 * reserva para el momento autoral (el cierre).
 */
export default function Words({
  text,
  as,
  className = "",
  split = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  split?: boolean;
}) {
  const Tag = (as ?? "h2") as ElementType<ComponentPropsWithoutRef<"h2">>;
  if (!split) {
    return (
      <Tag className={`lp-plain ${className}`} data-reveal>
        {text}
      </Tag>
    );
  }
  return (
    <Tag className={`lp-words ${className}`} data-reveal aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span className="lp-w" key={i} aria-hidden="true">
          <span style={{ ["--i" as string]: i }}>{w}&nbsp;</span>
        </span>
      ))}
    </Tag>
  );
}
