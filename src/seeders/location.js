const { Location } = require("../models/Location");

const locationsDefault = [
  {
    address: "Zaqazyq",
    latitude: 30.515371451296918,
    longitude: 31.172064200162648,
  },
  {
    address: "banha",
    latitude: 30.498806913005264,
    longitude: 31.18579711004518,
  },
  {
    address: "nozha",
    latitude: 30.120272494882062,
    longitude: 31.353017685313553,
  },
  {
    address: "west cairo",
    latitude: 30.093296631006186,
    longitude: 31.32842295462678,
  },
  {
    address: "east cairo",
    latitude: 30.109078411560674,
    longitude: 31.646960185313546,
  },
  {
    address: "AL-Rehab city",
    latitude: 30.06093288886553,
    longitude: 31.49216881600032,
  },
];

async function seed() {
  await Location.insertMany(locationsDefault);
}

// just name of the seeder
seed.label = "Location Seeder";

module.exports = seed;
