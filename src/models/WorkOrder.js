const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('creada', 'en_progreso', 'pausada', 'completada', 'entregada', 'cancelada'),
    defaultValue: 'creada'
  },
  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notas_internas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  costo_total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  cita_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  vehiculo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mecanico_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  recepcionista_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'ordenes_trabajo',
  timestamps: true,
  hooks: {
    beforeCreate: async (order) => {
      if (!order.codigo) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        order.codigo = `OT-${year}${month}${day}-${random}`;
      }
    },
    beforeValidate: async (order) => {
      if (!order.codigo) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        order.codigo = `OT-${year}${month}${day}-${random}`;
      }
    }
  }
});

module.exports = WorkOrder;