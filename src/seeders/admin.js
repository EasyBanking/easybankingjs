const { User } = require("../models/User");

async function seed() {
  await User.create({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    email: process.env.ADMIN_EMAIL,
    role: "ADMIN",
    security: {
      question: "What is your favorite color?",
      answer: "blue",
    },
    isAcitive: true,
  });
}

// just name of the seeder
seed.label = "Admin Seeder";

module.exports = seed;
