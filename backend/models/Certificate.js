const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Certificate = sequelize.define('Certificate', {
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
  certificate_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  issued_by: {
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
  tableName: 'certificates',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'student_id'],
    },
  ],
});

module.exports = Certificate;
