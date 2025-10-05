const sequelize = require('../database');
const User = require('../models/user');
const bcrypt = require('bcrypt');

async function seedAdmin() {
    try {
        await sequelize.sync();

        const adminUser = await User.findOne({ where: { username: 'admin' } });

        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created successfully!');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        await sequelize.close();
    }
}

seedAdmin();