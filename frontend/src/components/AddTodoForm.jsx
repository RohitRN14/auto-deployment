import { useState } from 'react';

const PRIORITIES = [
  { value: 'low',    label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high',   label: '🔴 High' },
];

export default function AddTodoForm({ onAdd }) {
  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [priority, setPriority]     = useState('medium');
  const [dueDate, setDueDate]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
    };

    const success = await onAdd(payload);
    if (success) {
      setTitle('');
      setDesc('');
      setPriority('medium');
      setDueDate('');
    }
    setSubmitting(false);
  };

  return (
    <form className="add-form-card" onSubmit={handleSubmit} aria-label="Add new task">
      {/* Title + Priority row */}
      <div className="add-form-row">
        <input
          id="todo-title-input"
          className="input-field"
          type="text"
          placeholder="✏️  What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          autoComplete="off"
        />
        <select
          id="todo-priority-select"
          className="select-field"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="Priority"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Description + Due Date + Submit row */}
      <div className="add-form-extras">
        <textarea
          id="todo-desc-input"
          className="textarea-field"
          placeholder="Optional description…"
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          maxLength={1000}
          rows={2}
          aria-label="Description"
        />
        <input
          id="todo-due-input"
          className="input-field"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date"
          style={{ minWidth: '140px', flex: 'unset' }}
        />
        <button
          id="todo-add-btn"
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !title.trim()}
          style={{ alignSelf: 'flex-end', height: '40px' }}
        >
          {submitting ? '…' : '+ Add'}
        </button>
      </div>
    </form>
  );
}
