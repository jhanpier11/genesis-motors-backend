const { Client, Vehicle } = require('../models');
const { Op } = require('sequelize');

const clientController = {
  // Obtener todos los clientes
  getAll: async (req, res) => {
    try {
      const { search } = req.query;
      let where = {};

      if (search) {
        where = {
          [Op.or]: [
            { nombre: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { telefono: { [Op.like]: `%${search}%` } }
          ]
        };
      }

      const clients = await Client.findAll({
        where,
        include: [{
          model: Vehicle,
          as: 'vehicles',
          attributes: ['id', 'marca', 'modelo', 'placa']
        }],
        order: [['nombre', 'ASC']]
      });

      res.json({ clients });
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({ error: 'Error al obtener clientes' });
    }
  },

  // Obtener cliente por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const client = await Client.findByPk(id, {
        include: [{
          model: Vehicle,
          as: 'vehicles'
        }]
      });

      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      res.json({ client });
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({ error: 'Error al obtener cliente' });
    }
  },

  // Crear nuevo cliente
  create: async (req, res) => {
    try {
      const { nombre, telefono, email, direccion } = req.body;

      const client = await Client.create({
        nombre,
        telefono,
        email,
        direccion
      });

      res.status(201).json({
        message: 'Cliente creado exitosamente',
        client
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({ error: 'Error al crear cliente' });
    }
  },

  // Actualizar cliente
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, telefono, email, direccion } = req.body;

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      await client.update({
        nombre,
        telefono,
        email,
        direccion
      });

      res.json({
        message: 'Cliente actualizado exitosamente',
        client
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }
      res.status(500).json({ error: 'Error al actualizar cliente' });
    }
  },

  // Eliminar cliente
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const client = await Client.findByPk(id);

      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      await client.destroy();
      res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({ error: 'Error al eliminar cliente' });
    }
  }
};

module.exports = clientController;