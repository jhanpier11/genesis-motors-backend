const jwt = require('jsonwebtoken');
const { User, Client } = require('../models');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      
      if (!user || !user.activo) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const isValidPassword = await user.validarPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET || 'genesis_motors_secret_key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          telefono: user.telefono
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  register: async (req, res) => {
    try {
      const { nombre, email, password, rol } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const user = await User.create({
        nombre,
        email,
        password,
        rol: rol || 'mecanico'
      });

      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET || 'genesis_motors_secret_key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // Registro público para clientes
  registerClient: async (req, res) => {
    try {
      const { nombre, email, password, telefono } = req.body;

      // Verificar email duplicado
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Crear usuario con rol cliente
      const user = await User.create({
        nombre,
        email,
        password,
        telefono: telefono || null,
        rol: 'cliente'
      });

      // Crear registro en la tabla clientes
      await Client.create({
        nombre,
        email,
        telefono: telefono || null,
        user_id: user.id
      });

      const token = jwt.sign(
        { id: user.id, rol: user.rol },
        process.env.JWT_SECRET || 'genesis_motors_secret_key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Cliente registrado exitosamente',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          rol: user.rol
        }
      });
    } catch (error) {
      console.error('Error en registro de cliente:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  me: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Client,
          as: 'clientProfile'
        }]
      });
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
};

module.exports = authController;