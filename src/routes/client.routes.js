const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Ver clientes - Admin, Recepcionista, Mecánico
router.get('/', roleMiddleware('admin', 'recepcionista', 'mecanico'), clientController.getAll);

// Ver cliente por ID - Todos
router.get('/:id', roleMiddleware('admin', 'recepcionista', 'mecanico'), clientController.getById);

// Crear/Editar/Eliminar - Admin, Recepcionista
router.post('/', roleMiddleware('admin', 'recepcionista'), clientController.create);
router.put('/:id', roleMiddleware('admin', 'recepcionista'), clientController.update);
router.delete('/:id', roleMiddleware('admin'), clientController.delete);

module.exports = router;