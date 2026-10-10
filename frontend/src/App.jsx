import { useState } from 'react';
import AddTodoForm from './components/AddTodoForm';
import TodoList from './components/TodoList';
import { useTodos } from './hooks/useTodos';

export default function App() {
  const [filter, setFilter] = useState('all');

  const {
    todos,
    loading,
    error,
    stats,
    createTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    deleteCompleted,
  } = useTodos(filter);

  return (
    <div className="app">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-logo">
          <div className="logo-icon" aria-hidden="true">⚡</div>
          <h1>TaskFlow</h1>
        </div>
        <p className="header-subtitle">
          MERN Stack · Powered by React, Express &amp; MongoDB
        </p>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="main">
        <AddTodoForm onAdd={createTodo} />

        <TodoList
          todos={todos}
          loading={loading}
          error={error}
          filter={filter}
          onFilterChange={setFilter}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          onClearCompleted={deleteCompleted}
          stats={stats}
        />
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <p>
          Built with ❤️ · MERN Stack ·{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
