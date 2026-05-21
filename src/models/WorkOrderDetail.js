const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkOrderDetail = sequelize.define('WorkOrderDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orden_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  servicio_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_cobrado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tiempo_real: {
    type: DataTypes.INTEGER, // en minutos
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'detalle_orden',
  timestamps: true
});

module.exports = WorkOrderDetail;