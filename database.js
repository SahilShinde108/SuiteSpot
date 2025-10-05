require('dotenv').config(); // Loads variables from .env file
const { Sequelize } = require('sequelize');

// Read database credentials from environment variables
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

// Create a new Sequelize instance to connect to the database
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql' // Specify that we are using MySQL
});

// Function to test the connection
async function testDbConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection to MySQL database has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
}

testDbConnection();

// Export the connection instance so other files can use it
module.exports = sequelize;

