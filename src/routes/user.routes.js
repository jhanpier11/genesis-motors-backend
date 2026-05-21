const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Rutas de administración (solo admin)
router.get('/', roleMiddleware('admin'), userController.getAll);
router.get('/mechanics', roleMiddleware('admin', 'recepcionista'), userController.getMechanics);
router.post('/', roleMiddleware('admin'), userController.create);
router.put('/:id', roleMiddleware('admin'), userController.update);
router.delete('/:id', roleMiddleware('admin'), userController.delete);

// Rutas de perfil (cualquier usuario autenticado)
router.put('/profile/update', userController.updateProfile);
router.put('/change-password', userController.changePassword);

module.exports = router;