import { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Pencil, MoveRight, Calendar, ChevronDown } from 'lucide-react';
import { SECTIONS, SECTION_COLORS } from '../App.jsx';

const PRIORITY_STYLES = {
  alta: 'bg-red-500/20 text-red-400 border border-red-500/30',
  media: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  baja: 'bg-slate-700 text-slate-400 border border-slate-600',
};

export default function TaskCard({ task, onToggle, onMove, onDelete, onEdit }) {
  const [showMove, setShowMove] = useState(false);

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();

  return (
    <div className={`
      group relative bg-slate-900 border rounded-xl p-4 transition-all duration-150
      ${task.completed ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-slate-700'}
    `}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-emerald-400 transition-colors"
        >
          {task.completed
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            : <Circle className="w-5 h-5" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm leading-snug ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.priority !== 'media' || task.priority === 'alta' ? (
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${PRIORITY_STYLES[task.priority]}`}>
                {task.priority}
              </span>
            ) : null}
            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                <Calendar className="w-3 h-3" />
                {new Date(task.due_date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMove(!showMove)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700"
            >
              <MoveRight className="w-3.5 h-3.5" />
            </button>
            {showMove && (
              <div className="absolute right-0 top-8 z-10 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-36">
                {SECTIONS.filter(s => s !== task.section).map(s => (
                  <button
                    key={s}
                    onClick={() => { onMove(task.id, s); setShowMove(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <span className={`w-2 h-2 rounded-full ${SECTION_COLORS[s]?.bg}`} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Close move dropdown on outside click */}
      {showMove && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMove(false)} />
      )}
    </div>
  );
}
