const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  costo_estandar: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tiempo_estimado: {
    type: DataTypes.INTEGER, // en minutos
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'servicios',
  timestamps: true
});

module.exports = Service;