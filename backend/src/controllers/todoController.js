const Todo = require('../models/Todo');

// ── GET /api/todos ─────────────────────────────────────────────────────────────
const getAllTodos = async (req, res, next) => {
  try {
    const { completed, priority, sort = '-createdAt', limit = 100, page = 1 } = req.query;

    const filter = {};
    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = priority;

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
    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/todos ────────────────────────────────────────────────────────────
const createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const todo = new Todo({ title, description, priority, dueDate });
    const saved = await todo.save();
    res.status(201).json({ success: true, data: saved, message: 'Todo created successfully' });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/todos/:id ─────────────────────────────────────────────────────────
const updateTodo = async (req, res, next) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, priority, dueDate },
      { new: true, runValidators: true }
    );
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.status(200).json({ success: true, data: todo, message: 'Todo updated successfully' });
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
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.status(200).json({ success: true, message: 'Todo deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/todos/completed/all ───────────────────────────────────────────
const deleteCompleted = async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({ completed: true });
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
