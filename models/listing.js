const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Listing = sequelize.define('Listing', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    festivalName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nearestLocation1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    distance1: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nearestLocation2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    distance2: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nearestLocation3: {
        type: DataTypes.STRING,
        allowNull: true
    },
    distance3: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nearestLocation4: {
        type: DataTypes.STRING,
        allowNull: true
    },
    distance4: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // THIS IS THE NEW FIELD to store map coordinates from the Mapbox API
    geometry: {
        type: DataTypes.JSON,
        allowNull: true // It's good practice to allow this to be null
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    }
}, {
    tableName: 'listings'
});

module.exports = Listing;