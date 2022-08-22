const { Urgent } = require("../models/Urgent");

const faker = require("@ngneat/falso");

const UrgentTypes = {
  INFO: "info",
  WARNING: "warning",
  DANGER: "danger",
  URGENT: "urgent",
};

async function seed() {
  for (let i = 0; i < 10; i++) {
    const Urgents = await Urgent.create({
      content: faker.randText(),
      viewed: faker.randBoolean(),
      type: ["info", "warning", "danger", "urgent"].at(
        faker.rand([0, 1, 2, 3])
      ),
      viewedAt: faker.randSoonDate(),
    });
  }
}

// just name of the seeder
seed.label = "Urgents Seeder";

module.exports = seed;
