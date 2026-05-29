import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TaskBoard from './components/TaskBoard.jsx';
import StatsView from './components/StatsView.jsx';
import TaskModal from './components/TaskModal.jsx';

const API = '/api';

export const SECTIONS = ['Personal', 'Consultoría', 'Dashboard', 'Fhc'];

export const SECTION_COLORS = {
  Personal: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-400', light: 'bg-indigo-500/10' },
  Consultoría: { bg: 'bg-sky-500', border: 'border-sky-500', text: 'text-sky-400', light: 'bg-sky-500/10' },
  Dashboard: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', light: 'bg-emerald-500/10' },
  Fhc: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400', light: 'bg-amber-500/10' },
};

export default function App() {
  const [activeSection, setActiveSection] = useState('Personal');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`${API}/tasks`);
    const data = await res.json();
    setTasks(data);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();
    setStats(data);
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  const sectionTasks = tasks.filter(t => t.section === activeSection);

  const handleCreate = async (data) => {
    await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    fetchTasks();
    fetchStats();
  };

  const handleUpdate = async (id, data) => {
    await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingTask(null);
    fetchTasks();
    fetchStats();
  };

  const handleToggle = async (id) => {
    await fetch(`${API}/tasks/${id}/complete`, { method: 'PATCH' });
    fetchTasks();
    fetchStats();
  };

  const handleMove = async (id, section) => {
    await fetch(`${API}/tasks/${id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section }),
    });
    fetchTasks();
    fetchStats();
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
    fetchStats();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeSection={activeSection}
        setActiveSection={(s) => { setActiveSection(s); setSidebarOpen(false); }}
        stats={stats}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TaskBoard
          section={activeSection}
          tasks={sectionTasks}
          onToggle={handleToggle}
          onMove={handleMove}
          onDelete={handleDelete}
          onEdit={(task) => setEditingTask(task)}
          onAdd={() => setShowModal(true)}
          onMenuOpen={() => setSidebarOpen(true)}
          stats={stats}
        />
      </main>

      {(showModal || editingTask) && (
        <TaskModal
          task={editingTask}
          defaultSection={activeSection}
          onSubmit={editingTask ? (data) => handleUpdate(editingTask.id, data) : handleCreate}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
