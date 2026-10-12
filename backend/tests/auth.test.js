const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-todo-test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Authentication & Roles API', () => {
  const testUser = {
    name: 'Normal User',
    email: 'user_test@example.com',
    password: 'Password123',
    role: 'user',
  };

  const testAdmin = {
    name: 'Admin User',
    email: 'admin_test@example.com',
    password: 'Password123',
    role: 'admin',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should register an admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testAdmin);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should log in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Role-based access control on /api/auth/users', () => {
    it('should deny access to regular user and allow access to admin', async () => {
      // 1. Register regular user
      const userRes = await request(app).post('/api/auth/register').send(testUser);
      const userToken = userRes.body.token;

      // 2. Register admin
      const adminRes = await request(app).post('/api/auth/register').send(testAdmin);
      const adminToken = adminRes.body.token;

      // Regular user tries to access /api/auth/users
      const userAccess = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(userAccess.statusCode).toBe(403);

      // Admin accesses /api/auth/users
      const adminAccess = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminAccess.statusCode).toBe(200);
      expect(adminAccess.body.success).toBe(true);
      expect(Array.isArray(adminAccess.body.data)).toBe(true);
    });
  });
});
