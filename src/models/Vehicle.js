const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  marca: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 1
    }
  },
  placa: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  vin: {
    type: DataTypes.STRING(17),
    allowNull: true,
    unique: true
  },
  color: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  kilometraje: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  }
}, {
  tableName: 'vehiculos',
  timestamps: true
});

module.exports = Vehicle;