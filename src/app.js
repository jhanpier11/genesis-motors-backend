const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const clientRoutes = require('./routes/client.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const workOrderRoutes = require('./routes/workOrder.routes');
const serviceRoutes = require('./routes/service.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const clientPortalRoutes = require('./routes/clientPortal.routes');

const app = express();

// Configurar CORS (acepta localhost y la URL de Netlify si se configura)
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'https://genesis-motors-frontend.vercel.app', // <-- Agrega tu URL de Vercel aquí directamente
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/client-portal', clientPortalRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Genesis Motors funcionando correctamente',
    version: '1.0.0'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

module.exports = app;