import { SECTION_COLORS } from '../App.jsx';

export default function StatsView({ stats }) {
  const total = stats.reduce((a, s) => a + s.total, 0);
  const completed = stats.reduce((a, s) => a + s.completed, 0);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => {
          const color = SECTION_COLORS[s.section];
          const p = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
          return (
            <div key={s.section} className={`${color.light} border ${color.border} rounded-xl p-4`}>
              <p className={`text-sm font-medium ${color.text}`}>{s.section}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.pending}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.total} total · {p}% completado</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
