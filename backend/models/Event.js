const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'General',
  },
  event_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  start_time: {
    type: DataTypes.STRING(20), // can accept HH:mm or HH:mm:ss
    allowNull: true,
  },
  end_time: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  venue: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  max_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 1,
    },
  },
  registration_deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  poster: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'upcoming',
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
  tableName: 'events',
  timestamps: true,
  underscored: true,
});

module.exports = Event;
