const { Location } = require("../models/Location");
const faker = require("@ngneat/falso");

async function seed() {
  const len = 10;
  const locations = [];

  for (let i = 0; i < len; i++) {
    locations.push({
      address: faker.randAddress().street,
      latitude: faker.randLatitude(),
      longitude: faker.randLongitude(),
    });
  }

  await Location.insertMany(locations);
}

// just name of the seeder
seed.label = "Location Seeder";

module.exports = seed;
