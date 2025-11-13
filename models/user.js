const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
    // --- THIS IS THE NEW PART ---
    id: {
        type: DataTypes.UUID,      
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true               
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

User.associate = (models) => {
    User.hasMany(models.Listing, {
        foreignKey: 'owner',
        as: 'Listings' // Use 'Listings' as the alias
    });
    User.hasMany(models.Booking, {
        foreignKey: 'guest',
        as: 'Bookings' // Use 'Bookings' as the alias
    });
    User.hasMany(models.Bill, {
        foreignKey: 'userId',
        as: 'Bills' // Use 'Bills' as the alias
    });
    User.hasMany(models.Review, {
        foreignKey: 'author',
        as: 'Reviews' // Use 'Reviews' as the alias
    });
};

module.exports = User;