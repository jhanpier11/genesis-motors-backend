const { Client, Vehicle, Appointment, WorkOrder, WorkOrderDetail, Service, User } = require('../models');
const { Op } = require('sequelize');

const clientPortalController = {
  // Obtener perfil del cliente
  getProfile: async (req, res) => {
    try {
      // Buscar cliente por user_id
      let client = await Client.findOne({
        where: { user_id: req.user.id },
        include: [{ model: Vehicle, as: 'vehicles' }]
      });

      // Si no existe, crear el perfil del cliente automáticamente
      if (!client) {
        client = await Client.create({
          nombre: req.user.nombre,
          email: req.user.email,
          telefono: req.user.telefono || null,
          user_id: req.user.id
        });
        
        // Recargar con vehículos
        client = await Client.findOne({
          where: { id: client.id },
          include: [{ model: Vehicle, as: 'vehicles' }]
        });
      }

      res.json({ client });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil del cliente' });
    }
  },

  // Obtener vehículos del cliente
  getMyVehicles: async (req, res) => {
    try {
      let client = await Client.findOne({ where: { user_id: req.user.id } });
      
      // Si no existe perfil, crearlo
      if (!client) {
        client = await Client.create({
          nombre: req.user.nombre,
          email: req.user.email,
          telefono: req.user.telefono || null,
          user_id: req.user.id
        });
      }

      const vehicles = await Vehicle.findAll({
        where: { cliente_id: client.id }
      });

      res.json({ vehicles });
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      res.status(500).json({ error: 'Error al obtener vehículos' });
    }
  },

  // Agregar vehículo del cliente
  addMyVehicle: async (req, res) => {
    try {
      let client = await Client.findOne({ where: { user_id: req.user.id } });
      
      // Si no existe perfil, crearlo
      if (!client) {
        client = await Client.create({
          nombre: req.user.nombre,
          email: req.user.email,
          telefono: req.user.telefono || null,
          user_id: req.user.id
        });
      }

      const { marca, modelo, anio, placa, color, vin } = req.body;

      const vehicle = await Vehicle.create({
        cliente_id: client.id,
        marca,
        modelo,
        anio,
        placa,
        color,
        vin
      });

      res.status(201).json({
        message: 'Vehículo registrado exitosamente',
        vehicle
      });
    } catch (error) {
      console.error('Error al registrar vehículo:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'La placa o VIN ya están registrados' });
      }
      res.status(500).json({ error: 'Error al registrar vehículo' });
    }
  },

  // Obtener citas del cliente
  getMyAppointments: async (req, res) => {
    try {
      let client = await Client.findOne({ where: { user_id: req.user.id } });
      
      if (!client) {
        client = await Client.create({
          nombre: req.user.nombre,
          email: req.user.email,
          telefono: req.user.telefono || null,
          user_id: req.user.id
        });
      }

      const appointments = await Appointment.findAll({
        where: { cliente_id: client.id },
        include: [
          { model: Vehicle, as: 'vehiculo' },
          { model: User, as: 'recepcionista', attributes: ['nombre'] }
        ],
        order: [['fecha_hora', 'DESC']]
      });

      res.json({ appointments });
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ error: 'Error al obtener citas' });
    }
  },

  // Crear cita como cliente
  createMyAppointment: async (req, res) => {
    try {
      let client = await Client.findOne({ where: { user_id: req.user.id } });
      
      if (!client) {
        client = await Client.create({
          nombre: req.user.nombre,
          email: req.user.email,
          telefono: req.user.telefono || null,
          user_id: req.user.id
        });
      }

      const { vehiculo_id, fecha_hora, descripcion_problema } = req.body;

      // Verificar que el vehículo pertenece al cliente
      const vehicle = await Vehicle.findOne({
        where: { id: vehiculo_id, cliente_id: client.id }
      });
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      const appointment = await Appointment.create({
        cliente_id: client.id,
        vehiculo_id,
        fecha_hora,
        descripcion_problema,
        estado: 'pendiente'
      });

      res.status(201).json({
        message: 'Cita solicitada exitosamente. Le confirmaremos pronto.',
        appointment
      });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({ error: 'Error al solicitar cita' });
    }
  },

  // Obtener órdenes de trabajo del cliente
  getMyWorkOrders: async (req, res) => {
    try {
      let client = await Client.findOne({ where: { user_id: req.user.id } });
      
      if (!client) {
        client = await Client.create({
          nombre: req.user.nombre,
          email: req.user.email,
          telefono: req.user.telefono || null,
          user_id: req.user.id
        });
      }

      const vehicles = await Vehicle.findAll({ where: { cliente_id: client.id } });
      const vehicleIds = vehicles.map(v => v.id);

      let workOrders = [];
      if (vehicleIds.length > 0) {
        workOrders = await WorkOrder.findAll({
          where: { vehiculo_id: { [Op.in]: vehicleIds } },
          include: [
            { model: Vehicle, as: 'vehiculo' },
            { model: User, as: 'mecanico', attributes: ['nombre'] },
            {
              model: WorkOrderDetail,
              as: 'details',
              include: [{ model: Service, as: 'service' }]
            }
          ],
          order: [['createdAt', 'DESC']]
        });
      }

      res.json({ workOrders });
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      res.status(500).json({ error: 'Error al obtener órdenes' });
    }
  }

  
};

module.exports = clientPortalController;