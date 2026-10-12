import { useState, useEffect } from 'react';
import { authApi } from '../api/todoApi';
import toast from 'react-hot-toast';

export default function AdminUsersModal({ isOpen, onClose, onSelectUserFilter }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function loadUsers() {
      setLoading(true);
      try {
        const res = await authApi.getUsers();
        setUsers(res.data?.data || []);
      } catch (err) {
        toast.error(`Failed to load users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card admin-users-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="auth-modal-title">
            <span className="auth-logo-badge admin-badge-glow">🛡️</span>
            <div>
              <h3>Admin User Management</h3>
              <p className="auth-subtitle">
                System directory: registered accounts and task breakdown
              </p>
            </div>
          </div>
          <button
            className="btn-icon modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Stats summary row */}
        <div className="admin-summary-grid">
          <div className="admin-summary-card">
            <span className="summary-val">{users.length}</span>
            <span className="summary-lbl">Total Users</span>
          </div>
          <div className="admin-summary-card">
            <span className="summary-val">
              {users.filter((u) => u.role === 'admin').length}
            </span>
            <span className="summary-lbl">Admins</span>
          </div>
          <div className="admin-summary-card">
            <span className="summary-val">
              {users.reduce((acc, u) => acc + (u.totalTasks || 0), 0)}
            </span>
            <span className="summary-lbl">Total Tasks</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading registered accounts…</p>
            </div>
          ) : users.length === 0 ? (
            <p className="empty-text">No registered users found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Tasks</th>
                  <th>Completed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-avatar-circle">
                          {u.name?.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{u.name}</strong>
                          <small>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <span className="task-count-pill">{u.totalTasks}</span>
                    </td>
                    <td>
                      <span className="task-done-pill">{u.completedTasks}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-sm btn-outline"
                        onClick={() => {
                          onSelectUserFilter(u.id, u.name);
                          onClose();
                        }}
                      >
                        Filter Tasks
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
