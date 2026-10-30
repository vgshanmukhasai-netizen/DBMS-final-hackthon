const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  type: {
    type: DataTypes.ENUM('general', 'event', 'academic', 'urgent'),
    defaultValue: 'general',
  },
  target_type: {
    type: DataTypes.ENUM('all', 'department', 'year', 'section', 'selected'),
    defaultValue: 'all',
  },
  target_value: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'announcements',
  timestamps: true,
  underscored: true,
});

module.exports = Announcement;
