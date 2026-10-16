const Todo = require('../models/Todo');
const User = require('../models/User');

// ── GET /api/todos ─────────────────────────────────────────────────────────────
const getAllTodos = async (req, res, next) => {
  try {
    const {
      completed,
      priority,
      sort = '-createdAt',
      limit = 100,
      page = 1,
      scope,
      userId,
    } = req.query;

    const filter = {};
    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = priority;

    // Role-based filtering
    if (req.user) {
      if (req.user.role === 'admin') {
        if (userId) {
          filter.user = userId;
        } else if (scope === 'mine') {
          filter.user = req.user._id;
        }
        // If scope === 'all' or default admin view, do not filter by user
      } else {
        // Regular user only sees their own tasks
        filter.user = req.user._id;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [todos, total] = await Promise.all([
      Todo.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Todo.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: todos,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/todos/:id ─────────────────────────────────────────────────────────
const getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    // Authorization check
    if (
      req.user &&
      req.user.role !== 'admin' &&
      todo.user &&
      !todo.user.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this task',
      });
    }

    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/todos ────────────────────────────────────────────────────────────
const createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;

    const todoData = {
      title,
      description,
      priority,
      dueDate,
    };

    if (req.user) {
      // If admin specifies an assigned user, assign work to that person
      if (req.user.role === 'admin' && assignedTo) {
        const targetUser = await User.findById(assignedTo);
        if (targetUser) {
          todoData.user = targetUser._id;
          todoData.userName = targetUser.name;
          todoData.userEmail = targetUser.email;
        } else {
          todoData.user = req.user._id;
          todoData.userName = req.user.name;
          todoData.userEmail = req.user.email;
        }
      } else {
        todoData.user = req.user._id;
        todoData.userName = req.user.name;
        todoData.userEmail = req.user.email;
      }
    }

    const todo = new Todo(todoData);
    const saved = await todo.save();
    res.status(201).json({ success: true, data: saved, message: 'Todo created successfully' });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/todos/:id ─────────────────────────────────────────────────────────
const updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    // Role check: Only task owner or Admin can update
    if (
      req.user &&
      req.user.role !== 'admin' &&
      todo.user &&
      !todo.user.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task',
      });
    }

    const { title, description, completed, priority, dueDate, assignedTo } = req.body;
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (completed !== undefined) todo.completed = completed;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;

    // Admin can reassign / allot task to another user
    if (req.user && req.user.role === 'admin' && assignedTo !== undefined) {
      if (assignedTo) {
        const targetUser = await User.findById(assignedTo);
        if (targetUser) {
          todo.user = targetUser._id;
          todo.userName = targetUser.name;
          todo.userEmail = targetUser.email;
        }
      } else {
        todo.user = null;
        todo.userName = 'Guest';
        todo.userEmail = '';
      }
    }

    const updated = await todo.save();
    res.status(200).json({ success: true, data: updated, message: 'Todo updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/todos/:id/toggle ───────────────────────────────────────────────
const toggleTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    // Role check: Only task owner or Admin can toggle
    if (
      req.user &&
      req.user.role !== 'admin' &&
      todo.user &&
      !todo.user.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to toggle this task',
      });
    }

    todo.completed = !todo.completed;
    await todo.save();
    res.status(200).json({
      success: true,
      data: todo,
      message: `Todo marked as ${todo.completed ? 'completed' : 'incomplete'}`,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/todos/:id ──────────────────────────────────────────────────────
const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    // Role check: Only task owner or Admin can delete
    if (
      req.user &&
      req.user.role !== 'admin' &&
      todo.user &&
      !todo.user.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this task',
      });
    }

    await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Todo deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/todos/completed/all ───────────────────────────────────────────
const deleteCompleted = async (req, res, next) => {
  try {
    const filter = { completed: true };

    // Regular users can only clear their own completed tasks
    if (req.user && req.user.role !== 'admin') {
      filter.user = req.user._id;
    }

    const result = await Todo.deleteMany(filter);
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} completed todo(s) deleted`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  deleteCompleted,
};
