import type { SVGProps } from "react";

/**
 * Isotipo «Carga»: seis cajas estibadas en una F; la oscura, en la punta del
 * brazo largo, es la carga que se sigue. Inline (no <img>) para que la caja
 * oscura cambie a clara sobre fondos oscuros por CSS — ver `.isotipo__k`.
 * El naranja nunca cambia. Sin título es decorativo (va junto al nombre).
 */
export default function Isotipo({
  title,
  className = "",
  ...rest
}: { title?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="7 7 34 34"
      className={`isotipo ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      <rect className="isotipo__c" x="7" y="7" width="10" height="10" rx="2" style={{ "--i": 0 } as React.CSSProperties} />
      <rect className="isotipo__c" x="19" y="7" width="10" height="10" rx="2" style={{ "--i": 1 } as React.CSSProperties} />
      <rect className="isotipo__k" x="31" y="7" width="10" height="10" rx="2" style={{ "--i": 2 } as React.CSSProperties} />
      <rect className="isotipo__c" x="7" y="19" width="10" height="10" rx="2" style={{ "--i": 3 } as React.CSSProperties} />
      <rect className="isotipo__c" x="19" y="19" width="10" height="10" rx="2" style={{ "--i": 4 } as React.CSSProperties} />
      <rect className="isotipo__c" x="7" y="31" width="10" height="10" rx="2" style={{ "--i": 5 } as React.CSSProperties} />
    </svg>
  );
}
