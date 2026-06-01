const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, 'tasks.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    section TEXT NOT NULL DEFAULT 'Personal',
    priority TEXT DEFAULT 'media',
    due_date TEXT DEFAULT '',
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    order_index INTEGER DEFAULT 0
  )
`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// GET all tasks
app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY completed ASC, order_index ASC, created_at DESC').all();
  res.json(tasks);
});

// GET tasks by section
app.get('/api/tasks/section/:section', (req, res) => {
  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE section = ? ORDER BY completed ASC, order_index ASC, created_at DESC'
  ).all(req.params.section);
  res.json(tasks);
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, description = '', section = 'Personal', priority = 'media', due_date = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'El título es obligatorio' });

  const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM tasks WHERE section = ?').get(section);
  const order_index = (maxOrder?.max ?? -1) + 1;

  const stmt = db.prepare(
    'INSERT INTO tasks (title, description, section, priority, due_date, order_index) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(title.trim(), description, section, priority, due_date, order_index);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  const { title, description, section, priority, due_date } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  db.prepare(
    'UPDATE tasks SET title = ?, description = ?, section = ?, priority = ?, due_date = ? WHERE id = ?'
  ).run(
    title ?? task.title,
    description ?? task.description,
    section ?? task.section,
    priority ?? task.priority,
    due_date ?? task.due_date,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
});

// PATCH toggle complete
app.patch('/api/tasks/:id/complete', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(task.completed ? 0 : 1, req.params.id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
});

// PATCH move to section
app.patch('/api/tasks/:id/move', (req, res) => {
  const { section } = req.body;
  if (!section) return res.status(400).json({ error: 'Sección requerida' });

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM tasks WHERE section = ?').get(section);
  const order_index = (maxOrder?.max ?? -1) + 1;

  db.prepare('UPDATE tasks SET section = ?, order_index = ? WHERE id = ?').run(section, order_index, req.params.id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET stats for dashboard section
app.get('/api/stats', (req, res) => {
  const sections = ['Personal', 'Consultoría', 'Dashboard', 'Fhc'];
  const stats = sections.map(section => {
    const total = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE section = ?').get(section);
    const completed = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE section = ? AND completed = 1').get(section);
    const pending = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE section = ? AND completed = 0').get(section);
    return { section, total: total.count, completed: completed.count, pending: pending.count };
  });
  res.json(stats);
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✓ Acceso desde celular: busca la IP de tu computadora y abre http://[TU-IP]:${PORT}\n`);
});
