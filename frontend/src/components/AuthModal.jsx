import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'admin'

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Login failed');
        }
      } else {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }
        const res = await register({ name, email, password, role });
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Registration failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (roleType) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await demoLogin(roleType);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="auth-modal-title">
            <span className="auth-logo-badge">⚡</span>
            <div>
              <h3>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h3>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to access your tasks and workspace'
                  : 'Join TaskFlow with User or Admin privileges'}
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

        {/* Demo 1-Click Access Panel */}
        <div className="demo-login-panel">
          <div className="demo-panel-header">
            <span className="demo-pill-tag">⚡ Fast Access</span>
            <span>One-click instant demo:</span>
          </div>
          <div className="demo-actions">
            <button
              type="button"
              className="btn-demo admin-demo-btn"
              disabled={loading}
              onClick={() => handleDemo('admin')}
            >
              🛡️ Demo Admin
              <small>Full access &amp; manage users</small>
            </button>
            <button
              type="button"
              className="btn-demo user-demo-btn"
              disabled={loading}
              onClick={() => handleDemo('user')}
            >
              👤 Demo User
              <small>Personal task list</small>
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>or continue with credentials</span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="auth-error-alert" role="alert">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                className="input-field"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="input-field"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Select Account Role</label>
              <div className="role-selector-grid">
                <label className={`role-card-option ${role === 'user' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                  />
                  <div className="role-option-content">
                    <span className="role-icon">👤</span>
                    <div>
                      <strong>Standard User</strong>
                      <p>Manage your own personal tasks and deadlines</p>
                    </div>
                  </div>
                </label>

                <label className={`role-card-option ${role === 'admin' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                  />
                  <div className="role-option-content">
                    <span className="role-icon">🛡️</span>
                    <div>
                      <strong>System Admin</strong>
                      <p>View all users' tasks &amp; system management</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-submit-auth"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-inline"></span>
            ) : mode === 'login' ? (
              'Sign In ➜'
            ) : (
              'Create Account ➜'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
