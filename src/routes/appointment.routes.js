const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Ver citas - Admin, Recepcionista, Mecánico
router.get('/', roleMiddleware('admin', 'recepcionista', 'mecanico'), appointmentController.getAll);

// Ver cita por ID - Todos
router.get('/:id', roleMiddleware('admin', 'recepcionista', 'mecanico'), appointmentController.getById);

// Crear cita - Admin, Recepcionista
router.post('/', roleMiddleware('admin', 'recepcionista'), appointmentController.create);

// Cambiar estado - Admin, Recepcionista
router.patch('/:id/status', roleMiddleware('admin', 'recepcionista'), appointmentController.updateStatus);

// Cancelar cita - Admin, Recepcionista
router.patch('/:id/cancel', roleMiddleware('admin', 'recepcionista'), appointmentController.cancel);

module.exports = router;