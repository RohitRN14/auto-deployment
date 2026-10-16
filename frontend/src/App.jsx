import { useState, useEffect } from 'react';
import AddTodoForm from './components/AddTodoForm';
import TodoList from './components/TodoList';
import AuthModal from './components/AuthModal';
import AdminUsersModal from './components/AdminUsersModal';
import { useTodos } from './hooks/useTodos';
import { useAuth } from './context/AuthContext';
import { authApi } from './api/todoApi';

export default function App() {
  const [filter, setFilter] = useState('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminUsersModalOpen, setAdminUsersModalOpen] = useState(false);

  // Admin view states: 'all' or 'mine'
  const [adminScope, setAdminScope] = useState('all');
  const [userFilter, setUserFilter] = useState(null);
  const [userFilterName, setUserFilterName] = useState(null);

  // Users directory for Admin allotment
  const [users, setUsers] = useState([]);
  const [assignedUser, setAssignedUser] = useState('');

  const { user, isAdmin, logout, demoLogin } = useAuth();

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
  } = useTodos(filter, adminScope, userFilter);

  // Fetch registered users when admin logs in
  useEffect(() => {
    if (!isAdmin) {
      setUsers([]);
      setAssignedUser('');
      return;
    }

    async function loadUsers() {
      try {
        const res = await authApi.getUsers();
        setUsers(res.data?.data || []);
      } catch (err) {
        console.warn('Could not load users directory for admin allotment:', err.message);
      }
    }

    loadUsers();
  }, [isAdmin]);

  const handleSelectUserFilter = (userId, userName) => {
    setUserFilter(userId);
    setUserFilterName(userName);
  };

  const handleClearUserFilter = () => {
    setUserFilter(null);
    setUserFilterName(null);
  };

  const handleAssignToUser = (userId, userName) => {
    setAssignedUser(userId);
    const input = document.getElementById('todo-title-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="app">
      {/* ── Header & Top Navigation ────────────────────────────────────────── */}
      <header className="header">
        <div className="header-nav-bar">
          <div className="header-brand">
            <div className="logo-icon" aria-hidden="true">⚡</div>
            <div className="brand-text">
              <h1>TaskFlow</h1>
              <span className="brand-tag">MERN · DevOps</span>
            </div>
          </div>

          <div className="header-auth-actions">
            {user ? (
              <div className="user-profile-menu">
                <div className="user-info-chip">
                  <span className={`role-pill role-pill-${user.role}`}>
                    {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                  </span>
                  <span className="user-name-display" title={user.email}>
                    {user.name}
                  </span>
                </div>

                {isAdmin && (
                  <div className="admin-quick-controls">
                    <button
                      type="button"
                      className={`btn-scope-toggle ${adminScope === 'all' && !userFilter ? 'active' : ''}`}
                      onClick={() => {
                        setAdminScope((prev) => (prev === 'all' ? 'mine' : 'all'));
                        handleClearUserFilter();
                      }}
                      title="Toggle between All Tasks and My Tasks"
                    >
                      {adminScope === 'all' && !userFilter ? '🌐 All Tasks' : '📁 My Tasks'}
                    </button>
                    <button
                      type="button"
                      className="btn-admin-manage"
                      onClick={() => setAdminUsersModalOpen(true)}
                      title="Open user directory and analytics"
                    >
                      👥 Users ({users.length})
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-auth-logout"
                  onClick={logout}
                  title="Sign out of account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="guest-auth-actions">
                <div className="guest-demo-chips">
                  <button
                    type="button"
                    className="chip-demo chip-admin"
                    onClick={() => demoLogin('admin')}
                    title="1-Click Demo Login as Administrator"
                  >
                    🛡️ Demo Admin
                  </button>
                  <button
                    type="button"
                    className="chip-demo chip-user"
                    onClick={() => demoLogin('user')}
                    title="1-Click Demo Login as Standard User"
                  >
                    👤 Demo User
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-auth-signin"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Admin Filter Indicator */}
        {userFilter && (
          <div className="admin-filter-banner" role="status">
            <span>
              🛡️ Filtering tasks by user: <strong>{userFilterName}</strong>
            </span>
            <button
              type="button"
              className="btn-clear-user-filter"
              onClick={handleClearUserFilter}
            >
              Clear Filter ✕
            </button>
          </div>
        )}

        <p className="header-subtitle">
          Enterprise MERN Stack with Role-Based Access Control &amp; Automated DevOps CI/CD
        </p>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="main">
        <AddTodoForm
          onAdd={createTodo}
          isAdmin={isAdmin}
          users={users}
          assignedUser={assignedUser}
          setAssignedUser={setAssignedUser}
        />

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
          isAdmin={isAdmin}
          users={users}
        />
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <p>
          Built with ❤️ · MERN Stack · Role-Based Auth ·{' '}
          <a href="https://github.com/RohitRN14/auto-deployment" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <AdminUsersModal
        isOpen={adminUsersModalOpen}
        onClose={() => setAdminUsersModalOpen(false)}
        onSelectUserFilter={handleSelectUserFilter}
        onAssignUser={handleAssignToUser}
      />
    </div>
  );
}
