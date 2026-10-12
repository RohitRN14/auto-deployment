const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  deleteCompleted,
} = require('../controllers/todoController');
const validate = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');

// Apply optionalAuth to all todo routes
router.use(optionalAuth);

// ── Validation rules ───────────────────────────────────────────────────────────
const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
];

const updateRules = [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('completed').optional().isBoolean(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
];

const idRule = [param('id').isMongoId().withMessage('Invalid todo ID')];

// ── Routes ─────────────────────────────────────────────────────────────────────
router.get('/', getAllTodos);
router.get('/:id', idRule, validate, getTodoById);
router.post('/', createRules, validate, createTodo);
router.put('/:id', [...idRule, ...updateRules], validate, updateTodo);
router.patch('/:id/toggle', idRule, validate, toggleTodo);
router.delete('/completed/all', deleteCompleted);
router.delete('/:id', idRule, validate, deleteTodo);

module.exports = router;
