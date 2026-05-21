const { Appointment, WorkOrder, Client } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
  getStats: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [citasHoy, ordenesPendientes, ordenesCompletadas, clientesNuevos] = await Promise.all([
        Appointment.count({
          where: {
            fecha_hora: {
              [Op.between]: [today, tomorrow]
            },
            estado: { [Op.notIn]: ['cancelada'] }
          }
        }).catch(() => 0),
        WorkOrder.count({
          where: {
            estado: { [Op.in]: ['creada', 'en_progreso', 'pausada'] }
          }
        }).catch(() => 0),
        WorkOrder.count({
          where: {
            fecha_fin: {
              [Op.between]: [today, tomorrow]
            },
            estado: 'completada'
          }
        }).catch(() => 0),
        Client.count({
          where: {
            createdAt: {
              [Op.between]: [today, tomorrow]
            }
          }
        }).catch(() => 0)
      ]);

      res.json({
        stats: {
          citasHoy: citasHoy || 0,
          ordenesPendientes: ordenesPendientes || 0,
          ordenesCompletadas: ordenesCompletadas || 0,
          clientesNuevos: clientesNuevos || 0
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
    }
  }
};

module.exports = dashboardController;