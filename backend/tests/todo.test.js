/**
 * Basic API tests for the Todo endpoints.
 * Uses supertest + jest. MongoDB connection is needed.
 * Set MONGO_URI env var to a test database before running.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const Todo = require('../src/models/Todo');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-todo-test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Todo.deleteMany({});
});

describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/todos', () => {
  it('should create a new todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Test Todo', priority: 'high' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Todo');
    expect(res.body.data.completed).toBe(false);
  });

  it('should reject a todo without title', async () => {
    const res = await request(app).post('/api/todos').send({ description: 'No title' });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/todos', () => {
  it('should return all todos', async () => {
    await Todo.insertMany([
      { title: 'Todo 1', priority: 'low' },
      { title: 'Todo 2', priority: 'high' },
    ]);
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});

describe('PATCH /api/todos/:id/toggle', () => {
  it('should toggle completion status', async () => {
    const todo = await Todo.create({ title: 'Toggle me' });
    const res = await request(app).patch(`/api/todos/${todo._id}/toggle`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.completed).toBe(true);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('should delete a todo', async () => {
    const todo = await Todo.create({ title: 'Delete me' });
    const res = await request(app).delete(`/api/todos/${todo._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const found = await Todo.findById(todo._id);
    expect(found).toBeNull();
  });
});
