const { Vehicle, Client } = require('../models');

const vehicleController = {
  getAll: async (req, res) => {
    try {
      const { cliente_id } = req.query;
      let where = {};

      if (cliente_id) {
        where.cliente_id = cliente_id;
      }

      const vehicles = await Vehicle.findAll({
        where,
        include: [{
          model: Client,
          as: 'cliente',
          attributes: ['id', 'nombre', 'telefono']
        }],
        order: [['marca', 'ASC']]
      });

      res.json({ vehicles });
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      res.status(500).json({ error: 'Error al obtener vehículos' });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findByPk(id, {
        include: [{
          model: Client,
          as: 'cliente'
        }]
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      res.json({ vehicle });
    } catch (error) {
      console.error('Error al obtener vehículo:', error);
      res.status(500).json({ error: 'Error al obtener vehículo' });
    }
  },

  create: async (req, res) => {
    try {
      const { cliente_id, marca, modelo, anio, placa, vin, color, kilometraje } = req.body;

      const client = await Client.findByPk(cliente_id);
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      const vehicle = await Vehicle.create({
        cliente_id,
        marca,
        modelo,
        anio,
        placa,
        vin,
        color,
        kilometraje
      });

      const vehicleWithClient = await Vehicle.findByPk(vehicle.id, {
        include: [{ model: Client, as: 'cliente' }]
      });

      res.status(201).json({
        message: 'Vehículo registrado exitosamente',
        vehicle: vehicleWithClient
      });
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'La placa o VIN ya están registrados' });
      }
      res.status(500).json({ error: 'Error al registrar vehículo' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { marca, modelo, anio, placa, vin, color, kilometraje } = req.body;

      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      await vehicle.update({ marca, modelo, anio, placa, vin, color, kilometraje });

      res.json({
        message: 'Vehículo actualizado exitosamente',
        vehicle
      });
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'La placa o VIN ya están en uso' });
      }
      res.status(500).json({ error: 'Error al actualizar vehículo' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findByPk(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      await vehicle.destroy();
      res.json({ message: 'Vehículo eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      res.status(500).json({ error: 'Error al eliminar vehículo' });
    }
  }
};

module.exports = vehicleController;