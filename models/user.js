const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
    // --- THIS IS THE NEW PART ---
    id: {
        type: DataTypes.UUID,          // Set the data type to UUID
        defaultValue: DataTypes.UUIDV4, // Automatically generate a UUID
        primaryKey: true               // Mark it as the primary key
    },
    // --- END OF NEW PART ---
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'customer'
    }
}, {
    tableName: 'users'
});

module.exports = User;