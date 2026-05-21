const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Ver servicios - Todos
router.get('/', roleMiddleware('admin', 'recepcionista', 'mecanico'), serviceController.getAll);

// Crear/Editar/Eliminar - Solo Admin
router.post('/', roleMiddleware('admin'), serviceController.create);
router.put('/:id', roleMiddleware('admin'), serviceController.update);
router.delete('/:id', roleMiddleware('admin'), serviceController.delete);

module.exports = router;