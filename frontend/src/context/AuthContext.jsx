import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/todoApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem('taskflow_token');
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('taskflow_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        // Token expired or invalid
        console.warn('Session expired or invalid, logging out:', err.message);
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { token: jwtToken, user: userData } = res.data;

      localStorage.setItem('taskflow_token', jwtToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);

      toast.success(
        userData.role === 'admin'
          ? `Logged in as Admin: ${userData.name} 🛡️`
          : `Welcome back, ${userData.name}! ✨`
      );
      return { success: true };
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  const register = async ({ name, email, password, role = 'user' }) => {
    try {
      const res = await authApi.register({ name, email, password, role });
      const { token: jwtToken, user: userData } = res.data;

      localStorage.setItem('taskflow_token', jwtToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);

      toast.success(
        userData.role === 'admin'
          ? `Admin account created! Welcome 🛡️`
          : `Account created successfully! Welcome ✨`
      );
      return { success: true };
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
    setToken(null);
    toast('Logged out successfully', { icon: '👋' });
  };

  const demoLogin = async (role = 'admin') => {
    const creds =
      role === 'admin'
        ? { email: 'admin@taskflow.dev', password: 'Admin@123' }
        : { email: 'user@taskflow.dev', password: 'User@123' };

    try {
      // First attempt login
      let res;
      try {
        res = await authApi.login(creds);
      } catch (loginErr) {
        // If demo accounts aren't in DB yet, trigger seed endpoint and retry
        await authApi.seedDefaults();
        res = await authApi.login(creds);
      }

      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('taskflow_token', jwtToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);

      toast.success(
        role === 'admin'
          ? `Logged in as Demo Admin 🛡️`
          : `Logged in as Demo User 👤`
      );
      return { success: true };
    } catch (err) {
      toast.error(`Demo login failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    token,
    isAdmin: user?.role === 'admin',
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
