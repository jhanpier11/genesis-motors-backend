require('dotenv').config();
const { sequelize } = require('./src/models');

async function testConnection() {
  try {
    console.log('Probando conexión a MySQL...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('Puerto:', process.env.DB_PORT || 3306);
    console.log('Base de datos:', process.env.DB_NAME || 'genesis_motors');
    
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a MySQL');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();