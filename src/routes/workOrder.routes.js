const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrder.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Ver órdenes - Admin, Recepcionista, Mecánico
router.get('/', roleMiddleware('admin', 'recepcionista', 'mecanico'), workOrderController.getAll);

// Ver orden por ID - Todos
router.get('/:id', roleMiddleware('admin', 'recepcionista', 'mecanico'), workOrderController.getById);

// Crear orden - Admin, Recepcionista
router.post('/', roleMiddleware('admin', 'recepcionista'), workOrderController.create);

// Cambiar estado - Admin, Mecánico
router.patch('/:id/status', roleMiddleware('admin', 'mecanico'), workOrderController.updateStatus);

// Asignar mecánico - Admin, Recepcionista
router.patch('/:id/assign', roleMiddleware('admin', 'recepcionista'), workOrderController.assignMechanic);

// Agregar servicios - Admin, Mecánico
router.post('/:id/services', roleMiddleware('admin', 'mecanico'), workOrderController.addServices);

module.exports = router;