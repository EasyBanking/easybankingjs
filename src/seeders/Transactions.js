const { Account } = require("../models/Account");
const { Transaction } = require("../models/Transaction");
const faker = require("@ngneat/falso");

async function seed() {
  const accounts = await Account.find().select("_id");

  for (let i = 0; i < 10; i++) {
    const transactions = await Transaction.create({
      amount: faker.randAmount(),
      datetime: faker.randPastDate(),
      receiver: accounts.at(faker.rand(accounts.map((x, i) => i))),
      sender: accounts.at(faker.rand(accounts.map((x, i) => i))),
      status: ["APPROVED", "PENDING", "REJECTED"].at(faker.rand([0, 1, 2])),
      type: ["TRANSFER", "RECEIVE"].at(faker.rand([0, 1])),
    });
  }
}

// just name of the seeder
seed.label = "Transactions Seeder";

module.exports = seed;
