const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'genesis_motors',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: false, // Desactiva logs SQL en consola
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 60000 // Útil para Railway
  }
});

module.exports = sequelize;