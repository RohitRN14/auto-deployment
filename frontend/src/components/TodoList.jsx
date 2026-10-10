import TodoCard from './TodoCard';

const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'active',    label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function TodoList({
  todos,
  loading,
  error,
  filter,
  onFilterChange,
  onToggle,
  onUpdate,
  onDelete,
  onClearCompleted,
  stats,
}) {
  if (loading) {
    return (
      <div className="loading-container" aria-live="polite">
        <div className="spinner" role="status" aria-label="Loading tasks" />
        <p>Loading tasks…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Failed to load tasks</h3>
        <p style={{ color: 'var(--red)' }}>{error}</p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
          Make sure the backend is running and MongoDB is connected.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Task list">
      {/* Stats */}
      <div className="stats-bar" role="status" aria-live="polite">
        <span className="stat-chip total">
          📋 Total <span className="stat-count">{stats.total}</span>
        </span>
        <span className="stat-chip active">
          ⚡ Active <span className="stat-count">{stats.active}</span>
        </span>
        <span className="stat-chip done">
          ✅ Done <span className="stat-count">{stats.completed}</span>
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="filter-row" role="tablist" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            id={`filter-${f.id}`}
            role="tab"
            aria-selected={filter === f.id}
            className={`filter-tab ${filter === f.id ? 'active' : ''}`}
            onClick={() => onFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
        <div className="filter-spacer" />
        {stats.completed > 0 && (
          <button
            id="clear-completed-btn"
            className="btn btn-ghost clear-btn"
            onClick={onClearCompleted}
            title="Remove all completed tasks"
          >
            🧹 Clear Done
          </button>
        )}
      </div>

      {/* Task Cards */}
      {todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {filter === 'completed' ? '🏆' : filter === 'active' ? '🎉' : '🗒️'}
          </div>
          <h3>
            {filter === 'completed'
              ? 'No completed tasks yet'
              : filter === 'active'
              ? 'All tasks done!'
              : 'No tasks yet'}
          </h3>
          <p>
            {filter === 'completed'
              ? 'Complete some tasks to see them here.'
              : filter === 'active'
              ? 'Add a new task above to get started.'
              : 'Add your first task above and start being productive!'}
          </p>
        </div>
      ) : (
        <ul className="todo-list" role="list" aria-label="Task items">
          {todos.map((todo) => (
            <li key={todo._id} role="listitem">
              <TodoCard
                todo={todo}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
