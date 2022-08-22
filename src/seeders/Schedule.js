const { Schedule } = require("../models/Schedule");
const { Location } = require("../models/Location");

const faker = require("@ngneat/falso");

async function seed() {

  const locations = await Location.find().select("_id");

  for (let i = 0; i < 10; i++) {
    const schedules = await Schedule.create({
      date: faker.randSoonDate(),
      location_id: locations.at(faker.rand(locations.map((x, i) => i)))._id,
      priority: faker.randNumber(),
      type: ["teller", "serivce", "other"].at(faker.rand([0, 1, 2])),
    });
  }
}

// just name of the seeder
seed.label = "schedules Seeder";

module.exports = seed;
