const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Student = sequelize.define('Student', {
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
  student_id: {
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
  year_of_study: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 6,
    },
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
}, {
  tableName: 'students',
  timestamps: true,
  underscored: true,
});

module.exports = Student;
