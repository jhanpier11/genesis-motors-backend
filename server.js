require('dotenv').config();
const app = require('./src/app');
const { sequelize, User, Service } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Sincronizar modelos (crea/actualiza tablas)
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas.');

    // Crear datos por defecto si no existen (solo en local o primera vez)
    const adminExists = await User.findOne({ where: { email: 'admin@genesis.com' } });
    if (!adminExists) {
      await User.create({
        nombre: 'Administrador',
        email: 'admin@genesis.com',
        password: '123456',
        rol: 'admin'
      });
      await User.create({
        nombre: 'Mecánico Principal',
        email: 'mecanico@genesis.com',
        password: '123456',
        rol: 'mecanico'
      });
      await User.create({
        nombre: 'Recepcionista',
        email: 'recepcion@genesis.com',
        password: '123456',
        rol: 'recepcionista'
      });
      console.log('✅ Usuarios por defecto creados.');
    }

    // Crear servicios si no hay
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      const servicios = [
        { nombre: 'Cambio de Aceite', descripcion: 'Cambio de aceite y filtro', costo_estandar: 450.00, tiempo_estimado: 30 },
        { nombre: 'Balanceo de Llantas', descripcion: 'Balanceo de las 4 llantas', costo_estandar: 350.00, tiempo_estimado: 45 },
        { nombre: 'Alineación', descripcion: 'Alineación computarizada', costo_estandar: 500.00, tiempo_estimado: 40 },
        { nombre: 'Cambio de Frenos', descripcion: 'Cambio de pastillas de freno', costo_estandar: 800.00, tiempo_estimado: 60 },
        { nombre: 'Diagnóstico Computarizado', descripcion: 'Escaneo completo', costo_estandar: 300.00, tiempo_estimado: 30 }
      ];
      for (const s of servicios) {
        await Service.create(s);
      }
      console.log('✅ Servicios por defecto creados.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();