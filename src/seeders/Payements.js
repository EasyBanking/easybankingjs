const { Account } = require("../models/Account");
const { Payment } = require("../models/Payment");
const { Transaction } = require("../models/Transaction");

const crypto = require("crypto");
const faker = require("@ngneat/falso");


async function seed() {
  const accounts = await Account.find().select("_id");
  for (let i = 0; i < 10; i++) {
    const trans = await Transaction.create({
      amount: faker.randAmount(),
      datetime: faker.randPastDate(),
      sender: accounts.at(faker.rand(accounts.map((x, i) => i))),
      status: ["APPROVED", "PENDING", "REJECTED"].at(faker.rand([0, 1, 2])),
      type: ["TRANSFER", "RECEIVE"].at(faker.rand([0, 1])),
    });

    const payemnts = await Payment.create({
      amount: faker.randAmount(),
      datetime: faker.randPastDate(),
      expireAt: faker.randSoonDate(),
      receivedAt: faker.randSoonDate(),
      receiver: accounts.at(faker.rand(accounts.map((x, i) => i))),
      sender: accounts.at(faker.rand(accounts.map((x, i) => i))),
      token: crypto.randomBytes(12),
      status: ["PENDING", "APPROVED", "REJECTED"].at(faker.rand([0, 1, 2])),
      transaction: trans._id,
    });
  }
}

// just name of the seeder
seed.label = "Payemnts Seeder";

module.exports = seed;
