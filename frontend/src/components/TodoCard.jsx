import { useState } from 'react';

const PRIORITY_LABELS = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };
const PRIORITIES = ['low', 'medium', 'high'];

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TodoCard({ todo, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing]     = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc]   = useState(todo.description || '');
  const [editPrio, setEditPrio]   = useState(todo.priority);
  const [saving, setSaving]       = useState(false);

  const handleToggle = () => onToggle(todo._id);
  const handleDelete = () => onDelete(todo._id);

  const startEdit = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setEditPrio(todo.priority);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setSaving(true);
    const success = await onUpdate(todo._id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPrio,
    });
    setSaving(false);
    if (success) setEditing(false);
  };

  return (
    <article
      className={`todo-card priority-${todo.priority} ${todo.completed ? 'completed' : ''}`}
      aria-label={`Task: ${todo.title}`}
    >
      <div className="todo-card-body">
        {/* Checkbox */}
        <div className="checkbox-wrapper">
          <button
            id={`toggle-${todo._id}`}
            className={`checkbox-custom ${todo.completed ? 'checked' : ''}`}
            onClick={handleToggle}
            aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
            aria-pressed={todo.completed}
            type="button"
          />
        </div>

        {/* Content */}
        <div className="todo-content">
          {editing ? (
            <form className="edit-form" onSubmit={handleSave}>
              <input
                className="input-field"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
                maxLength={200}
                required
                autoFocus
              />
              <div className="edit-form-row">
                <textarea
                  className="textarea-field"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  style={{ flex: 1 }}
                />
                <select
                  className="select-field"
                  value={editPrio}
                  onChange={(e) => setEditPrio(e.target.value)}
                  aria-label="Priority"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <div className="edit-actions">
                <button type="button" className="btn btn-ghost" onClick={cancelEdit} style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !editTitle.trim()}
                  style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="todo-title">{todo.title}</p>
              {todo.description && (
                <p className="todo-description">{todo.description}</p>
              )}
              <div className="todo-meta">
                <span className={`priority-badge ${todo.priority}`}>
                  {PRIORITY_LABELS[todo.priority]}
                </span>
                {todo.dueDate && (
                  <span className="todo-date">📅 {formatDate(todo.dueDate)}</span>
                )}
                <span className="todo-date" style={{ marginLeft: 'auto' }}>
                  {new Date(todo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="todo-actions">
            <button
              id={`edit-${todo._id}`}
              type="button"
              className="action-btn edit-btn"
              onClick={startEdit}
              aria-label="Edit task"
              title="Edit"
            >
              ✏️
            </button>
            <button
              id={`delete-${todo._id}`}
              type="button"
              className="action-btn delete-btn"
              onClick={handleDelete}
              aria-label="Delete task"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
