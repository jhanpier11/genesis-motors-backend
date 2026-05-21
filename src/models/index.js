const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Vehicle = require('./Vehicle');
const Appointment = require('./Appointment');
const WorkOrder = require('./WorkOrder');
const Service = require('./Service');
const WorkOrderDetail = require('./WorkOrderDetail');

// Relación User - Client
User.hasOne(Client, { foreignKey: 'user_id', as: 'clientProfile' });
Client.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relaciones existentes
User.hasMany(Appointment, { foreignKey: 'recepcionista_id', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'recepcionista_id', as: 'recepcionista' });

Client.hasMany(Vehicle, { foreignKey: 'cliente_id', as: 'vehicles' });
Vehicle.belongsTo(Client, { foreignKey: 'cliente_id', as: 'cliente' });

Client.hasMany(Appointment, { foreignKey: 'cliente_id', as: 'appointments' });
Appointment.belongsTo(Client, { foreignKey: 'cliente_id', as: 'cliente' });

Vehicle.hasMany(Appointment, { foreignKey: 'vehiculo_id', as: 'appointments' });
Appointment.belongsTo(Vehicle, { foreignKey: 'vehiculo_id', as: 'vehiculo' });

Vehicle.hasMany(WorkOrder, { foreignKey: 'vehiculo_id', as: 'workOrders' });
WorkOrder.belongsTo(Vehicle, { foreignKey: 'vehiculo_id', as: 'vehiculo' });

User.hasMany(WorkOrder, { foreignKey: 'mecanico_id', as: 'assignedOrders' });
WorkOrder.belongsTo(User, { foreignKey: 'mecanico_id', as: 'mecanico' });

Appointment.hasOne(WorkOrder, { foreignKey: 'cita_id', as: 'workOrder' });
WorkOrder.belongsTo(Appointment, { foreignKey: 'cita_id', as: 'cita' });

WorkOrder.hasMany(WorkOrderDetail, { foreignKey: 'orden_id', as: 'details' });
WorkOrderDetail.belongsTo(WorkOrder, { foreignKey: 'orden_id', as: 'workOrder' });

Service.hasMany(WorkOrderDetail, { foreignKey: 'servicio_id', as: 'orderDetails' });
WorkOrderDetail.belongsTo(Service, { foreignKey: 'servicio_id', as: 'service' });

module.exports = {
  sequelize,
  User,
  Client,
  Vehicle,
  Appointment,
  WorkOrder,
  Service,
  WorkOrderDetail
};