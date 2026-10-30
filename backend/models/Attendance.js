const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
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
    type: DataTypes.ENUM('present', 'absent'),
    defaultValue: 'absent',
  },
  marked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  marked_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'attendance',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'student_id'],
    },
  ],
});

module.exports = Attendance;
