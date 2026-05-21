const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Ver vehículos - Admin, Recepcionista, Mecánico
router.get('/', roleMiddleware('admin', 'recepcionista', 'mecanico'), vehicleController.getAll);

// Ver vehículo por ID - Todos
router.get('/:id', roleMiddleware('admin', 'recepcionista', 'mecanico'), vehicleController.getById);

// Crear/Editar/Eliminar - Admin, Recepcionista
router.post('/', roleMiddleware('admin', 'recepcionista'), vehicleController.create);
router.put('/:id', roleMiddleware('admin', 'recepcionista'), vehicleController.update);
router.delete('/:id', roleMiddleware('admin'), vehicleController.delete);

module.exports = router;