const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');

describe('🧪 Pruebas de Integración - Auth API', () => {
  
  beforeAll(async () => {
    // Sincronizar BD de prueba
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('✅ Debe registrar un usuario correctamente', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@test.com',
          password: '123456',
          rol: 'mecanico'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@test.com');
      expect(res.body.user.rol).toBe('mecanico');
    });

    it('❌ Debe rechazar email duplicado', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Otro User',
          email: 'test@test.com',
          password: '123456',
          rol: 'mecanico'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('❌ Debe rechazar datos incompletos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Sin Email'
        });

      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /api/auth/login', () => {
    it('✅ Debe iniciar sesión con credenciales correctas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@test.com');
    });

    it('❌ Debe rechazar credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('❌ Debe rechazar usuario inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: '123456'
        });
      token = res.body.token;
    });

    it('✅ Debe retornar el perfil con token válido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
    });

    it('❌ Debe rechazar sin token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

    it('❌ Debe rechazar token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token_invalido');

      expect(res.statusCode).toBe(401);
    });
  });
});