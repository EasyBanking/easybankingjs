const { User } = require("../models/User");
const { Account } = require("../models/Account");
const { hashSync } = require("bcryptjs");
const faker = require("@ngneat/falso");

async function createAccount() {
  return await Account.create({
    firstName: faker.randFirstName(),
    lastName: faker.randLastName(),
    dateOfBirth: faker.randPastDate(),
    addresse: faker.randAddress().street,
    atmPin: "1234",
    nationalId: faker.randNumber({ max: 14 }),
    balance: faker.randNumber({ max: 100 }),
    status: "active",
  });
}

async function seed() {
  const len = 4;
  const users = [];

  for (let i = 0; i < len; i++) {
    let account = await createAccount();
    users.push({
      username: faker.randUserName(),
      email: faker.randEmail(),
      password: hashSync("password"),
      security: {
        question: faker.randText(),
        answer: faker.randText(),
      },
      account: account._id,
      isAcitive: true,
    });
  }

  await User.insertMany(users);
}

// just name of the seeder
seed.label = "Users Seeder";

module.exports = seed;
