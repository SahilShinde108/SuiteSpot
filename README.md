# ✨ SuiteSpot: Your Next Adventure Awaits! ✨

Welcome to SuiteSpot, the ultimate platform for discovering and booking unique accommodations! Whether you're a traveler seeking the perfect getaway or a host looking to share your space, SuiteSpot connects you with unforgettable experiences. Our intuitive platform makes listing, browsing, and booking a breeze, all powered by a robust and modern tech stack.

## 🚀 Features That Elevate Your Experience

*   **Seamless User Authentication**: Dive in with secure and easy registration, login, and logout, powered by Passport.js.
*   **Effortless Listing Management**: Hosts can effortlessly create, showcase, update, and manage their properties with a few clicks.
*   **Intelligent Booking System**: Find and reserve your dream stay with flexible date selections and real-time availability checks.
*   **Transparent Billing**: Automated bill generation for all confirmed bookings, keeping everything clear and organized.
*   **Dynamic Search & Filter**: Discover your ideal spot! Search by available dates, explore vibrant cities, or find listings near exciting festivals.
*   **Authentic Reviews**: Share your experiences and read genuine feedback from other travelers to make informed decisions.
*   **Smart Automation**: Pending bookings are automatically cancelled if not confirmed within 24 hours, ensuring fair availability for everyone.
*   **Stunning & Responsive Design**: Enjoy a beautiful and fluid user interface on any device, thanks to Bootstrap.

## 🛠️ Built with Cutting-Edge Technologies

SuiteSpot is crafted with a powerful combination of modern web technologies:

*   **Backend Powerhouse**: Node.js & Express.js for a fast, scalable, and efficient server-side.
*   **Reliable Database**: MySQL, managed with the elegant Sequelize ORM, ensuring data integrity and performance.
*   **Captivating Frontend**: EJS templating for dynamic content, styled beautifully with the versatility of Bootstrap.
*   **Fortified Security**: Passport.js for robust authentication, complemented by `bcrypt` for impenetrable password hashing.
*   **Smooth Sessions**: `express-session` and `connect-flash` for a seamless and informative user journey.
*   **Cloud-Powered Media**: Cloudinary (integrated via `cloudConfig.js`) for efficient and scalable image storage.
*   **Automated Efficiency**: `node-cron` handles background tasks, keeping the platform running smoothly.
*   **Developer-Friendly Tools**: `dotenv` for environment variables, `method-override` for RESTful API support, and `ejs-mate` for layout management.

## ⚙️ Quick Start: Get SuiteSpot Running!

Ready to explore SuiteSpot? Follow these simple steps to set up your local development environment:

### 1. Clone the Treasure Trove

```bash
git clone <repository-url>
cd SuiteSpot
```

### 2. Install the Essentials

```bash
npm install
```

### 3. Database Magic: MySQL Setup

SuiteSpot thrives on MySQL. Let's get it connected:

*   **Create Your Database**: Set up a new MySQL database (e.g., `suitespot`).
*   **Secure Your `.env`**: Create a `.env` file in the project root and fill in your credentials and API keys:

    ```
    DB_HOST=localhost
    DB_USER=your_mysql_username
    DB_PASSWORD=your_mysql_password
    DB_NAME=suitespot
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    # Add any other necessary environment variables here
    ```

### 4. Initialize Your Data (Optional, but Recommended!)

Bring your database to life with migrations and seed data:

```bash
# If you have Sequelize migrations:
# npx sequelize db:migrate

# To populate with initial data (check your init/index.js for details):
# node init/index.js
```

### 5. Ignite the Server!

```bash
npm start
```

Your SuiteSpot adventure begins! Open your browser and navigate to `http://localhost:8080`.

## 🗺️ Navigating SuiteSpot: A User's Guide

1.  **Join the Community**: Easily register or log in to your account.
2.  **Discover & Explore**: Browse a diverse range of properties on the homepage.
3.  **Become a Host**: List your own unique space and share it with the world.
4.  **Book Your Stay**: Select your perfect listing, choose dates, and confirm your booking.
5.  **Manage Your World**: Keep track of your bookings and associated bills with ease.
6.  **Smart Search**: Utilize powerful filters to pinpoint listings by dates, city, or festival.

## 🗄️ Behind the Scenes: Database Schema

Here's a glimpse into the organized structure of SuiteSpot's data:

*   **User Model**: The heart of our community.
    *   `User.hasMany(Listing)`: One user, many amazing listings.
    *   `User.hasMany(Review)`: One user, many insightful reviews.
    *   `User.hasMany(Booking)`: One user, many exciting bookings.
    *   `User.hasMany(Bill)`: One user, many clear bills.

*   **Listing Model**: Your next favorite place to stay.
    *   `Listing.belongsTo(User, { as: 'owner' })`: Every listing has a proud owner.
    *   `Listing.hasMany(Review)`: Many reviews help paint a picture of each listing.
    *   `Listing.hasMany(Booking)`: A popular spot can have many bookings.

*   **Review Model**: Your voice, heard.
    *   `Review.belongsTo(Listing)`: Each review is tied to a specific listing.
    *   `Review.belongsTo(User, { as: 'author' })`: Every review has an author.

*   **Booking Model**: Your confirmed adventure.
    *   **Key Details**: `startDate`, `endDate`, `totalPrice`, and `status` (pending, confirmed, cancelled).
    *   `Booking.belongsTo(User, { as: 'guest' })`: Each booking is made by a specific user (the guest).
    *   `Booking.belongsTo(Listing)`: Each booking is for a specific listing.
    *   `Booking.hasOne(Bill)`: Each booking comes with its own bill.

*   **Bill Model**: Keeping things clear.
    *   `Bill.belongsTo(Booking)`: Bills are directly linked to bookings.
    *   `Bill.belongsTo(User)`: Bills are associated with the user who made the booking.

## 📂 Project Structure

```
├── .env
├── .gitignore
├── README.md
├── app.js
├── cloudConfig.js
├── config\
│   └── config.json
├── controllers\
│   ├── bookings.js
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
├── database.js
├── init\
│   ├── data.js
│   ├── index.js
│   └── seedAdmin.js
├── middleware.js
├── models\
│   ├── bill.js
│   ├── booking.js
│   ├── index.js
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── package-lock.json
├── package.json
├── public\
│   ├── css\
│   │   ├── rating.css
│   │   └── style.css
│   └── js\
│       ├── map.js
│       └── script.js
├── routes\
│   ├── billing.js
│   ├── booking.js
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── schema.js
├── utils\
│   ├── ExpressError.js
│   └── wrapAsync.js
└── views\
    ├── bills\
    │   ├── index.ejs
    │   └── show.ejs
    ├── bookings\
    │   ├── all-bookings-owner.ejs
    │   ├── all-bookings.ejs
    │   └── index.ejs
    ├── error.ejs
    ├── includes\
    │   ├── flash.ejs
    │   ├── footer.ejs
    │   └── navbar.ejs
    ├── layouts\
    │   └── boilerplate.ejs
    ├── listings\
    │   ├── admin-dashboard.ejs
    │   ├── edit.ejs
    │   ├── index.ejs
    │   ├── my-listings.ejs
    │   ├── new.ejs
    │   └── show.ejs
    └── users\
        ├── index.ejs
        ├── login.ejs
        └── signup.ejs
```

## 🤝 Contribute to SuiteSpot

We welcome your creativity and expertise! If you find a bug, have a brilliant idea, or want to enhance SuiteSpot, please don't hesitate to submit a pull request or open an issue. Let's build something amazing together!

## Author
Sahil Shinde