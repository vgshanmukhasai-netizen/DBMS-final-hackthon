const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  status: {
    type: DataTypes.ENUM('registered', 'cancelled', 'attended'),
    defaultValue: 'registered',
  },
  registered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'registrations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'student_id'],
    },
  ],
});

module.exports = Registration;
