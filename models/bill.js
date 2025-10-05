const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const Bill = sequelize.define('Bill', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue'),
    allowNull: false,
    defaultValue: 'pending',
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Bill;