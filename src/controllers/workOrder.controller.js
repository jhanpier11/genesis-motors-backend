const { WorkOrder, WorkOrderDetail, Service, Vehicle, Client, User, Appointment } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const workOrderController = {
  // Obtener todas las órdenes de trabajo
  getAll: async (req, res) => {
    try {
      const { estado, mecanico_id, fecha } = req.query;
      let where = {};

      if (estado) {
        where.estado = estado;
      }

      if (mecanico_id) {
        where.mecanico_id = mecanico_id;
      }

      if (fecha) {
        const startDate = new Date(fecha);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(fecha);
        endDate.setHours(23, 59, 59, 999);
        
        where.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const workOrders = await WorkOrder.findAll({
        where,
        include: [
          {
            model: Vehicle,
            as: 'vehiculo',
            include: [{
              model: Client,
              as: 'cliente',
              attributes: ['id', 'nombre', 'telefono']
            }]
          },
          {
            model: User,
            as: 'mecanico',
            attributes: ['id', 'nombre']
          },
          {
            model: WorkOrderDetail,
            as: 'details',
            include: [{
              model: Service,
              as: 'service'
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ workOrders });
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      res.status(500).json({ error: 'Error al obtener órdenes de trabajo' });
    }
  },

  // Obtener orden por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const workOrder = await WorkOrder.findByPk(id, {
        include: [
          {
            model: Vehicle,
            as: 'vehiculo',
            include: [{
              model: Client,
              as: 'cliente'
            }]
          },
          {
            model: User,
            as: 'mecanico'
          },
          {
            model: WorkOrderDetail,
            as: 'details',
            include: [{
              model: Service,
              as: 'service'
            }]
          },
          {
            model: Appointment,
            as: 'cita'
          }
        ]
      });

      if (!workOrder) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
      }

      res.json({ workOrder });
    } catch (error) {
      console.error('Error al obtener orden:', error);
      res.status(500).json({ error: 'Error al obtener orden de trabajo' });
    }
  },

  // Crear orden de trabajo
  create: async (req, res) => {
    try {
      const { vehiculo_id, cita_id, mecanico_id, diagnostico, servicios } = req.body;

      // Verificar vehículo
      const vehicle = await Vehicle.findByPk(vehiculo_id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      // Generar código único
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      const codigo = `OT-${year}${month}${day}-${random}`;

      // Crear la orden de trabajo
      const workOrder = await WorkOrder.create({
        codigo: codigo,
        vehiculo_id,
        cita_id: cita_id || null,
        mecanico_id: mecanico_id || null,
        diagnostico: diagnostico || '',
        recepcionista_id: req.user.id,
        estado: 'creada',
        costo_total: 0.00
      });

      // Si viene de una cita, actualizar estado de la cita
      if (cita_id) {
        const appointment = await Appointment.findByPk(cita_id);
        if (appointment && appointment.estado === 'confirmada') {
          await appointment.update({ estado: 'en_progreso' });
        }
      }

      // Agregar servicios si se proporcionaron
      let costoTotal = 0;
      if (servicios && Array.isArray(servicios) && servicios.length > 0) {
        for (const servicioItem of servicios) {
          const service = await Service.findByPk(servicioItem.servicio_id);
          if (service) {
            const precio = servicioItem.precio_cobrado || service.costo_estandar;
            await WorkOrderDetail.create({
              orden_id: workOrder.id,
              servicio_id: service.id,
              precio_cobrado: precio,
              tiempo_real: servicioItem.tiempo_real || null,
              notas: servicioItem.notas || ''
            });
            costoTotal += parseFloat(precio);
          }
        }
        
        // Actualizar costo total
        await workOrder.update({ costo_total: costoTotal });
      }

      // Recargar la orden con todas las relaciones
      const orderWithDetails = await WorkOrder.findByPk(workOrder.id, {
        include: [
          {
            model: Vehicle,
            as: 'vehiculo',
            include: [{ model: Client, as: 'cliente' }]
          },
          { model: User, as: 'mecanico' },
          {
            model: WorkOrderDetail,
            as: 'details',
            include: [{ model: Service, as: 'service' }]
          }
        ]
      });

      res.status(201).json({
        message: 'Orden de trabajo creada exitosamente',
        workOrder: orderWithDetails
      });
    } catch (error) {
      console.error('Error al crear orden:', error);
      res.status(500).json({ 
        error: 'Error al crear orden de trabajo',
        details: error.message 
      });
    }
  },

 // Actualizar estado de orden de trabajo
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, diagnostico, notas_internas } = req.body;

      const workOrder = await WorkOrder.findByPk(id);
      if (!workOrder) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
      }

      // Validar transiciones de estado permitidas
      const validTransitions = {
        'creada': ['en_progreso', 'cancelada'],
        'en_progreso': ['completada', 'pausada', 'cancelada'],
        'pausada': ['en_progreso', 'cancelada'],
        'completada': ['entregada'],
        'entregada': [],
        'cancelada': []
      };

      // Solo validar la transición si se está cambiando el estado
      if (estado && estado !== workOrder.estado) {
        if (!validTransitions[workOrder.estado] || !validTransitions[workOrder.estado].includes(estado)) {
          return res.status(400).json({ 
            error: `No se puede cambiar el estado de "${workOrder.estado}" a "${estado}"`,
            validTransitions: validTransitions[workOrder.estado] || []
          });
        }
      }

      // Construir objeto de actualización
      const updateData = {};
      
      if (estado) {
        updateData.estado = estado;
        
        // Si se completa la orden, registrar fecha de fin
        if (estado === 'completada') {
          updateData.fecha_fin = new Date();
        }
        
        // Si se inicia la orden, registrar fecha de inicio
        if (estado === 'en_progreso' && !workOrder.fecha_inicio) {
          updateData.fecha_inicio = new Date();
        }
      }
      
      if (diagnostico !== undefined) {
        updateData.diagnostico = diagnostico;
      }
      
      if (notas_internas !== undefined) {
        updateData.notas_internas = notas_internas;
      }

      // Si no hay nada que actualizar
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
      }

      await workOrder.update(updateData);

      // Recargar la orden con todas las relaciones
      const updatedOrder = await WorkOrder.findByPk(workOrder.id, {
        include: [
          {
            model: Vehicle,
            as: 'vehiculo',
            include: [{ model: Client, as: 'cliente' }]
          },
          { 
            model: User, 
            as: 'mecanico',
            attributes: ['id', 'nombre']
          },
          {
            model: WorkOrderDetail,
            as: 'details',
            include: [{ 
              model: Service, 
              as: 'service' 
            }]
          }
        ]
      });

      res.json({
        message: 'Orden de trabajo actualizada exitosamente',
        workOrder: updatedOrder
      });
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      res.status(500).json({ 
        error: 'Error al actualizar orden de trabajo',
        details: error.message 
      });
    }
  },

  // Asignar mecánico
  assignMechanic: async (req, res) => {
    try {
      const { id } = req.params;
      const { mecanico_id } = req.body;

      const workOrder = await WorkOrder.findByPk(id);
      if (!workOrder) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
      }

      const mechanic = await User.findOne({
        where: { id: mecanico_id, rol: 'mecanico', activo: true }
      });

      if (!mechanic) {
        return res.status(404).json({ error: 'Mecánico no encontrado o inactivo' });
      }

      await workOrder.update({ mecanico_id });

      res.json({
        message: 'Mecánico asignado exitosamente',
        workOrder
      });
    } catch (error) {
      console.error('Error al asignar mecánico:', error);
      res.status(500).json({ error: 'Error al asignar mecánico' });
    }
  },

  // Agregar servicios a orden existente
  addServices: async (req, res) => {
    try {
      const { id } = req.params;
      const { servicios } = req.body;

      const workOrder = await WorkOrder.findByPk(id);
      if (!workOrder) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada' });
      }

      let costoAdicional = 0;

      for (const servicioItem of servicios) {
        const service = await Service.findByPk(servicioItem.servicio_id);
        if (!service) {
          return res.status(404).json({ error: `Servicio con ID ${servicioItem.servicio_id} no encontrado` });
        }

        const precio = servicioItem.precio_cobrado || service.costo_estandar;
        await WorkOrderDetail.create({
          orden_id: workOrder.id,
          servicio_id: service.id,
          precio_cobrado: precio,
          tiempo_real: servicioItem.tiempo_real || null,
          notas: servicioItem.notas || ''
        });

        costoAdicional += parseFloat(precio);
      }

      const nuevoTotal = parseFloat(workOrder.costo_total || 0) + costoAdicional;
      await workOrder.update({ costo_total: nuevoTotal });

      const updatedOrder = await WorkOrder.findByPk(workOrder.id, {
        include: [
          {
            model: WorkOrderDetail,
            as: 'details',
            include: [{ model: Service, as: 'service' }]
          }
        ]
      });

      res.json({
        message: 'Servicios agregados exitosamente',
        workOrder: updatedOrder
      });
    } catch (error) {
      console.error('Error al agregar servicios:', error);
      res.status(500).json({ error: 'Error al agregar servicios' });
    }
  }
};

module.exports = workOrderController;