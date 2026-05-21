require('dotenv').config();
const { sequelize, User, Service } = require('./src/models');

async function resetDatabase() {
  try {
    console.log('🔄 Conectando a MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');
    
    console.log('🗑️  Eliminando todas las tablas...');
    await sequelize.drop();
    console.log('✅ Tablas eliminadas');
    
    console.log('🔨 Creando tablas nuevas...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas correctamente');
    
    // Crear datos iniciales
    console.log('👤 Creando usuarios por defecto...');
    
    // Admin
    await User.create({
      nombre: 'Administrador',
      email: 'admin@genesis.com',
      password: '123456',
      rol: 'admin'
    });
    
    // Mecánico
    await User.create({
      nombre: 'Mecánico Principal',
      email: 'mecanico@genesis.com',
      password: '123456',
      rol: 'mecanico'
    });
    
    // Recepcionista
    await User.create({
      nombre: 'Recepcionista',
      email: 'recepcion@genesis.com',
      password: '123456',
      rol: 'recepcionista'
    });
    
    // Cliente de prueba
    await User.create({
      nombre: 'Cliente Prueba',
      email: 'cliente@test.com',
      password: '123456',
      telefono: '987654321',
      rol: 'cliente'
    });
    
    console.log('✅ Usuarios creados');
    
    console.log('🔧 Creando servicios...');
    const services = [
      { nombre: 'Cambio de Aceite', descripcion: 'Cambio de aceite y filtro de motor', costo_estandar: 150.00, tiempo_estimado: 30 },
      { nombre: 'Balanceo de Llantas', descripcion: 'Balanceo de las 4 llantas', costo_estandar: 80.00, tiempo_estimado: 45 },
      { nombre: 'Alineación Computarizada', descripcion: 'Alineación de dirección computarizada', costo_estandar: 120.00, tiempo_estimado: 40 },
      { nombre: 'Cambio de Frenos Delanteros', descripcion: 'Cambio de pastillas de freno delanteras', costo_estandar: 250.00, tiempo_estimado: 60 },
      { nombre: 'Cambio de Frenos Posteriores', descripcion: 'Cambio de pastillas de freno posteriores', costo_estandar: 220.00, tiempo_estimado: 60 },
      { nombre: 'Diagnóstico Computarizado', descripcion: 'Escaneo completo del vehículo con scanner profesional', costo_estandar: 100.00, tiempo_estimado: 30 },
      { nombre: 'Servicio de Mantenimiento Mayor', descripcion: 'Servicio completo que incluye cambio de aceite, filtros, bujías y revisión general', costo_estandar: 500.00, tiempo_estimado: 180 },
      { nombre: 'Cambio de Batería', descripcion: 'Cambio de batería incluye instalación y prueba', costo_estandar: 350.00, tiempo_estimado: 20 },
      { nombre: 'Reparación de Aire Acondicionado', descripcion: 'Diagnóstico y recarga de gas del aire acondicionado', costo_estandar: 180.00, tiempo_estimado: 60 },
      { nombre: 'Lavado de Motor', descripcion: 'Lavado de motor con productos especializados', costo_estandar: 80.00, tiempo_estimado: 45 }
    ];
    
    for (const service of services) {
      await Service.create(service);
    }
    
    console.log('✅ Servicios creados');
    console.log('');
    console.log('🎉 Base de datos reiniciada exitosamente');
    console.log('');
    console.log('📝 DATOS DE ACCESO:');
    console.log('   ┌─────────────────┬──────────────────────────┬──────────┐');
    console.log('   │ Rol              │ Email                    │ Password │');
    console.log('   ├─────────────────┼──────────────────────────┼──────────┤');
    console.log('   │ Administrador    │ admin@genesis.com        │ 123456   │');
    console.log('   │ Mecánico         │ mecanico@genesis.com     │ 123456   │');
    console.log('   │ Recepcionista    │ recepcion@genesis.com    │ 123456   │');
    console.log('   │ Cliente          │ cliente@test.com         │ 123456   │');
    console.log('   └─────────────────┴──────────────────────────┴──────────┘');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

resetDatabase();