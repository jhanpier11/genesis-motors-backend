const { Service } = require('../models');

const serviceController = {
  getAll: async (req, res) => {
    try {
      const services = await Service.findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']]
      });
      res.json({ services });
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      res.status(500).json({ error: 'Error al obtener servicios' });
    }
  },

  create: async (req, res) => {
    try {
      const { nombre, descripcion, costo_estandar, tiempo_estimado } = req.body;

      const service = await Service.create({
        nombre,
        descripcion,
        costo_estandar,
        tiempo_estimado
      });

      res.status(201).json({
        message: 'Servicio creado exitosamente',
        service
      });
    } catch (error) {
      console.error('Error al crear servicio:', error);
      res.status(500).json({ error: 'Error al crear servicio' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, costo_estandar, tiempo_estimado } = req.body;

      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }

      await service.update({ nombre, descripcion, costo_estandar, tiempo_estimado });

      res.json({
        message: 'Servicio actualizado exitosamente',
        service
      });
    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      res.status(500).json({ error: 'Error al actualizar servicio' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);

      if (!service) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }

      await service.update({ activo: false });

      res.json({ message: 'Servicio desactivado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      res.status(500).json({ error: 'Error al eliminar servicio' });
    }
  }
};

module.exports = serviceController;