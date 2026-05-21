const express = require('express');
const router = express.Router();
const clientPortalController = require('../controllers/clientPortal.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Perfil
router.get('/profile', roleMiddleware('cliente'), clientPortalController.getProfile);

// Vehículos
router.get('/vehicles', roleMiddleware('cliente'), clientPortalController.getMyVehicles);
router.post('/vehicles', roleMiddleware('cliente'), clientPortalController.addMyVehicle);

// Citas
router.get('/appointments', roleMiddleware('cliente'), clientPortalController.getMyAppointments);
router.post('/appointments', roleMiddleware('cliente'), clientPortalController.createMyAppointment);

// Órdenes
router.get('/orders', roleMiddleware('cliente'), clientPortalController.getMyWorkOrders);

module.exports = router;