import { LayoutGrid, User, Briefcase, BarChart3, Building2, X } from 'lucide-react';
import { SECTIONS, SECTION_COLORS } from '../App.jsx';

const ICONS = {
  Personal: User,
  Consultoría: Briefcase,
  Dashboard: BarChart3,
  Fhc: Building2,
};

export default function Sidebar({ activeSection, setActiveSection, stats, open, onClose }) {
  return (
    <aside
      className={`
        fixed lg:relative inset-y-0 left-0 z-30
        w-64 flex flex-col bg-slate-900 border-r border-slate-800
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-lg tracking-tight">IPC Tareas</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {SECTIONS.map((section) => {
          const Icon = ICONS[section];
          const color = SECTION_COLORS[section];
          const stat = stats.find(s => s.section === section);
          const isActive = activeSection === section;

          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? `${color.light} ${color.text} ${color.border} border-l-2`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-l-2 border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{section}</span>
              {stat && stat.pending > 0 && (
                <span className={`
                  text-xs font-bold px-1.5 py-0.5 rounded-full
                  ${isActive ? `${color.bg} text-white` : 'bg-slate-700 text-slate-300'}
                `}>
                  {stat.pending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.section} className="bg-slate-800 rounded-lg p-2.5">
              <p className={`text-xs font-medium ${SECTION_COLORS[s.section]?.text}`}>{s.section}</p>
              <p className="text-lg font-bold text-white">{s.pending}</p>
              <p className="text-xs text-slate-500">pendientes</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
