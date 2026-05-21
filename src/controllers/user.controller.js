const { User, Client } = require('../models');
const bcrypt = require('bcryptjs');

const userController = {
  getAll: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['nombre', 'ASC']]
      });
      res.json({ users });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  getMechanics: async (req, res) => {
    try {
      const mechanics = await User.findAll({
        where: { rol: 'mecanico', activo: true },
        attributes: ['id', 'nombre', 'email'],
        order: [['nombre', 'ASC']]
      });
      res.json({ mechanics });
    } catch (error) {
      console.error('Error al obtener mecánicos:', error);
      res.status(500).json({ error: 'Error al obtener mecánicos' });
    }
  },

  create: async (req, res) => {
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

      if (rol === 'cliente') {
        await Client.create({
          nombre,
          email,
          telefono: req.body.telefono || null,
          user_id: user.id
        });
      }

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, email, rol, activo, telefono } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const oldRole = user.rol;
      const newRole = rol || oldRole;

      if (oldRole === 'cliente' && newRole !== 'cliente') {
        // Buscar el registro en clientes por user_id
        const client = await Client.findOne({ where: { user_id: user.id } });
        if (client) {
  
          await client.destroy();
          console.log(`Cliente ${client.nombre} eliminado de la tabla clientes`);
        }
      }

      if (oldRole !== 'cliente' && newRole === 'cliente') {
        let client = await Client.findOne({ where: { email: email || user.email } });
        
        if (client) {
          await client.update({
            user_id: user.id,
            nombre: nombre || user.nombre,
            email: email || user.email,
            telefono: telefono || user.telefono || client.telefono
          });
        } else {
          await Client.create({
            nombre: nombre || user.nombre,
            email: email || user.email,
            telefono: telefono || user.telefono || null,
            user_id: user.id
          });
        }
        console.log(`Cliente creado/actualizado para usuario ${user.nombre}`);
      }

      if (oldRole === 'cliente' && newRole === 'cliente') {
        const client = await Client.findOne({ where: { user_id: user.id } });
        if (client) {
          await client.update({
            nombre: nombre || user.nombre,
            email: email || user.email,
            telefono: telefono || user.telefono || client.telefono
          });
        }
      }

      const updateData = {};
      if (nombre) updateData.nombre = nombre;
      if (email) updateData.email = email;
      if (rol) updateData.rol = rol;
      if (activo !== undefined) updateData.activo = activo;
      if (telefono !== undefined) updateData.telefono = telefono;

      await user.update(updateData);

      const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] }
      });

      res.json({
        message: 'Usuario actualizado exitosamente',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ 
        error: 'Error al actualizar usuario',
        details: error.message 
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await user.update({ activo: false });

      res.json({ message: 'Usuario desactivado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { nombre, email, telefono } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await user.update({ nombre, email, telefono });

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const isValid = await user.validarPassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  }
};

module.exports = userController;