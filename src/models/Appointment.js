const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false
  },
  descripcion_problema: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'en_progreso', 'completada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vehiculo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recepcionista_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'citas',
  timestamps: true
});

module.exports = Appointment;