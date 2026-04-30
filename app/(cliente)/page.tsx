export default function DashboardPage() {
  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2>Dashboard</h2>
        <p>Resumen de actividad — próximamente F1-2</p>
      </div>

      <div className="grid-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card span-3">
            <p className="metric__label">Cargando</p>
            <p className="metric__value" style={{ color: "var(--ink-4)", fontSize: 28 }}>—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
