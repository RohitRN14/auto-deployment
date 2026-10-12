import { useState, useEffect, useCallback } from 'react';
import { todoApi } from '../api/todoApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Custom hook for all Todo operations.
 * Returns todo list state, loading/error flags, and CRUD action handlers.
 */
export function useTodos(filter = 'all', adminScope = 'all', userFilter = null) {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch todos ─────────────────────────────────────────────────────────────
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter === 'active') params.completed = false;
      if (filter === 'completed') params.completed = true;

      if (user?.role === 'admin') {
        if (userFilter) {
          params.userId = userFilter;
        } else {
          params.scope = adminScope;
        }
      }

      const res = await todoApi.getAll(params);
      setTodos(res.data.data);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filter, adminScope, userFilter, user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const createTodo = async (data) => {
    try {
      const res = await todoApi.create(data);
      setTodos((prev) => [res.data.data, ...prev]);
      toast.success('Task added! ✨');
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  // ── Toggle ──────────────────────────────────────────────────────────────────
  const toggleTodo = async (id) => {
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
    );
    try {
      const res = await todoApi.toggle(id);
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? res.data.data : t))
      );
    } catch (err) {
      // Revert on error
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
      );
      toast.error(err.message);
    }
  };

  // ── Update ──────────────────────────────────────────────────────────────────
  const updateTodo = async (id, data) => {
    try {
      const res = await todoApi.update(id, data);
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? res.data.data : t))
      );
      toast.success('Task updated!');
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteTodo = async (id) => {
    setTodos((prev) => prev.filter((t) => t._id !== id));
    try {
      await todoApi.delete(id);
      toast.success('Task deleted');
    } catch (err) {
      await fetchTodos(); // refetch on error
      toast.error(err.message);
    }
  };

  // ── Delete completed ────────────────────────────────────────────────────────
  const deleteCompleted = async () => {
    const count = todos.filter((t) => t.completed).length;
    if (!count) {
      toast('No completed tasks to clear', { icon: 'ℹ️' });
      return;
    }
    setTodos((prev) => prev.filter((t) => !t.completed));
    try {
      await todoApi.deleteCompleted({ scope: adminScope });
      toast.success(`Cleared ${count} completed task${count !== 1 ? 's' : ''}`);
    } catch (err) {
      await fetchTodos();
      toast.error(err.message);
    }
  };

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return {
    todos,
    loading,
    error,
    stats,
    fetchTodos,
    createTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    deleteCompleted,
  };
}
