const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AnnouncementRecipient = sequelize.define('AnnouncementRecipient', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  announcement_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'announcements',
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
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'announcement_recipients',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['announcement_id', 'student_id'],
    },
  ],
});

module.exports = AnnouncementRecipient;
