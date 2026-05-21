const { Appointment, Client, Vehicle, User, WorkOrder } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const appointmentController = {
  // Obtener todas las citas con filtros
  getAll: async (req, res) => {
    try {
      const { fecha, estado, cliente_id } = req.query;
      let where = {};

      if (fecha) {
        const startDate = new Date(fecha);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(fecha);
        endDate.setHours(23, 59, 59, 999);
        
        where.fecha_hora = {
          [Op.between]: [startDate, endDate]
        };
      }

      if (estado) {
        where.estado = estado;
      }

      if (cliente_id) {
        where.cliente_id = cliente_id;
      }

      const appointments = await Appointment.findAll({
        where,
        include: [
          {
            model: Client,
            as: 'cliente',
            attributes: ['id', 'nombre', 'telefono']
          },
          {
            model: Vehicle,
            as: 'vehiculo',
            attributes: ['id', 'marca', 'modelo', 'placa']
          },
          {
            model: User,
            as: 'recepcionista',
            attributes: ['id', 'nombre']
          }
        ],
        order: [['fecha_hora', 'ASC']]
      });

      res.json({ appointments });
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({ error: 'Error al obtener citas' });
    }
  },

  // Obtener cita por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByPk(id, {
        include: [
          {
            model: Client,
            as: 'cliente'
          },
          {
            model: Vehicle,
            as: 'vehiculo'
          },
          {
            model: User,
            as: 'recepcionista'
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json({ appointment });
    } catch (error) {
      console.error('Error al obtener cita:', error);
      res.status(500).json({ error: 'Error al obtener cita' });
    }
  },

  // Crear nueva cita
  create: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { cliente_id, vehiculo_id, fecha_hora, descripcion_problema, notas } = req.body;

      // Verificar que el cliente existe
      const client = await Client.findByPk(cliente_id);
      if (!client) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Verificar que el vehículo existe y pertenece al cliente
      const vehicle = await Vehicle.findOne({
        where: { id: vehiculo_id, cliente_id }
      });
      if (!vehicle) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Vehículo no encontrado o no pertenece al cliente' });
      }

      // Verificar disponibilidad (no más de 2 citas en la misma hora)
      const appointmentDate = new Date(fecha_hora);
      const hourStart = new Date(appointmentDate);
      const hourEnd = new Date(appointmentDate);
      hourEnd.setHours(hourEnd.getHours() + 1);

      const conflictingAppointments = await Appointment.count({
        where: {
          fecha_hora: {
            [Op.between]: [hourStart, hourEnd]
          },
          estado: {
            [Op.notIn]: ['cancelada']
          }
        }
      });

      if (conflictingAppointments >= 2) {
        await transaction.rollback();
        return res.status(409).json({ 
          error: 'Horario no disponible. Ya existen 2 citas en ese horario.' 
        });
      }

      const appointment = await Appointment.create({
        cliente_id,
        vehiculo_id,
        fecha_hora,
        descripcion_problema,
        notas,
        recepcionista_id: req.user.id
      }, { transaction });

      await transaction.commit();

      const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
        include: [
          { model: Client, as: 'cliente' },
          { model: Vehicle, as: 'vehiculo' },
          { model: User, as: 'recepcionista' }
        ]
      });

      res.status(201).json({
        message: 'Cita agendada exitosamente',
        appointment: appointmentWithDetails
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear cita:', error);
      res.status(500).json({ error: 'Error al crear cita' });
    }
  },

  // Actualizar estado de cita
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, notas } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      const validTransitions = {
        'pendiente': ['confirmada', 'cancelada'],
        'confirmada': ['en_progreso', 'cancelada'],
        'en_progreso': ['completada', 'cancelada'],
        'completada': [],
        'cancelada': []
      };

      if (!validTransitions[appointment.estado].includes(estado)) {
        return res.status(400).json({ 
          error: `No se puede cambiar de ${appointment.estado} a ${estado}` 
        });
      }

      await appointment.update({ estado, notas });

      res.json({
        message: 'Estado de cita actualizado exitosamente',
        appointment
      });
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      res.status(500).json({ error: 'Error al actualizar cita' });
    }
  },

  // Cancelar cita
  cancel: async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      if (['completada', 'cancelada'].includes(appointment.estado)) {
        return res.status(400).json({ 
          error: 'No se puede cancelar una cita que ya está completada o cancelada' 
        });
      }

      await appointment.update({
        estado: 'cancelada',
        notas: motivo || 'Cita cancelada'
      });

      res.json({
        message: 'Cita cancelada exitosamente',
        appointment
      });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      res.status(500).json({ error: 'Error al cancelar cita' });
    }
  }
};

module.exports = appointmentController;