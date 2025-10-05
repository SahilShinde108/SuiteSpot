const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // REPLACED expiresAt with startDate and endDate
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },

    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    }

}, {
    tableName: 'bookings'
});

module.exports = Booking;

