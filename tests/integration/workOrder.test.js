const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Vehicle, Client } = require('../../src/models');

describe('🧪 Pruebas de Integración - WorkOrder API', () => {
  let adminToken, mecanicoToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear usuarios de prueba
    const admin = await User.create({
      nombre: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      rol: 'admin'
    });

    const mecanico = await User.create({
      nombre: 'Mecánico',
      email: 'mecanico@test.com',
      password: '123456',
      rol: 'mecanico'
    });

    // Crear cliente y vehículo
    const client = await Client.create({
      nombre: 'Cliente Test',
      email: 'cliente@test.com'
    });

    await Vehicle.create({
      cliente_id: client.id,
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2020,
      placa: 'ABC123'
    });

    // Obtener tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: '123456' });
    adminToken = adminLogin.body.token;

    const mechLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mecanico@test.com', password: '123456' });
    mecanicoToken = mechLogin.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/work-orders', () => {
    it('✅ Admin puede crear orden de trabajo', async () => {
      const res = await request(app)
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vehiculo_id: 1,
          diagnostico: 'Problema de motor'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('workOrder');
      expect(res.body.workOrder).toHaveProperty('codigo');
      expect(res.body.workOrder.estado).toBe('creada');
    });

    it('❌ Mecánico no puede crear orden de trabajo', async () => {
      const res = await request(app)
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${mecanicoToken}`)
        .send({
          vehiculo_id: 1,
          diagnostico: 'Problema'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/work-orders', () => {
    it('✅ Admin puede ver todas las órdenes', async () => {
      const res = await request(app)
        .get('/api/work-orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('workOrders');
      expect(Array.isArray(res.body.workOrders)).toBe(true);
    });
  });
});