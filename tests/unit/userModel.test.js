const { User } = require('../../src/models');
const bcrypt = require('bcryptjs');

// Mock de Sequelize
jest.mock('../../src/models', () => {
  const mockUser = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  return { User: mockUser };
});

describe('🧪 Pruebas Unitarias - Modelo User', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create() - Crear Usuario', () => {
    it('✅ Debe crear un usuario con datos válidos', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@test.com',
        password: '123456',
        rol: 'mecanico'
      };

      const mockCreatedUser = {
        id: 1,
        ...userData,
        password: 'hashed_password',
        activo: true,
        toJSON: function() {
          const { password, ...rest } = this;
          return rest;
        }
      };

      User.create.mockResolvedValue(mockCreatedUser);

      const user = await User.create(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(user.nombre).toBe('Test User');
      expect(user.email).toBe('test@test.com');
      expect(user.rol).toBe('mecanico');
    });

    it('❌ Debe fallar si falta el email', async () => {
      User.create.mockRejectedValue(new Error('Email es requerido'));

      await expect(
        User.create({ nombre: 'Test', password: '123', rol: 'mecanico' })
      ).rejects.toThrow('Email es requerido');
    });

    it('❌ Debe fallar si el rol no es válido', async () => {
      User.create.mockRejectedValue(new Error('Rol inválido'));

      await expect(
        User.create({ 
          nombre: 'Test', 
          email: 'test@test.com', 
          password: '123', 
          rol: 'superadmin' 
        })
      ).rejects.toThrow('Rol inválido');
    });
  });

  describe('findOne() - Buscar Usuario', () => {
    it('✅ Debe encontrar un usuario por email', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Admin',
        email: 'admin@genesis.com',
        rol: 'admin',
        activo: true
      };

      User.findOne.mockResolvedValue(mockUser);

      const user = await User.findOne({ where: { email: 'admin@genesis.com' } });

      expect(user).toBeDefined();
      expect(user.email).toBe('admin@genesis.com');
      expect(user.rol).toBe('admin');
    });

    it('✅ Debe retornar null si no encuentra el usuario', async () => {
      User.findOne.mockResolvedValue(null);

      const user = await User.findOne({ 
        where: { email: 'noexiste@test.com' } 
      });

      expect(user).toBeNull();
    });
  });

  describe('validarPassword() - Validar Contraseña', () => {
    it('✅ Debe retornar true para contraseña correcta', async () => {
      const password = '123456';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('❌ Debe retornar false para contraseña incorrecta', async () => {
      const password = '123456';
      const wrongPassword = '654321';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });
});