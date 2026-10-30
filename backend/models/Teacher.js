const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  faculty_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Faculty',
  },
}, {
  tableName: 'teachers',
  timestamps: true,
  underscored: true,
});

module.exports = Teacher;
