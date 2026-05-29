import { Plus, Menu, CheckCircle2, Circle } from 'lucide-react';
import { SECTION_COLORS } from '../App.jsx';
import TaskCard from './TaskCard.jsx';

export default function TaskBoard({ section, tasks, onToggle, onMove, onDelete, onEdit, onAdd, onMenuOpen }) {
  const color = SECTION_COLORS[section];
  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-slate-800`}>
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
        <h1 className="text-xl font-bold flex-1">{section}</h1>
        <span className="text-sm text-slate-500">{pending.length} pendiente{pending.length !== 1 ? 's' : ''}</span>
        <button
          onClick={onAdd}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white ${color.bg} hover:opacity-90 transition-opacity`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva tarea</span>
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-2">
        {pending.length === 0 && completed.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600">
            <Circle className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No hay tareas todavía</p>
            <button
              onClick={onAdd}
              className={`mt-3 text-sm ${color.text} hover:underline`}
            >
              Agregar primera tarea
            </button>
          </div>
        )}

        {pending.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onMove={onMove}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}

        {completed.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-2 pb-1">
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                Completadas ({completed.length})
              </span>
            </div>
            {completed.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onMove={onMove}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
